import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import * as z from "zod"
import { NotificationPedidoDAO } from "./notification-pedidos-services"
import { WapShareData } from "@/app/admin/tablero/actions"
import { format } from "date-fns"

export type CoincidenceDAO = {
  id:  string
	number:  number
	distance:  number
  score:  number
	pedidoId:  string
	propertyId:  string
	createdAt:  Date
  state: string
  sharedBy: string
  property: {
    id: string
    idPropiedad: string
    titulo: string
    tipo: string
    enAlquiler: string
    enVenta: string
    monedaVenta: string
    monedaAlquiler: string
    dormitorios: string
    garages: string
    parrilleros: string
    piscinas: string
    zona: string
    ciudad: string
    departamento: string
    pais: string
    precioVenta: string
    precioAlquiler: string
    precioAlquilerUYU: number
    url: string
    inmobiliariaId: string
    inmobiliariaName: string
    inmobiliariaSlug: string
  },
  notificationPedido?: NotificationPedidoDAO
}

export const coincidenceFormSchema = z.object({
  number: z.number({required_error: "Number is required."}),
  distance: z.number({required_error: "Distance is required."}),
  score: z.number({required_error: "Score is required."}),
	pedidoId: z.string({required_error: "PedidoId is required."}),
	propertyId: z.string({required_error: "PropertyId is required."}),
})
export type CoincidenceFormValues = z.infer<typeof coincidenceFormSchema>

export async function getAllCoincidencesDAO() {
  const found = await prisma.coincidence.findMany({
    orderBy: {
      id: 'asc'
    },
    include: {
      property: {
        select: {
          id: true,
          idPropiedad: true,
          titulo: true,
          tipo: true,
          enAlquiler: true,
          enVenta: true,
          monedaVenta: true,
          monedaAlquiler: true,
          dormitorios: true,
          garages: true,
          parrilleros: true,
          piscinas: true,
          zona: true,
          ciudad: true,
          departamento: true,
          pais: true,
          precioVenta: true,
          precioAlquiler: true,
          precioAlquilerUYU: true,
          url: true,
          inmobiliaria: true
        },
      }
    }
  })
  const res= found.map((coincidence) => {
    return {
      ...coincidence,
      property: {
        ...coincidence.property,
        inmobiliariaId: coincidence.property.inmobiliaria?.id,
        inmobiliariaName: coincidence.property.inmobiliaria?.name,
        inmobiliariaSlug: coincidence.property.inmobiliaria?.slug
      },
    }
  })

  return res as CoincidenceDAO[]
}

export async function getCoincidencesDAO(pedidoId: string, state?: string) {
  const found = await prisma.coincidence.findMany({
    orderBy: {
      id: 'asc'
    },
    where: {
      pedidoId,
      ...(state ? { state } : {}),
    },
    include: {
      property: {
        select: {
          id: true,
          idPropiedad: true,
          titulo: true,
          tipo: true,
          enAlquiler: true,
          enVenta: true,
          monedaVenta: true,
          monedaAlquiler: true,
          dormitorios: true,
          garages: true,
          parrilleros: true,
          piscinas: true,
          zona: true,
          ciudad: true,
          departamento: true,
          pais: true,
          precioVenta: true,
          precioAlquiler: true,
          precioAlquilerUYU: true,
          url: true,
          inmobiliaria: true
        },
      },
      notificationPedidos: true      
    }
  })
  const all= found.map((coincidence) => {
    const notificationPedido= coincidence.notificationPedidos[0] ? coincidence.notificationPedidos[0] : undefined
    return {
      ...coincidence,
      property: {
        ...coincidence.property,
        inmobiliariaId: coincidence.property.inmobiliaria?.id,
        inmobiliariaName: coincidence.property.inmobiliaria?.name,
        inmobiliariaSlug: coincidence.property.inmobiliaria?.slug
      },
      notificationPedido
    }
  })

  // sort the results, first criteria: checked, second criteria: ordered by number
  const ordered= all.sort((a, b) => {
    if (a.state === "checked" && b.state !== "checked") {
      return -1
    }
    if (a.state !== "checked" && b.state === "checked") {
      return 1
    }
    if (a.distance < b.distance) {
      return -1
    }
    if (a.distance > b.distance) {
      return 1
    }
    return 0
  })


  return ordered as CoincidenceDAO[]
}

export async function getAmountOfCoincidencesOfInmobiliaria(pedidoId: string, inmobiliariaId: string,  state?: string) {
  const found = await prisma.coincidence.count({
    where: {
      pedidoId,
      property: {
        inmobiliariaId,
      },
      ...(state ? { state } : {}),
    }
  })
  return found  
}

export async function getTotalCoincidencesByInmo(inmobiliariaId: string) {
  const found = await prisma.coincidence.count({
    where: {
      property: {
        inmobiliariaId
      }
    }
  })
  return found  
}

export async function getTotalCoincidencesWithNotificationByInmo(inmobiliariaId: string) {
  const found = await prisma.coincidence.count({
    where: {
      property: {
        inmobiliariaId
      },
      state: "checked",
    }
  })
  return found  
}

