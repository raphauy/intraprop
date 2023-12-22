import * as z from "zod"
import { prisma } from "@/lib/db"
import { CoincidenceDAO, getCoincidenceDAO } from "./coincidence-services"
import { CoincidenceWithProperty, PedidoDAO, getPedidoDAO } from "./pedido-services"
import { format } from "date-fns"
import { getInmobiliariaDAO } from "./inmobiliaria-services"
import { formatPedidoNumber, formatPresupuesto } from "@/lib/utils"
import { getValue } from "./config-services"
import { Coincidence, Inmobiliaria, Pedido } from "@prisma/client"


export type NotificationPedidoDAO = {
  id:  string
	status: string
	error: string | null
	sentAt: Date | null
	json: string | null
  inmobiliaria: string
  pedidoId: string
  pedidoTipo?: string
  pedidoOperacion?: string
  pedidoNumber: string
	createdAt: Date
	updatedAt: Date
  coincidences: CoincidenceDAO[]
}

export async function createNotificationPedido(pedido: Pedido, coincidences: CoincidenceWithProperty[]) {
  const cantCoincidences= coincidences.length
  if (cantCoincidences === 0) throw new Error("No coincidences found")

  const inmobiliariaId= coincidences[0].property.inmobiliariaId
  if (!inmobiliariaId) throw new Error("No inmobiliariaId found")

  const inmobiliaria= await getInmobiliariaDAO(inmobiliariaId)
  const basePath= process.env.NEXTAUTH_URL || ""

  const coincidencesJSON= []
  for (const coincidence of coincidences) {
    const coincidenceObject= generateJSON(coincidence, pedido, inmobiliaria.slug)
    coincidencesJSON.push(coincidenceObject)    
  }

  const json= {
    number: formatPedidoNumber(pedido.number),
    celulares: inmobiliaria.celulares,
    phone: pedido.phone,
    name: pedido.name,
    group: pedido.group,
    tablero: `${basePath}/${inmobiliaria.slug}/tablero?id=${pedido.id}`,    
    operacion: pedido.operacion,
    tipo: pedido.tipo,
    presupuesto: pedido.presupuesto ? pedido.presupuesto : "",
    zona: pedido.zona,
    dormitorios: pedido.dormitorios,
    creado: format(pedido.createdAt, "yyyy-MM-dd HH:mm"),
    inmobiliaria: inmobiliaria.name,
    coincidencias: coincidencesJSON
  }

  const notification= await prisma.notificationPedido.create({
    data: {
      status: "pending",
      pedidoId: pedido.id,
      celulares: inmobiliaria.celulares,
      json: JSON.stringify(json),
      coincidences: {
        connect: coincidences.map(c => ({ id: c.id }))
      },
    }
  })

  return notification
}

export async function getPendingNotifications() {
  const notifications= await prisma.notificationPedido.findMany({
    where: {
      status: "pending"
    },
    orderBy: {
      createdAt: "asc"
    }
  })

  return notifications
}

export async function updateNotificationSent(id: string) {
  const updated = await prisma.notificationPedido.update({
    where: {
      id
    },
    data: {
      status: "sent",
      sentAt: new Date()
    },
  })
  return updated
}

function generateJSON(coincidence: CoincidenceWithProperty, pedido: Pedido, slug: string) {
  const property= coincidence.property
  let zona= property.zona
  if (property.ciudad) zona+= ", " + property.ciudad
  if (property.departamento) zona+= ", " + property.departamento

  const basePath= process.env.NEXTAUTH_URL || ""

  const res= {
    number: coincidence.number,
    score: coincidence.score,
    idPropiedad: property.idPropiedad,
    tipo: property.tipo ? property.tipo.toLowerCase() : "",
    valor: pedido.operacion?.toUpperCase() === "VENTA" ? property.precioVenta : property.precioAlquiler,
    moneda: pedido.operacion?.toUpperCase() === "VENTA" ? property.monedaVenta : property.monedaAlquiler,
    dormitorios: property.dormitorios,
    zona,
    url: property.url,
    tablero: `${basePath}/${slug}/tablero?id=${pedido.id}&coincidenceId=${coincidence.id}`
  }    
  
  return res
}


export async function getNotificationsPedidoDAO(): Promise<NotificationPedidoDAO[]> {
  const NOTIFICATIONS_RESULTS= await getValue("NOTIFICATIONS_RESULTS")
  let notificationsResults= 100
  if(NOTIFICATIONS_RESULTS) notificationsResults= parseInt(NOTIFICATIONS_RESULTS)
  else console.log("NOTIFICATIONS_RESULTS not found")

  const found = await prisma.notificationPedido.findMany({
    orderBy: [
      {
        status: "desc",
      },
      {
        sentAt: "desc",
      },
    ],
    include: {
      coincidences: {
        include: {
          property: true
        }
      }
    },
    take: notificationsResults,
  })

  const res: NotificationPedidoDAO[]= []
  for (const notificationPedido of found) {
    const pedido= await getPedidoDAO(notificationPedido.pedidoId)
    if (!pedido) {
      console.log(`pedido ${notificationPedido.pedidoId} not found`)
      throw new Error(`pedido ${notificationPedido.pedidoId} not found`)
    }
    const coincidences= notificationPedido.coincidences
    const coincidencesDAO: CoincidenceDAO[]= []
    for (const coincidence of coincidences) {
      const coincidenceDAO= await getCoincidenceDAO(coincidence.id)
      if (!coincidenceDAO) {
        console.log(`coincidence ${coincidence.id} not found`)
        continue
      }
      coincidencesDAO.push(coincidenceDAO)
    }
    let inmobiliariaName= ""
    if (coincidencesDAO.length > 0) {
      const inmobiliaria= await getInmobiliariaDAO(coincidencesDAO[0].property.inmobiliariaId)
      if (inmobiliaria) inmobiliariaName= inmobiliaria.name
    }
  
    const resNotificationPedido: NotificationPedidoDAO= {
      ...notificationPedido,
      inmobiliaria: inmobiliariaName,
      pedidoId: pedido.id,
      pedidoTipo: pedido.tipo,
      pedidoOperacion: pedido.operacion,
      pedidoNumber: formatPedidoNumber(pedido.number),
      coincidences: coincidencesDAO      
    }
    res.push(resNotificationPedido)
  }

  return res
}