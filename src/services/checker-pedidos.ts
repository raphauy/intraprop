import { prisma } from "@/lib/db";
import { Coincidence, Pedido } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import OpenAI from "openai";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages.mjs";
import { CoincidenceWithProperty, getPedidosChecked, getPedidosPending, updateCoincidencesNumbers, updatePedidoStatus } from "./pedido-services";
import { createNotificationPedido } from "./notification-pedidos-services";
import { sendPendingNotifications } from "./notification-sender";


export async function checkPendingCoincidences() {

    const pedidosPending= await getPedidosPending()
    for (const pedido of pedidosPending) {
        const pendingCoincidences= pedido.coincidences.filter(coincidence => {
            return coincidence.state === "pending"
        })
        console.log("pending coincidences: ", pendingCoincidences.length)        
        for (const coincidence of pendingCoincidences) {
            await checkDistance(coincidence)
        }
    }
}

export async function checkDistance(coincidence: Coincidence) {
    let newStatus= "distance_banned"
    if (coincidence.distance <= 0.45) {
        newStatus= "distance_ok"
    }
    await updateCoincidence(coincidence.id, newStatus)
}

export async function checkDistanceOkCoincidences() {
    const pedidosPending= await getPedidosPending()
    for (const pedido of pedidosPending) {
        const coincidences= pedido.coincidences.filter(coincidence => {
            return coincidence.state === "distance_ok"
        })
        console.log("distance_ok coincidences: ", coincidences.length)        
        for (const coincidence of coincidences) {
            await checkBudget(coincidence, pedido)
        }
    }
}

export async function checkBudget(coincidence: CoincidenceWithProperty, pedido: Pedido) {

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
        const presupuestoMin= pedido.presupuestoMin || 0
        const presupuestoMax= pedido.presupuestoMax || 10000000000

        console.log("----------------------")
        console.log("presupuestoMin: ", presupuestoMin)
        console.log("presupuestoMax: ", presupuestoMax)
        console.log("valorInmueble: ", valorInmueble)
        console.log("----------------------")
        if (presupuestoMax >= valorInmueble && valorInmueble >= presupuestoMin) {
            newState= "budget_ok"
        }
    }

    await updateCoincidence(coincidence.id, newState)
}

function getValorInmueble(coincidence: CoincidenceWithProperty, operacion: string) {
    if (operacion.toUpperCase() === "VENTA") {
        return coincidence.property.precioVenta + " " + coincidence.property.monedaVenta
    }

    if (operacion.toUpperCase() === "ALQUILER" || operacion.toUpperCase() === "ALQUILAR" || operacion.toUpperCase() === "RENTA") {
        return coincidence.property.precioAlquiler + " " + coincidence.property.monedaAlquiler
    }
}

export async function checkBudgetOkCoincidences() {
    const pedidosPending= await getPedidosPending()
    for (const pedido of pedidosPending) {
        const coincidences= pedido.coincidences.filter(coincidence => {
            return coincidence.state === "budget_ok"
        })
        console.log("budget_ok coincidences: ", coincidences.length)        
        for (const coincidence of coincidences) {
            await checkZone(coincidence, pedido)
        }
    }
}

export async function checkZone(coincidence: CoincidenceWithProperty, pedido: Pedido) {
    
    const OPENAI_ASSISTANT_ID= process.env.OPENAI_ZONE_ASSISTANT_ID
    if (!OPENAI_ASSISTANT_ID) {
        console.log("OPENAI_ZONE_ASSISTANT_ID is not defined")
        return
    }
  
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

            await updateCoincidence(coincidence.id, newStatus)
        }
      })
      
      const results = await Promise.all(updates)      
      const successfulUpdates = results.filter(result => result !== null)
      
      return successfulUpdates.length > 0
    
}
function getZonaInmueble(coincidence: CoincidenceWithProperty): string {
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

export async function checkCoincidencesFinished() {
    const pedidosPending= await getPedidosPending()
    for (const pedido of pedidosPending) {
        // check if all coincidences are in a final state: checked, distance_banned, budget_banned, zone_banned
        // if so, update pedido state to checked and update numbers
        const coincidences= pedido.coincidences.filter(coincidence => {
            return coincidence.state !== "checked" && coincidence.state !== "distance_banned" && coincidence.state !== "budget_banned" && coincidence.state !== "zone_banned"
        })
        console.log("pending coincidences: ", coincidences.length)
        if (coincidences.length === 0) {
            console.log("updating pedido state to checked")
            await updatePedidoStatus(pedido.id, "checked")
            await updateCoincidencesNumbers(pedido.id)
        }
    }
}


export async function createNotifications() {
    const pedidosChecked= await getPedidosChecked()
    
    for (const pedido of pedidosChecked) {
        const coincidencesChecked= pedido.coincidences.filter(coincidence => {
            return coincidence.state === "checked"
        })
        console.log("checked coincidences: ", coincidencesChecked.length)
        const cantCoincidences= coincidencesChecked.length
        if (cantCoincidences === 0) {
            await updatePedidoStatus(pedido.id, "no_coincidences")
        } else {
            const inmobiliariesIds= coincidencesChecked.map(coincidence => coincidence.property.inmobiliariaId)
            const uniqueInmobiliariesIds= Array.from(new Set(inmobiliariesIds))
            console.log("uniqueInmobiliariesIds: ", uniqueInmobiliariesIds)
            for (const inmobiliariaId of uniqueInmobiliariesIds) {

                const filteredCoincidences= coincidencesChecked.filter(coincidence => coincidence.property.inmobiliariaId === inmobiliariaId)
                console.log("createNotificationPedido: ")
                console.log(filteredCoincidences)
                
              
                await createNotificationPedido(pedido, filteredCoincidences)
                await updatePedidoStatus(pedido.id, "notifications_created")                
            }
        }
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


export async function checkPedidos() {
    const nowMontevideo= format(new Date(), "yyyy-MM-dd HH:mm:ss", { locale: es })
    console.log(nowMontevideo)

    console.log("--------------------------------------------")
    
    await printPendingPedidos()

    await checkPendingCoincidences()
    await checkDistanceOkCoincidences()
    await checkBudgetOkCoincidences()
    await checkCoincidencesFinished()
    await createNotifications()
    await sendPendingNotifications()

//    await printPendingPedidos()

    console.log("--------------------------------------------")
}

async function printPendingPedidos() {
    let pedidos= await getPedidosPending()
    console.log("pedidos pendientes: ", pedidos.length)    
    pedidos.forEach(pedido => {
        console.log("pedido: ", pedido.text)
        pedido.coincidences.forEach(coincidence => {
            console.log("coincidence: ", coincidence.number, " - score: ", coincidence.score, " - state: ", coincidence.state)
        })
    })
    pedidos= await getPedidosChecked()
    console.log("pedidos checked: ", pedidos.length)
    pedidos.forEach(pedido => {
        console.log("pedido: ", pedido.text)
        pedido.coincidences.forEach(coincidence => {
            console.log("coincidence: ", coincidence.number, " - score: ", coincidence.score, " - state: ", coincidence.state)
        })
    })
}

checkPedidos()