export async function getCoincidencesDAOByInmo(pedidoId: string, inmobiliariaId: string) {
  // order by score desc and number asc
  const found = await prisma.coincidence.findMany({
    orderBy: [
      { score: 'desc' },
      { number: 'asc' }
    ],
    where: {
      pedidoId,
      property: {
        inmobiliariaId,
      },
    },
    include: {
      property: {
        select: {
          id: true,
          idPropiedad: true,
          titulo: true,
          tipo: true,
          enAlquiler: true,
          enVenta: true,
          monedaVenta: true,
          monedaAlquiler: true,
          dormitorios: true,
          garages: true,
          parrilleros: true,
          piscinas: true,
          zona: true,
          ciudad: true,
          departamento: true,
          pais: true,
          precioVenta: true,
          precioAlquiler: true,
          precioAlquilerUYU: true,
          url: true,
          inmobiliaria: true
        },
      },
      notificationPedidos: true
    }    
  })
  const res= found.map((coincidence) => {
    const notificationPedido= coincidence.notificationPedidos[0] ? coincidence.notificationPedidos[0] : undefined
    return {
      ...coincidence,
      property: {
        ...coincidence.property,
        inmobiliariaId: coincidence.property.inmobiliaria?.id,
        inmobiliariaName: coincidence.property.inmobiliaria?.name,
        inmobiliariaSlug: coincidence.property.inmobiliaria?.slug
      },
      notificationPedido
    }
  })

  return res as CoincidenceDAO[]
}

export async function getCoincidenceDAO(id: string) {
  const found = await prisma.coincidence.findUnique({
    where: {
      id
    },
    include: {
      property: {
        select: {
          id: true,
          idPropiedad: true,
          titulo: true,
          tipo: true,
          enAlquiler: true,
          enVenta: true,
          monedaVenta: true,
          monedaAlquiler: true,
          dormitorios: true,
          garages: true,
          parrilleros: true,
          piscinas: true,
          zona: true,
          ciudad: true,
          departamento: true,
          pais: true,
          precioVenta: true,
          precioAlquiler: true,
          precioAlquilerUYU: true,
          url: true,
          inmobiliaria: true
        },
      },
      notifications: true
    }
  })
  if (!found) {
    return null
  }

  const notification= found.notifications[0] ? found.notifications[0] : undefined
  const res= {
    ...found,
    property: {
      ...found.property,
      inmobiliariaId: found.property.inmobiliaria?.id,
      inmobiliariaName: found.property.inmobiliaria?.name,
      inmobiliariaSlug: found.property.inmobiliaria?.slug
    },
    notification
  }

  return res as CoincidenceDAO
}

export async function createCoincidence(data: CoincidenceFormValues) {
  const created = await prisma.coincidence.create({
    data
  })
  return created
}

export async function updateCoincidence(id: string, data: CoincidenceFormValues) {
  const updated = await prisma.coincidence.update({
    where: {
      id
    },
    data
  })
  return updated
}

// export async function deleteCoincidence(id: string) {
//   const deleted = await prisma.coincidence.delete({
//     where: {
//       id
//     },
//   })
//   return deleted
// }
    

export async function getPendingCoincidences(state: string) {
  const found = await prisma.coincidence.findMany({
    where: {
      state
    },
    orderBy: {
      createdAt: 'asc'
    },
    include: {
      property: {
        select: {
          id: true,
          idPropiedad: true,
          titulo: true,
          tipo: true,
          enAlquiler: true,
          enVenta: true,
          monedaVenta: true,
          monedaAlquiler: true,
          dormitorios: true,
          garages: true,
          parrilleros: true,
          piscinas: true,
          zona: true,
          ciudad: true,
          departamento: true,
          pais: true,
          precioVenta: true,
          precioAlquiler: true,
          precioAlquilerUYU: true,
          url: true,
          inmobiliaria: true
        },
      }
    }
  })

  const res= found.map((coincidence) => {
    return {
      ...coincidence,
      property: {
        ...coincidence.property,
        inmobiliariaId: coincidence.property.inmobiliaria?.id,
        inmobiliariaName: coincidence.property.inmobiliaria?.name,
        inmobiliariaSlug: coincidence.property.inmobiliaria?.slug
      },
    }
  })

  return res as CoincidenceDAO[]
}

export async function getShareData(coincidenceId: string) {

  const coincidence= await getCoincidenceDAO(coincidenceId)
  if (!coincidence) {
    throw new Error("Coincidence not found")
  }

  const pedido= await prisma.pedido.findUnique({
    where: {
      id: coincidence.pedidoId
    }
  })
  if (!pedido) {
    throw new Error("Pedido not found")
  }

  const res= {
    pedidoName: pedido.name,
    pedidoPhone: pedido.phone,
    groupName: pedido.group,
    inmoName: coincidence.property.inmobiliariaName,
    url: coincidence.property.url
  }

  return res as WapShareData
}

export async function setSharedBy(coincidenceId: string, userName: string) {

  const formattedDate= format(new Date(), "yyyy-MM-dd HH:mm")

  const text= `Esta propiedad fue compartida por ${userName} el ${formattedDate}`
  const updated = await prisma.coincidence.update({
    where: {
      id: coincidenceId
    },
    data: {
      sharedBy: text
    }
  })
  return updated
}