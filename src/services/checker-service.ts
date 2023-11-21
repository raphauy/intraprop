import OpenAI from "openai";
import { CoincidenceDAO, getCoincidenceDAO, getPendingCoincidences } from "./coincidence-services";
import { getPedidoDAO, updateCoincidencesNumbers } from "./pedido-services";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages.mjs";
import { prisma } from "@/lib/db";


export async function checkZone(coincidenceId: string) {
    console.log("checking coincidence", coincidenceId)
    
    const OPENAI_ASSISTANT_ID= process.env.OPENAI_ZONE_ASSISTANT_ID
    if (!OPENAI_ASSISTANT_ID) {
        console.log("OPENAI_ZONE_ASSISTANT_ID is not defined")
        return
    }
  
    const coincidence= await getCoincidenceDAO(coincidenceId)
    if (!coincidence) {
        console.log(`coincidence ${coincidenceId} not found`)
        return
    }

    const pedido= await getPedidoDAO(coincidence.pedidoId)
    const zonaInmueble= getZonaInmueble(coincidence)
    
    const text= `
    zona pedido: ${pedido.zona}
    zona inmueble: ${zonaInmueble}
    `
    console.log("consulta: ", text)

    const openai = new OpenAI();
  
    console.log("creating thread for check assistant")  
    const createdThread = await openai.beta.threads.create({
      messages: [
        {
          "role": "user",
          "content": text,
        }
      ]
    })
  
    console.log("creating run for check zone")
    let run = await openai.beta.threads.runs.create(
      createdThread.id, 
      { 
        assistant_id: OPENAI_ASSISTANT_ID,
//        model: "gpt-3.5-turbo-1106",
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
        console.log("run is not 'completed'")
        return
    }
  
    const threadMessages = await openai.beta.threads.messages.list(run.thread_id)
    const updates = threadMessages.data.map(async (message: ThreadMessage) => {
        if (message.role === "assistant" && message.content[0].type === "text") {
            const respuesta = message.content[0].text.value

            console.log("respuesta", respuesta)         
            
            let newStatus= "zone_banned"
            if (respuesta === "SI") {
                newStatus= "zone_ok"
            }

            console.log("updating coincidence", coincidenceId)
            const updated = await prisma.coincidence.update({
                where: {
                    id: coincidenceId
                },
                data: {
                    state: newStatus,
                }
            })
        }
      })
      
      const results = await Promise.all(updates)      
      const successfulUpdates = results.filter(result => result !== null)
      
      console.log("All updates completed:", successfulUpdates)
      return successfulUpdates.length > 0
    
}

function getZonaInmueble(coincidence: CoincidenceDAO) {
    // property.zona !== null && property.zona !== "" && (textToEmbed += ` en ${property.zona},`) 
    const zona= coincidence.property.zona 
    const ciudad= coincidence.property.ciudad
    const departamento= coincidence.property.departamento
    const pais= coincidence.property.pais

    let zonaInmueble= zona !== null && zona !== "" ? zona : ""
    zonaInmueble+= ciudad !== null && ciudad !== "" ? ` en ${ciudad}` : ""
    zonaInmueble+= departamento !== null && departamento !== "" ? ` en ${departamento}` : ""
    zonaInmueble+= pais !== null && pais !== "" ? ` en ${pais}` : ""

    return zonaInmueble
}



function getValorInmueble(coincidence: CoincidenceDAO, operacion: string) {
    if (operacion.toUpperCase() === "VENTA") {
        return coincidence.property.precioVenta + " " + coincidence.property.monedaVenta
    }

    if (operacion.toUpperCase() === "ALQUILER") {
        return coincidence.property.precioAlquiler + " " + coincidence.property.monedaAlquiler
    }
}

export async function checkBudget(coincidenceId: string) {

    const coincidence= await getCoincidenceDAO(coincidenceId)
    if (!coincidence) {
        console.log(`coincidence ${coincidenceId} not found`)
        return      
    }

    const pedido= await getPedidoDAO(coincidence.pedidoId)
    if (!pedido.operacion) {
        console.log(`pedido ${pedido.id} does not have operacion`)
        return
    }

    const presupuestoStr= pedido.presupuesto || ""
    const valorInmuebleStr= getValorInmueble(coincidence, pedido.operacion) || ""

    console.log("presupuestoStr", presupuestoStr)
    console.log("valorInmuebleStr", valorInmuebleStr)
    

    const presupuesto= parseCustom(presupuestoStr)
    const valorInmueble= parseCustom(valorInmuebleStr)
    console.log("presupuesto", presupuesto)
    console.log("valorInmueble", valorInmueble)    

    let newState= "budget_banned"
    if (!presupuesto || !valorInmueble) {
        newState= "checked"
    } else {
        const presupuestoMin= valorInmueble * 0.5
        const presupuestoMax= valorInmueble * 1.5
        if (presupuestoMax >= presupuesto && presupuesto >= presupuestoMin) {
            newState= "checked"
        }
    }


    console.log("updating coincidence newState: ", newState)  
    const updated = await prisma.coincidence.update({
        where: {
            id: coincidenceId
        },
        data: {
            state: newState,
        }
    })
}

function parseCustom(valueString: string): number | null {
    // Eliminar espacios y separadores no numéricos excepto el punto
    const sanitizedString = valueString.replace(/[^0-9.]+/g, '');

    // Dividir en caso de que haya puntos como separadores de miles
    const parts = sanitizedString.split('.');

    // Unir las partes para obtener el número completo
    const joinedNumber = parts.join('');

    // Convertir a número
    const value = parseInt(joinedNumber);

    // Verificar si el resultado es un número válido
    if (isNaN(value)) {
        return null;
    }

    return value;
}


export async function checkCoincidences() {
    console.log("starting checker")
    const coincidences= await getPendingCoincidences("pending")
    console.log("coincidences to check:", coincidences.length)
    if (coincidences.length === 0) {
        return
    }
    const firstCoincidence= coincidences[0]
    console.log("first coincidence:", firstCoincidence)
    await checkZone(firstCoincidence.id)

    const zoneOKCoincidences= await getPendingCoincidences("zone_ok")
    console.log("coincidences zone_ok to check:", zoneOKCoincidences.length)
    if (zoneOKCoincidences.length === 0) {
        return
    }
    // iterate over zone_ok coincidences and check budget
    for (const zoneOKCoincidence of zoneOKCoincidences) {
        const checked= await checkBudget(zoneOKCoincidence.id)
        console.log("checked:", checked)
        const pedido= await getPedidoDAO(zoneOKCoincidence.pedidoId)
        await updateCoincidencesNumbers(pedido.id)    
    }

    // const firstZoneOk= zoneOKCoincidences[0]
    // console.log("first coincidence:", firstZoneOk)
    // const checked= await checkBudget2(firstZoneOk.id)
    // console.log("checked:", checked)


}


export async function checkZoneLoop() {

    console.log("starting zone checker")
    const coincidences= await getPendingCoincidences("pending")
    console.log("coincidences to check:", coincidences.length)
    if (coincidences.length === 0) {
        return
    }
    // iterate over pending coincidences and check zone
    for (const coincidence of coincidences) {
        const checked= await checkZone(coincidence.id)
        console.log("checked:", checked)
    }
}

export async function checkBudgetLoop() {

    console.log("starting budget checker")
    const coincidences= await getPendingCoincidences("zone_ok")
    console.log("coincidences to check:", coincidences.length)
    if (coincidences.length === 0) {
        return
    }
    // iterate over pending coincidences and check budget        
    for (const coincidence of coincidences) {
        const checked= await checkBudget(coincidence.id)
        console.log("checked:", checked)
        const pedido= await getPedidoDAO(coincidence.pedidoId)
        await updateCoincidencesNumbers(pedido.id)    
    }
}

// check both zone and budget in parallel
export async function checkCoincidencesLoop() {
    await checkZoneLoop()
    await checkBudgetLoop()
}

checkCoincidencesLoop()