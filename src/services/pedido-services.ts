import * as z from "zod"
import { prisma } from "@/lib/db"
import OpenAI from "openai"
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages.mjs"
import { CoincidenceDAO, CoincidenceFormValues, getCoincidencesDAO } from "./coincidence-services"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import pgvector from 'pgvector/utils';
import { Pedido } from "@prisma/client"
import { InmobiliariaDAO, getInmobiliariaDAO, getInmobiliariaDAOByslug } from "./inmobiliaria-services"

export type PedidoDAO = {
  id:  string
  number:  number
	text:  string
  phone?:  string
	contacto?:  string
	operacion?:  string
	tipo?:  string
	presupuesto?:  string
	zona?:  string
	dormitorios?:  string
	caracteristicas?:  string
  openaiJson?:  string
  cantCoincidencias?:  number
	createdAt:  Date
	updatedAt:  Date
}

export const pedidoFormSchema = z.object({
	text: z.string({required_error: "Text is required."}),
  phone: z.string({required_error: "Phone is required."}),
	contacto: z.string().optional(),
	operacion: z.string().optional(),
	tipo: z.string().optional(),
	presupuesto: z.string().optional(),
	zona: z.string().optional(),
	dormitorios: z.string().optional(),
	caracteristicas: z.string().optional(),  
})
export type PedidoFormValues = z.infer<typeof pedidoFormSchema>

export async function getPedidosDAO(slug: string): Promise<PedidoDAO[]> {
  let inmobiliariaId= ""
  console.log("slug:", slug);
  
  if (slug && slug !== "ALL") {
    const inmo= await getInmobiliariaDAOByslug(slug)
    console.log("setting inmobiliariaId:", inmo.id)
    
    inmobiliariaId= inmo.id
  }
  const found = await prisma.pedido.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      coincidences: {
        include: {
          property: true
        }
      }   
    }      
  })
 
  const res: PedidoDAO[] = []
  found.forEach((item) => {
    const pedido: PedidoDAO = item as PedidoDAO
    pedido.cantCoincidencias = item.coincidences.length
    if (inmobiliariaId) {
      const coincidences = item.coincidences.filter((coincidence) => {
        return coincidence.property.inmobiliariaId === inmobiliariaId
      })
      pedido.cantCoincidencias = coincidences.length
    }
    res.push(pedido)
  })
  
  return res
}
  
export async function getPedidoDAO(id: string) {  
  const found = await prisma.pedido.findUnique({
    where: {
      id
    },
    include: {
      coincidences: true      
    }
  })
  if (!found) {
    throw new Error("Pedido not found")
  }

  const res: PedidoDAO = found as PedidoDAO
  res.cantCoincidencias = found.coincidences.length

  return res
}

export async function getLastPedidoDAO(): Promise<PedidoDAO | null> {
  const found = await prisma.pedido.findFirst({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      coincidences: true      
    }
  })

  if (!found) {
    return null
  }

  const res: PedidoDAO = found as PedidoDAO
  res.cantCoincidencias = found.coincidences.length

  return res
}

