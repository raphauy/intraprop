import { prisma } from "@/lib/db"
import * as z from "zod"

export type CoincidenceDAO = {
  id:  string
	number:  number
	distance:  number
	pedidoId:  string
	propertyId:  string
	createdAt:  Date
  state: string
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
    url: string
    inmobiliariaId: string
    inmobiliariaName: string
    inmobiliariaSlug: string
  }
}

export const coincidenceFormSchema = z.object({
  number: z.number({required_error: "Number is required."}),
  distance: z.number({required_error: "Distance is required."}),
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
          url: true,
          inmobiliaria: true
        },
      }
    }
  })
  const all= found.map((coincidence) => {
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

  // sort the results, first criteria: checked, second criteria: ordered by number
  const ordered= all.sort((a, b) => {
    if (a.state === "checked" && b.state !== "checked") {
      return -1
    }
    if (a.state !== "checked" && b.state === "checked") {
      return 1
    }
    if (a.number < b.number) {
      return -1
    }
    if (a.number > b.number) {
      return 1
    }
    return 0
  })


  return ordered as CoincidenceDAO[]
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

export async function getCoincidencesDAOByInmo(pedidoId: string, inmobiliariaId: string) {
  const found = await prisma.coincidence.findMany({
    orderBy: {
      id: 'asc'
    },
    where: {
      pedidoId,
      property: {
        inmobiliariaId,
      },
      state: "checked"
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
          url: true,
          inmobiliaria: true
        },
      }
    }
  })
  if (!found) {
    return null
  }

  const res= {
    ...found,
    property: {
      ...found.property,
      inmobiliariaId: found.property.inmobiliaria?.id,
      inmobiliariaName: found.property.inmobiliaria?.name,
      inmobiliariaSlug: found.property.inmobiliaria?.slug
    },
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

export async function deleteCoincidence(id: string) {
  const deleted = await prisma.coincidence.delete({
    where: {
      id
    },
  })
  return deleted
}
    

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