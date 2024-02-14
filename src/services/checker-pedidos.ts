import { prisma } from "@/lib/db";
import { Coincidence, Pedido } from "@prisma/client";
import { addMinutes, format, isAfter, parseISO } from "date-fns";
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { es } from "date-fns/locale";
import OpenAI from "openai";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages.mjs";
import { getValue, setValue } from "./config-services";
import { createNotificationPedido } from "./notification-pedidos-services";
import { sendPendingNotificationsV2 } from "./notification-sender";
import { CoincidenceWithProperty, createCoincidencesProperties, getPedidos, getPedidosChecked, updateCoincidencesNumbers, updatePedidoCoincidencesCreated, updatePedidoStatus } from "./pedido-services";
import { getAmountOfCoincidencesOfInmobiliaria } from "./coincidence-services";
import { sendWapMessage } from "./osomService";


export async function processPendingPedidos() {
    const pedidosPending= await getPedidos("pending")
    for (const pedido of pedidosPending) {
        console.log("processing pedido: ", pedido.number)
        
        await createCoincidencesProperties(pedido.id)
    }

}

export async function checkPendingCoincidences() {

    const pedidosPending= await getPedidos("coincidences_created")
    for (const pedido of pedidosPending) {
        const pendingCoincidences= pedido.coincidences.filter(coincidence => {
            return coincidence.state === "pending"
        })
        console.log("pending coincidences: ", pendingCoincidences.length)        
        for (const coincidence of pendingCoincidences) {
            await checkScore(coincidence)
        }
    }
}

export async function checkScore(coincidence: Coincidence) {
    const MIN_SCORE_ALTA= await getValue("MIN_SCORE_ALTA")
    if(!MIN_SCORE_ALTA) console.log("MIN_SCORE_ALTA not found")

    const minScore= MIN_SCORE_ALTA ? parseInt(MIN_SCORE_ALTA) : 60
  
    let newStatus= "distance_banned"
    if (coincidence.score >= minScore) {
        newStatus= "distance_ok"
    }
    await updateCoincidence(coincidence.id, newStatus)
}

export async function checkDistanceOkCoincidences() {
    const pedidosPending= await getPedidos("coincidences_created")
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
    // if (!presupuesto || !valorInmueble) {
    if (!presupuesto) {
            console.log("*****************************")
        console.log("presupuesto ", presupuesto)
        console.log("valorInmuebleStr ", valorInmuebleStr)        
        console.log("valorInmueble ", valorInmueble)
        console.log("*****************************")
        newState= "budget_ok"
    } else {
        const presupuestoMin= pedido.presupuestoMin || 0
        const presupuestoMax= pedido.presupuestoMax || 10000000000
        const isAlquiler= pedido.operacion && (pedido.operacion.toUpperCase() === "ALQUILER" || pedido.operacion.toUpperCase() === "ALQUILAR")
        const coincidenceMoneda= isAlquiler ? coincidence.property.monedaAlquiler : coincidence.property.monedaVenta

        console.log("----------------------")
        console.log("presupuestoMin: ", presupuestoMin)
        console.log("presupuestoMax: ", presupuestoMax)
        console.log("valorInmueble: ", valorInmueble)
        console.log("coincidenceMoneda: ", coincidenceMoneda)
        console.log("----------------------")
        if (valorInmueble && coincidenceMoneda && presupuestoMax >= valorInmueble && valorInmueble >= presupuestoMin) {
            newState= "budget_ok"
        }
    }

    await updateCoincidence(coincidence.id, newState)
}

function getValorInmueble(coincidence: CoincidenceWithProperty, operacion: string) {
    if (operacion.toUpperCase() === "VENTA") {
        return coincidence.property.precioVenta + " " + coincidence.property.monedaVenta
    }

    if (coincidence.property.precioAlquilerUYU && (operacion.toUpperCase() === "ALQUILER" || operacion.toUpperCase() === "ALQUILAR" || operacion.toUpperCase() === "RENTA")) {
        return coincidence.property.precioAlquilerUYU + " UYU"
    }
}

export async function checkBudgetOkCoincidences() {
    const INMO_LIMIT_RESULTS= await getValue("INMO_LIMIT_RESULTS")
    let inmoLimit= 5
    if(INMO_LIMIT_RESULTS) inmoLimit= parseInt(INMO_LIMIT_RESULTS)
    else console.log("INMO_LIMIT_RESULTS not found")    
  
    const pedidosPending= await getPedidos("coincidences_created")
    for (const pedido of pedidosPending) {
        const coincidences= pedido.coincidences.filter(coincidence => {
            return coincidence.state === "budget_ok"
        })
        console.log("budget_ok coincidences: ", coincidences.length)        
        for (const coincidence of coincidences) {
            const pedidoId= pedido.id
            const inmobiliariaId= coincidence.property.inmobiliariaId
            if (inmobiliariaId === null) {
                console.log("inmobiliariaId is null")
                continue
            }
            const totalCoincidencesChecked= await getAmountOfCoincidencesOfInmobiliaria(pedidoId, inmobiliariaId, "checked")
            console.log("totalCoincidencesChecked: ", totalCoincidencesChecked)
            if (totalCoincidencesChecked >= inmoLimit) {
                await updateCoincidence(coincidence.id, "inmo_limit_reached")                
            } else {
                await checkZone(coincidence, pedido)
            }

            // todo test it
            const nowMontevideo = format(utcToZonedTime(new Date(), timeZone), "yyyy-MM-dd'T'HH:mm:ss", { locale: es });
            console.log(`updating PROCESS_BLOCKED to true->${nowMontevideo}...`)
            await setValue("PROCESS_BLOCKED", `true->${nowMontevideo}`);

        }
    }
}