export async function getLastPedidoDAOByInmobiliaria(inmobiliariaId: string) {
  const found = await prisma.pedido.findFirst({
    where: {
      coincidences: {
        some: {
          property: {
            inmobiliariaId
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
  })
  return found as PedidoDAO
}

export async function createPedido(data: PedidoFormValues) {
  const created = await prisma.pedido.create({
    data
  })

  await runThread(created.id)

  return created
}

export async function updatePedido(id: string, data: PedidoFormValues) {
  const updated = await prisma.pedido.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function deletePedido(id: string) {
  const deleted = await prisma.pedido.delete({
    where: {
      id
    },
  })
  return deleted
}
    
/**
 * OpenAI functions
 */
export async function runThread(pedidoId: string) {
  console.log("running thread for pedido:", pedidoId)
  
  const OPENAI_ASSISTANT_ID= process.env.OPENAI_ASSISTANT_ID
  if (!OPENAI_ASSISTANT_ID) {
    throw new Error("OPENAI_ASSISTANT_ID is not defined")
  }

  const pedidoDAO= await getPedidoDAO(pedidoId)
  const openai = new OpenAI();

  console.log("creating thread")  
  const createdThread = await openai.beta.threads.create({
    messages: [
      {
        "role": "user",
        "content": pedidoDAO.text,
      }
    ]
  })

  console.log("creating run")
  let run = await openai.beta.threads.runs.create(
    createdThread.id, 
    { 
      assistant_id: OPENAI_ASSISTANT_ID,
      model: "gpt-3.5-turbo-1106",
    }
  )

  const runId= run.id
  let status= run.status
  console.log("run.status", status)    
  while (true) {
    run = await openai.beta.threads.runs.retrieve(
      createdThread.id,
      runId
    )
    status= run.status
    console.log("run.status", status)    
    if (status === "completed" || status === "failed" || status === "cancelled" || status === "expired") {
      break
    }
    const timeToSleep= 1
    console.log("sleeping...")
    await new Promise(resolve => setTimeout(resolve, timeToSleep * 1000))
  }

  if (status === "failed" || status === "cancelled" || status === "expired") {
    throw new Error("run is not 'completed'")
  }

  const threadMessages = await openai.beta.threads.messages.list(run.thread_id)
  
  const updates = threadMessages.data.map(async (message: ThreadMessage) => {
    if (message.role === "assistant" && message.content[0].type === "text") {
      const openaiJson = message.content[0].text.value
      let jsonObject
      
      try {
        jsonObject = JSON.parse(openaiJson)
      } catch (error) {
        console.error("Error parsing json:", error)
        return null
      }
      
      const operacion = jsonObject.operacion ? jsonObject.operacion.toUpperCase() : undefined
      
      try {
        const updated = await prisma.pedido.update({
          where: {
            id: pedidoId
          },
          data: {          
            openaiJson,
            contacto: jsonObject.contacto || undefined,
            operacion: operacion,
            tipo: jsonObject.tipo || undefined,
            presupuesto: jsonObject.presupuesto || undefined,
            zona: jsonObject.zona || undefined,
            dormitorios: jsonObject.dormitorios || undefined,
            caracteristicas: jsonObject.caracteristicas || undefined,          
          }
        })
        
        console.log("updated:")
        console.log(updated)
        return updated
      } catch (error) {
        console.error("Error updating:", error)
        return null
      }
    }
  })
  
  const results = await Promise.all(updates)
  
  const successfulUpdates = results.filter(result => result !== null)
  
  console.log("All updates completed:", successfulUpdates)
  return successfulUpdates.length > 0
}
   
  
export async function createCoincidencesProperties(pedidoId: string) {
  const pedido= await getPedidoDAO(pedidoId)
  console.log("pedido (createCoincidencesProperties):")  
  console.log(pedido)

  await removeCoincidences(pedidoId)
  

  const caracteristicas= pedido.caracteristicas
  const operacion= pedido.operacion
  const tipo= pedido.tipo
  if (!tipo || tipo === "N/D") {
    console.log("El pedido no tiene tipo");    
    return []
  }
  if (!operacion || operacion === "N/D") {
    console.log("El pedido no tiene operacion");    
    return []
  }
  if (!caracteristicas || caracteristicas === "N/D") {
    console.log("El pedido no tiene caracteristicas");    
    return []
  }
  const similarityResult= await similaritySearch(tipo, operacion, caracteristicas)
  console.log("similarityResult length:", similarityResult.length);
  
  // iterate over similarityResult and create coincidences
  const coincidences: CoincidenceFormValues[]= []
  similarityResult.forEach((item) => {
    const coincidence: CoincidenceFormValues= {
      number: 1,
      // round distance to 2 decimals
      distance: Math.round(item.distance * 100) / 100,
      pedidoId: pedido.id,
      propertyId: item.id,
    }
    coincidences.push(coincidence)
  })
  const createdCoincidences = await prisma.coincidence.createMany({
    data: coincidences
  })

  await updateCoincidencesNumbers(pedidoId)

  return createdCoincidences  
}

async function removeCoincidences(pedidoId: string) {
  const coincidences = await getCoincidencesDAO(pedidoId);
  console.log("cant coincidences:", coincidences.length);
  
  for (const coincidence of coincidences) {
    console.log("deleting coincidence:", coincidence.id);
    try {
      await prisma.coincidence.delete({
        where: {
          id: coincidence.id
        }
      });
    } catch (error) {
      console.error("Error deleting coincidence:", coincidence.id, error);
    }
  }
}

export async function updateCoincidencesNumbers(pedidoId: string) {
  const coincidences = await getCoincidencesDAO(pedidoId);
  console.log("cant coincidences:", coincidences.length);
  
  const coincidencesByClient: {[key: string]: CoincidenceDAO[]} = {};
  coincidences.forEach((coincidence) => {
    const inmobiliariaId = coincidence.property.inmobiliariaId
    if (!coincidencesByClient[inmobiliariaId]) {
      coincidencesByClient[inmobiliariaId] = [];
    }
    coincidencesByClient[inmobiliariaId].push(coincidence);
  });
  console.log("coincidencesByClient:", coincidencesByClient);
  
  for (const inmobiliariaId of Object.keys(coincidencesByClient)) {
    const coincidencesForClient = coincidencesByClient[inmobiliariaId];
    coincidencesForClient.sort((a, b) => a.distance - b.distance);
    
    for (let index = 0; index < coincidencesForClient.length; index++) {
      const coincidence = coincidencesForClient[index];
      const number = index + 1;
      console.log("updating coincidence:", coincidence.id, "with number:", number);
      
      try {
        await prisma.coincidence.update({
          where: {
            id: coincidence.id
          },
          data: {
            number
          }
        });
      } catch (error) {
        console.error("Error updating coincidence:", coincidence.id, error);
        // Aquí puedes decidir si lanzar el error o manejarlo de otra manera.
      }
    }
  }
}


export async function similaritySearch(tipo: string, operacion: string, caracteristicas: string, limit: number = 10) : Promise<SimilaritySearchResult[]> {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    verbose: true,
  })

  const tipoConMayuscula= tipo.charAt(0).toUpperCase() + tipo.slice(1)

  const vector= await embeddings.embedQuery(caracteristicas)
  const embedding = pgvector.toSql(vector)

  let result: SimilaritySearchResult[]= []
  if (operacion === "VENTA" || operacion === "VENDER" || operacion === "COMPRA" || operacion === "COMPRAR") {
    result = await prisma.$queryRaw`
      SELECT id, titulo, tipo, "enAlquiler", "enVenta", dormitorios, zona, "precioVenta", "precioAlquiler", "monedaVenta", "monedaAlquiler", "url", "inmobiliariaId", embedding <-> ${embedding}::vector as distance 
      FROM "Property" 
      WHERE "tipo" = ${tipoConMayuscula} AND "enVenta" = 'si' 
      ORDER BY distance 
      LIMIT ${limit}`
  }
  else if (operacion === "ALQUILER" || operacion === "ALQUILAR" || operacion === "RENTA" || operacion === "RENTAR") {
    result = await prisma.$queryRaw`
      SELECT id, titulo, tipo, "enAlquiler", "enVenta", dormitorios, zona, "precioVenta", "precioAlquiler", "monedaVenta", "monedaAlquiler", "url", "inmobiliariaId", embedding <-> ${embedding}::vector as distance 
      FROM "Property" 
      WHERE "tipo" = ${tipoConMayuscula} AND "enAlquiler" = 'si' 
      ORDER BY distance 
      LIMIT ${limit}`
  }

  

  result.map((item) => {
    console.log(`${item.titulo}: ${item.distance}`)    
  })

  return result
}

export type SimilaritySearchResult = {
  id: string
  titulo: string
  tipo: string
  enAlquiler: string
  enVenta: string
  monedaVenta: string
  monedaAlquiler: string
  dormitorios: string
  zona: string
  precioVenta: string
  precioAlquiler: string
  url: string
  clientId: string
  distance: number
}
