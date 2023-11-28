import OpenAI from "openai";
import { CoincidenceDAO, getCoincidenceDAO, getPendingCoincidences } from "./coincidence-services";
import { getPedidoDAO, updateCoincidencesNumbers } from "./pedido-services";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages.mjs";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createNotification } from "./notification-services";
import { sendPendingNotifications } from "./notification-sender";
import { getValue } from "./config-services";



export async function checkDistance() {
    const coincidences= await getPendingCoincidences("pending")
    console.log("pending coincidences to check:", coincidences.length)
    if (coincidences.length === 0) {
        return
    }
    // iterate over pending coincidences and check distance
    for (const coincidence of coincidences) {
        let newStatus= "distance_banned"
        if (coincidence.distance <= 0.45) {
            newStatus= "distance_ok"
        }
        await updateCoincidence(coincidence.id, newStatus)
    }
}

export async function checkZone(coincidenceId: string) {
    
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
                newStatus= "checked"
            }

            await updateCoincidence(coincidenceId, newStatus)
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

    if (operacion.toUpperCase() === "ALQUILER" || operacion.toUpperCase() === "ALQUILAR" || operacion.toUpperCase() === "RENTA") {
        return coincidence.property.precioAlquiler + " " + coincidence.property.monedaAlquiler
    }
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



export async function checkBudgetPendings() {

    const BUDGET_PERC_MIN= await getValue("BUDGET_PERC_MIN")
    let budgetPercMin= 0.85
    if(BUDGET_PERC_MIN) budgetPercMin= parseFloat(BUDGET_PERC_MIN) / 100
    else console.log("BUDGET_PERC_MIN not found")

    const BUDGET_PERC_MAX= await getValue("BUDGET_PERC_MAX")
    let budgetPercMax= 1.1
    if(BUDGET_PERC_MAX) budgetPercMax= parseFloat(BUDGET_PERC_MAX) / 100
    else console.log("BUDGET_PERC_MAX not found")

    const coincidences= await getPendingCoincidences("distance_ok")
    console.log("budget coincidences to check:", coincidences.length)
    if (coincidences.length === 0) {
        return
    }
    // iterate over pending coincidences and check budget        
    for (const coincidence of coincidences) {
        await checkBudget(coincidence.id, budgetPercMin, budgetPercMax)
    }
}

export async function checkBudget(coincidenceId: string, budgetPercMin: number, budgetPercMax: number) {

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

    const presupuesto= parseCustom(presupuestoStr)
    const valorInmueble= parseCustom(valorInmuebleStr)

    let newState= "budget_banned"
    if (!presupuesto || !valorInmueble) {
        newState= "budget_ok"
    } else {
        const presupuestoMin= Math.round((presupuesto * (1-budgetPercMin)) * 100) / 100
        const presupuestoMax= Math.round((presupuesto * (1+budgetPercMax)) * 100) / 100
        console.log("----------------------")
        console.log("presupuestoMin: ", presupuestoMin)
        console.log("presupuestoMax: ", presupuestoMax)
        console.log("valorInmueble: ", valorInmueble)
        console.log("----------------------")
        if (presupuestoMax >= valorInmueble && valorInmueble >= presupuestoMin) {
            newState= "budget_ok"
        }
    }

    await updateCoincidence(coincidenceId, newState)
}


export async function checkZonePendings() {

    const coincidences= await getPendingCoincidences("budget_ok")
    console.log("zone coincidences to check:", coincidences.length)
    if (coincidences.length === 0) {
        return
    }
    // iterate over pending coincidences and check zone
    for (const coincidence of coincidences) {
        const checked= await checkZone(coincidence.id)
        console.log("checked:", checked)
        await updateNumbersAndCreateNotifications(coincidence.pedidoId, coincidence.id)
    }
}


async function updateNumbersAndCreateNotifications(pedidoId: string, coincidenceId: string) {
    await updateCoincidencesNumbers(pedidoId)
    const posibleCoincidence= await getCoincidenceDAO(coincidenceId)
    if (posibleCoincidence && posibleCoincidence.state === "checked" && posibleCoincidence.distance <= 0.45)
        await createNotification(coincidenceId)
    else {
        console.log("not creating notification because coincidence is not checked or distance is not less than 0.45, distance: ", posibleCoincidence?.distance)            
    }
}

async function updateCoincidence(coincidenceId: string, newState: string) {
    console.log("updating coincidence newState: ", newState)  
    await prisma.coincidence.update({
        where: {
            id: coincidenceId
        },
        data: {
            state: newState,
        }
    })    
}

// check both zone and budget in parallel
export async function checkCoincidences() {
    const nowMontevideo= format(new Date(), "yyyy-MM-dd HH:mm:ss", { locale: es })
    console.log(nowMontevideo)    

    await checkDistance()
    await checkBudgetPendings()
    await checkZonePendings()
    await sendPendingNotifications()
}

checkCoincidences()