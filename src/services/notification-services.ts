import * as z from "zod"
import { prisma } from "@/lib/db"
import { CoincidenceDAO, getCoincidenceDAO } from "./coincidence-services"
import { PedidoDAO, getPedidoDAO } from "./pedido-services"
import { format } from "date-fns"
import { getInmobiliariaDAO } from "./inmobiliaria-services"
import { formatPedidoNumber, formatPresupuesto } from "@/lib/utils"
import { getValue } from "./config-services"

export type NotificationDAO = {
  id:  string
	status: string
	error: string | null
	sentAt: Date | null
	json: string | null
	coincidenceId: string
  inmobiliaria: string
  pedidoId: string
  pedidoTipo?: string
  pedidoOperacion?: string
  pedidoNumber: string
	createdAt: Date
	updatedAt: Date
  coincidence: CoincidenceDAO
}

export const notificationFormSchema = z.object({
	status: z.string({required_error: "Status is required."}),
	error: z.string().optional(),
	numbers: z.string({required_error: "Numbers is required."}),
	json: z.string().optional(),
	coincidenceId: z.string({required_error: "CoincidenceId is required."}),
})
export type NotificationFormValues = z.infer<typeof notificationFormSchema>

export async function getNotificationsDAO() {
  const NOTIFICATIONS_RESULTS= await getValue("NOTIFICATIONS_RESULTS")
  let notificationsResults= 100
  if(NOTIFICATIONS_RESULTS) notificationsResults= parseInt(NOTIFICATIONS_RESULTS)
  else console.log("NOTIFICATIONS_RESULTS not found")

  const found = await prisma.notification.findMany({
    orderBy: [
      {
        status: "desc",
      },
      {
        sentAt: "desc",
      },
    ],
    take: notificationsResults,
  })

  const res = []
  for (const notification of found) {
    const coincidence= await getCoincidenceDAO(notification.coincidenceId)
    if (!coincidence) {
      console.log(`coincidence ${notification.coincidenceId} not found`)
      continue
    }
    const pedido= await getPedidoDAO(coincidence.pedidoId)
    if (!pedido) {
      console.log(`pedido ${coincidence.pedidoId} not found`)
      continue
    }
    res.push({
      ...notification,
      inmobiliaria: coincidence.property.inmobiliariaName,
      pedidoId: coincidence.pedidoId,
      pedidoTipo: pedido.tipo,
      pedidoOperacion: pedido.operacion,
      pedidoNumber: formatPedidoNumber(pedido.number),
      coincidence
    })
  }

  return res
}

export async function getPendingNotificationsDAO() {
  const found = await prisma.notification.findMany({
    where: {
      status: "pending"
    },
    include: {
      coincidences: {
        include: {
          pedido: true, // Incluye la información del pedido
        },
      },
    },
  });

  // Ordena primero por el número del pedido y luego por el número de la coincidencia
  found.sort((a, b) => {
    if (a.coincidences.pedido.number === b.coincidences.pedido.number) {
      return a.coincidences.number - b.coincidences.number;
    }
    return a.coincidences.pedido.number - b.coincidences.pedido.number;
  });

  return found;
}


export async function getNotificationDAO(id: string) {
  const found = await prisma.notification.findUnique({
    where: {
      id
    },
  })
  if (!found) {
    return null
  }
  const coincidence= await getCoincidenceDAO(found.coincidenceId)
  if (!coincidence) {
    console.log(`coincidence ${found.coincidenceId} not found`)
    return null
  }
  const pedido= await getPedidoDAO(coincidence.pedidoId)
  if (!pedido) {
    console.log(`pedido ${coincidence.pedidoId} not found`)
    return null
  }
  return {
    ...found,
    inmobiliaria: coincidence.property.inmobiliariaName,
    pedidoId: coincidence.pedidoId,
    pedidoTipo: pedido.tipo,
    pedidoOperacion: pedido.operacion,
    pedidoNumber: formatPedidoNumber(pedido.number),
    coincidence
  }
}

export async function updateNotificationSent(id: string) {
  const updated = await prisma.notification.update({
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

export async function deleteNotification(id: string) {
  const deleted = await prisma.notification.delete({
    where: {
      id
    },
  })

  return deleted
}


export async function createNotification(coincidenceId: string) {
  const coincidence= await getCoincidenceDAO(coincidenceId)
  if (!coincidence) {
    console.log(`on createNotification coincidence ${coincidenceId} not found`)
    return null
  }
  const pedido= await getPedidoDAO(coincidence.pedidoId)
  if (!pedido) {
    console.log(`on createNotification pedido ${coincidence.pedidoId} not found`)
    return null
  }
  const inmobiliaria= await getInmobiliariaDAO(coincidence.property.inmobiliariaId)
  if (!inmobiliaria) {
    console.log(`on createNotification inmobiliaria ${coincidence.property.inmobiliariaId} not found`)
    return null
  }
  const celulares= inmobiliaria.celulares
  const status= celulares ? "pending" : "error"
  const error= status === "error" ? "No hay celulares" : undefined

  const created = await prisma.notification.create({
    data: {
      status,
      error,
      json: generateJSON(coincidence, pedido, celulares, inmobiliaria.slug),
      celulares,
      coincidenceId
    },
  })
  return created
}

function generateJSON(coincidence: CoincidenceDAO, pedido: PedidoDAO, celulares: string | undefined, slug: string) {
  const property= coincidence.property
  let zona= property.zona
  if (property.ciudad) zona+= ", " + property.ciudad
  if (property.departamento) zona+= ", " + property.departamento

  const basePath= process.env.NEXTAUTH_URL || ""

  const res= {
    celulares,
    score: coincidence.score,
    tablero: `${basePath}/${slug}/tablero?id=${pedido.id}&coincidenceId=${coincidence.id}`,
    order: coincidence.number,
    pedido: {
      id: pedido.id,
      number: formatPedidoNumber(pedido.number),
      phone: pedido.phone,
      name: pedido.name,
      group: pedido.group,
      operacion: pedido.operacion,
      tipo: pedido.tipo,
      presupuesto: formatPresupuesto(pedido.presupuestoMin, pedido.presupuestoMax, pedido.presupuestoMoneda),
      zona: pedido.zona,
      dormitorios: pedido.dormitorios,
      creado: format(pedido.createdAt, "yyyy-MM-dd HH:mm"),
    },
    propiedad: {
      inmobiliaria: property.inmobiliariaName,
      idPropiedad: property.idPropiedad,
      tipo: property.tipo.toLowerCase(),
      valor: pedido.operacion?.toUpperCase() === "VENTA" ? property.precioVenta : property.precioAlquiler,
      moneda: pedido.operacion?.toUpperCase() === "VENTA" ? property.monedaVenta : property.monedaAlquiler,
      dormitorios: property.dormitorios,
      zona,
      url: property.url,
    }    
  }
  
  return JSON.stringify(res)
}
