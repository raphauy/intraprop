import * as z from "zod"
import { prisma } from "@/lib/db"
import OpenAI from "openai"
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages.mjs"
import { CoincidenceDAO, CoincidenceFormValues, getCoincidencesDAO } from "./coincidence-services"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import pgvector from 'pgvector/utils';
import { Pedido } from "@prisma/client"
import { InmobiliariaDAO, getInmobiliariaDAO, getInmobiliariaDAOByslug } from "./inmobiliaria-services"
import { distanceToPercentage } from "@/lib/utils"
import { getValue } from "./config-services"

export type PedidoDAO = {
  id:  string
  number:  number
	text:  string
  phone?:  string
	contacto?:  string
	operacion?:  string
	tipo?:  string
	presupuesto?:  string
  presupuestoMin?:  number
  presupuestoMax?:  number
  presupuestoLog?:  string
  presupuestoMoneda?:  string
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
  presupuestoMin: z.number().optional(),
  presupuestoMax: z.number().optional(),
  presupuestoLog: z.string().optional(),
  presupuestoMoneda: z.string().optional(),
	zona: z.string().optional(),
	dormitorios: z.string().optional(),
	caracteristicas: z.string().optional(),  
})
export type PedidoFormValues = z.infer<typeof pedidoFormSchema>