export async function checkZone(coincidence: CoincidenceWithProperty, pedido: Pedido) {
    const zona= pedido.zona
    if (zona && (zona === "" || zona.toLowerCase() === "n/d")) {
        await updateCoincidence(coincidence.id, "checked")
        return
    }
    
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
        //model: "gpt-3.5-turbo-1106",
        model: "gpt-4-1106-preview",
        // model: "gpt-4-turbo-preview",
      }
    )
  
    const runId= run.id
    let status= run.status
    while (true) {
      run = await openai.beta.threads.runs.retrieve(
        createdThread.id,
        runId,
      )
      status= run.status
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
    const pedidosPending= await getPedidos("coincidences_created")
    for (const pedido of pedidosPending) {
        // check if all coincidences are in a final state: checked, distance_banned, budget_banned, zone_banned
        // if so, update pedido state to checked and update numbers
        const coincidences= pedido.coincidences.filter(coincidence => {
            return coincidence.state !== "checked" && coincidence.state !== "distance_banned" && coincidence.state !== "budget_banned" && coincidence.state !== "zone_banned" && coincidence.state !== "inmo_limit_reached"
        })
        console.log("pending coincidences: ", coincidences.length)
        if (pedido.status === "coincidences_created" && coincidences.length === 0) {
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
            let totalCoincidencesChecked= 0
            for (const inmobiliariaId of uniqueInmobiliariesIds) {

                const filteredCoincidences= coincidencesChecked.filter(coincidence => coincidence.property.inmobiliariaId === inmobiliariaId)

                console.log("creating notification for inmobiliaria: ", inmobiliariaId, " - coincidences: ", filteredCoincidences.length)                
                await createNotificationPedido(pedido, filteredCoincidences)
                totalCoincidencesChecked+= filteredCoincidences.length
            }
            //await updatePedidoStatus(pedido.id, "notifications_created")                
            await updatePedidoCoincidencesCreated(pedido.id, totalCoincidencesChecked)
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



const timeZone = 'America/Montevideo';

export async function checkPedidos() {
    let processBlocked= false
    const nowMontevideo = format(utcToZonedTime(new Date(), timeZone), "yyyy-MM-dd'T'HH:mm:ss", { locale: es });
    console.log(nowMontevideo)

    const processBlockedValue= await getValue("PROCESS_BLOCKED")
    if (processBlockedValue) {
        const [blocked, timestamp] = processBlockedValue.split("->")
        processBlocked = blocked === "true"
        // Si el proceso está bloqueado, verifica si ha pasado más de 30 minutos
        if (processBlocked) {
            const blockedDate = parseISO(timestamp)            
            const blockedDateInMontevideo = utcToZonedTime(blockedDate, timeZone)

            const twentyMinutesLater = addMinutes(blockedDateInMontevideo, 20)
            const now= utcToZonedTime(new Date(), timeZone)
            if (isAfter(now, twentyMinutesLater)) {
                const message= "El proceso ha estado bloqueado por más de 20 min. Desbloqueando..."
                console.log(message);
                processBlocked = false; // Asume que el bloqueo ha caducado
                sendWapMessage("59898353507", message)
            } else {
                console.log(`Process is blocked. Time to force unblock: ${format(twentyMinutesLater, "yyyy-MM-dd'T'HH:mm:ss", { locale: es })}`)                
            }
        }
    } else {
        console.log("PROCESS_BLOCKED not found, config this variable to process pedidos");
        return;
    }

    // const PROCESS_BLOCKED= await getValue("PROCESS_BLOCKED")
    // if(PROCESS_BLOCKED) processBlocked= PROCESS_BLOCKED === "true"
    // else {
    //     console.log("PROCESS_BLOCKED not found, config this variable to process pedidos")
    //     return
    // }
    
    if (processBlocked) {
        //console.log("process is blocked")
        return
    } else {
        await setValue("PROCESS_BLOCKED", `true->${nowMontevideo}`);
    }

    try {            
        
        await printPendingPedidos()

        await processPendingPedidos()
        await checkPendingCoincidences()
        await checkDistanceOkCoincidences()
        await checkBudgetOkCoincidences()
        await checkCoincidencesFinished()
        await createNotifications()
        await sendPendingNotificationsV2()

        await setValue("PROCESS_BLOCKED", "false")

    } catch (error) {
        console.log("error: ", error)
    } finally {
        if (processBlocked) {
            let atempts= 1
            while (atempts <= 10) {
                try {
                    await setValue("PROCESS_BLOCKED", "false")
                    console.log("PROCESS_BLOCKED set to false on finally");            
                    break            
                } catch (error) {
                    atempts++
                    //sleep 5 seconds
                    console.log(`attempt ${atempts} to set PROCESS_BLOCKED to false`)        
                    await new Promise(resolve => setTimeout(resolve, 5000))
                }
            }    
        }
    }


    console.log("--------------------------------------------")
}

async function printPendingPedidos() {
    let pedidos= await getPedidos("coincidences_created")
    pedidos.forEach(pedido => {
        console.log("pedido: ", pedido.text)
        pedido.coincidences.forEach(coincidence => {
            console.log("coincidence: ", coincidence.number, " - score: ", coincidence.score, " - state: ", coincidence.state)
        })
    })
    pedidos= await getPedidosChecked()
    pedidos.forEach(pedido => {
        console.log("pedido: ", pedido.text)
        pedido.coincidences.forEach(coincidence => {
            console.log("coincidence: ", coincidence.number, " - score: ", coincidence.score, " - state: ", coincidence.state)
        })
    })
}

checkPedidos()