export async function getPedidosDAO(slug: string): Promise<PedidoDAO[]> {

  const PEDIDOS_RESULTS= await getValue("PEDIDOS_RESULTS")
  let pedidosResults= 100
  if(PEDIDOS_RESULTS) pedidosResults= parseInt(PEDIDOS_RESULTS)
  else console.log("PEDIDOS_RESULTS not found")

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
    },
    where: {
      caracteristicas: {
        not: null,
      },
      AND: [
        {
          caracteristicas: {
            not: ""
          }
        },
        {
          caracteristicas: {
            not: "N/D"
          }
        }
      ],
    },
    take: pedidosResults
  })
 
  const res: PedidoDAO[] = []
  found.filter((item) => ((item.operacion !== "" && item.operacion !== "N/D") || (item.tipo !== "" && item.tipo !== "N/D")))
  .forEach((item) => {
    const pedido: PedidoDAO = item as PedidoDAO
    const cantCoincidenciasChecked= item.coincidences.filter((coincidence) => {return coincidence.state === "checked"})
    pedido.cantCoincidencias = cantCoincidenciasChecked.length
    if (inmobiliariaId) {
      const coincidences = item.coincidences.filter((coincidence) => {
        return coincidence.property.inmobiliariaId === inmobiliariaId && coincidence.state === "checked"
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
  
  const OPENAI_ASSISTANT_ID= process.env.OPENAI_JSON_ASSISTANT_ID
  if (!OPENAI_ASSISTANT_ID) {
    throw new Error("OPENAI_JSON_ASSISTANT_ID is not defined")
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
//      model: "gpt-3.5-turbo-1106",
      model: "gpt-4-1106-preview",
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
        console.log("openaiJson:", openaiJson)

        const escapedJson = cleanJsonString(openaiJson)
        jsonObject = JSON.parse(escapedJson)
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

function cleanJsonString(jsonString: string) {
    // Elimina backticks al principio y al final de la cadena
    return jsonString.replace(/^```json\n|\n```$/g, '');
}

export async function createCoincidencesProperties(pedidoId: string) {
  const pedido= await getPedidoDAO(pedidoId)
  console.log("pedido (createCoincidencesProperties):")  
  console.log(pedido)

  await removeCoincidences(pedidoId)
  

  const caracteristicas= pedido.caracteristicas
  if (!caracteristicas) {
    console.log("caracteristicas is null")
    return null
  }
  const operacion= pedido.operacion || "N/D"
  const tipo= pedido.tipo || "N/D"
  const similarityResult= await similaritySearchV2(tipo, operacion, caracteristicas)
  console.log("similarityResult length:", similarityResult.length);
  
  // iterate over similarityResult and create coincidences
  const coincidences: CoincidenceFormValues[]= []
  similarityResult.forEach((item) => {
    const coincidence: CoincidenceFormValues= {
      number: 0,
      // round distance to 2 decimals
      distance: Math.round(item.distance * 100) / 100,
      score: distanceToPercentage(item.distance),
      pedidoId: pedido.id,
      propertyId: item.id,
    }
    coincidences.push(coincidence)
  })
  const createdCoincidences = await prisma.coincidence.createMany({
    data: coincidences
  })

//  await updateCoincidencesNumbers(pedidoId)

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
  const coincidences = await getCoincidencesDAO(pedidoId, "checked")
  console.log("cant coincidences:", coincidences.length)
  
  const coincidencesByClient: {[key: string]: CoincidenceDAO[]} = {}
  coincidences.forEach((coincidence) => {
    const inmobiliariaId = coincidence.property.inmobiliariaId
    if (!coincidencesByClient[inmobiliariaId]) {
      coincidencesByClient[inmobiliariaId] = []
    }
    coincidencesByClient[inmobiliariaId].push(coincidence)
  });
  
  for (const inmobiliariaId of Object.keys(coincidencesByClient)) {
    const coincidencesForClient = coincidencesByClient[inmobiliariaId]
    coincidencesForClient.sort((a, b) => a.distance - b.distance)
    
    //const limit = Math.min(3, coincidencesForClient.length)
    const limit= coincidencesForClient.length

    for (let index = 0; index < limit; index++) {
      const coincidence = coincidencesForClient[index]
      const number = index + 1
      console.log("updating coincidence:", coincidence.id, "with number:", number)
      
      try {
        await prisma.coincidence.update({
          where: {
            id: coincidence.id,
            state: "checked"
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


export async function similaritySearchV2(tipo: string, operacion: string, caracteristicas: string) : Promise<SimilaritySearchResult[]> {
  const LIMIT_RESULTS= await getValue("LIMIT_RESULTS")
  let limit= 10
  if(LIMIT_RESULTS) limit= parseInt(LIMIT_RESULTS)
  else console.log("LIMIT_RESULTS not found")

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    verbose: true,
  })
  let result: SimilaritySearchResult[]= []

  const esCasa= tipo && tipo.toLowerCase().includes("casa")
  const esApartamento= tipo && (tipo.toLowerCase().includes("apartamento") || tipo.toLowerCase().includes("apto") || tipo.toLowerCase().includes("departamento") || tipo.toLowerCase().includes("depto"))
  const esVenta= operacion.toLocaleLowerCase() === "venta" || operacion.toLocaleLowerCase() === "vender" || operacion.toLocaleLowerCase() === "compra" || operacion.toLocaleLowerCase() === "comprar"
  const esAlquiler= operacion.toLocaleLowerCase() === "alquiler" || operacion.toLocaleLowerCase() === "alquilar" || operacion.toLocaleLowerCase() === "renta" || operacion.toLocaleLowerCase() === "rentar"

  const vector= await embeddings.embedQuery(caracteristicas)
  const embedding = pgvector.toSql(vector)

  if (esCasa && esVenta) {
    result = await prisma.$queryRaw`
      SELECT id, tipo, "enAlquiler", "enVenta", dormitorios, zona, "precioVenta", "precioAlquiler", "monedaVenta", "monedaAlquiler", "url", "inmobiliariaId", embedding <-> ${embedding}::vector as distance 
      FROM "Property" 
      WHERE LOWER("tipo") = 'casa' AND LOWER("enVenta") = 'si'
      ORDER BY distance 
      LIMIT ${limit}`
  } else if (esCasa && esAlquiler) {
    result = await prisma.$queryRaw`
      SELECT id, tipo, "enAlquiler", "enVenta", dormitorios, zona, "precioVenta", "precioAlquiler", "monedaVenta", "monedaAlquiler", "url", "inmobiliariaId", embedding <-> ${embedding}::vector as distance 
      FROM "Property" 
      WHERE LOWER("tipo") = 'casa' AND LOWER("enAlquiler") = 'si' 
      ORDER BY distance 
      LIMIT ${limit}`
  } else if (esApartamento && esVenta) {
    result = await prisma.$queryRaw`
      SELECT id, tipo, "enAlquiler", "enVenta", dormitorios, zona, "precioVenta", "precioAlquiler", "monedaVenta", "monedaAlquiler", "url", "inmobiliariaId", embedding <-> ${embedding}::vector as distance 
      FROM "Property" 
      WHERE LOWER("tipo") = 'apartamento' AND LOWER("enVenta") = 'si' 
      ORDER BY distance 
      LIMIT ${limit}`
  } else if (esApartamento && esAlquiler) {
    result = await prisma.$queryRaw`
      SELECT id, tipo, "enAlquiler", "enVenta", dormitorios, zona, "precioVenta", "precioAlquiler", "monedaVenta", "monedaAlquiler", "url", "inmobiliariaId", embedding <-> ${embedding}::vector as distance 
      FROM "Property" 
      WHERE LOWER("tipo") = 'apartamento' AND LOWER("enAlquiler") = 'si' 
      ORDER BY distance 
      LIMIT ${limit}`
  } else if (esVenta) {
    result = await prisma.$queryRaw`
      SELECT id, tipo, "enAlquiler", "enVenta", dormitorios, zona, "precioVenta", "precioAlquiler", "monedaVenta", "monedaAlquiler", "url", "inmobiliariaId", embedding <-> ${embedding}::vector as distance 
      FROM "Property" 
      WHERE LOWER("enVenta") = 'si' 
      ORDER BY distance 
      LIMIT ${limit}`
  } else if (esAlquiler) {
    result = await prisma.$queryRaw`
      SELECT id, tipo, "enAlquiler", "enVenta", dormitorios, zona, "precioVenta", "precioAlquiler", "monedaVenta", "monedaAlquiler", "url", "inmobiliariaId", embedding <-> ${embedding}::vector as distance 
      FROM "Property" 
      WHERE LOWER("enAlquiler") = 'si' 
      ORDER BY distance 
      LIMIT ${limit}`
  } else {
    result = await prisma.$queryRaw`
      SELECT id, tipo, "enAlquiler", "enVenta", dormitorios, zona, "precioVenta", "precioAlquiler", "monedaVenta", "monedaAlquiler", "url", "inmobiliariaId", embedding <-> ${embedding}::vector as distance 
      FROM "Property" 
      ORDER BY distance 
      LIMIT ${limit}`
  }  

  result.map((item) => {
    console.log(`${item.inmobiliariaId}: ${item.distance}`)    
  })

  return result
}

export async function similaritySearch(tipo: string, operacion: string, caracteristicas: string, limit: number = 10) : Promise<SimilaritySearchResult[]> {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    verbose: true,
  })

  let tipoConMayuscula= ""
  if (tipo.toLowerCase().includes("casa")) 
    tipoConMayuscula= "Casa"
  else if (tipo.toLowerCase().includes("apartamento") || tipo.toLowerCase().includes("apto") || tipo.toLowerCase().includes("departamento") || tipo.toLowerCase().includes("depto"))
    tipoConMayuscula= "Apartamento"
  else tipoConMayuscula= tipo.charAt(0).toUpperCase() + tipo.slice(1)

  const vector= await embeddings.embedQuery(caracteristicas)
  const embedding = pgvector.toSql(vector)

  let result: SimilaritySearchResult[]= []
  if (operacion === "VENTA" || operacion === "VENDER" || operacion === "COMPRA" || operacion === "COMPRAR") {
    result = await prisma.$queryRaw`
      SELECT id, tipo, "enAlquiler", "enVenta", dormitorios, zona, "precioVenta", "precioAlquiler", "monedaVenta", "monedaAlquiler", "url", "inmobiliariaId", embedding <-> ${embedding}::vector as distance 
      FROM "Property" 
      WHERE "tipo" = ${tipoConMayuscula} AND "enVenta" = 'si' 
      ORDER BY distance 
      LIMIT ${limit}`
  }
  else if (operacion === "ALQUILER" || operacion === "ALQUILAR" || operacion === "RENTA" || operacion === "RENTAR") {
    result = await prisma.$queryRaw`
      SELECT id, tipo, "enAlquiler", "enVenta", dormitorios, zona, "precioVenta", "precioAlquiler", "monedaVenta", "monedaAlquiler", "url", "inmobiliariaId", embedding <-> ${embedding}::vector as distance 
      FROM "Property" 
      WHERE "tipo" = ${tipoConMayuscula} AND "enAlquiler" = 'si' 
      ORDER BY distance 
      LIMIT ${limit}`
  }

  

  result.map((item) => {
    console.log(`${item.inmobiliariaId}: ${item.distance}`)    
  })

  return result
}

export type SimilaritySearchResult = {
  id: string
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
  inmobiliariaId: string
  distance: number
}


