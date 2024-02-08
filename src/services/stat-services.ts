import * as z from "zod"
import { prisma } from "@/lib/db"

export type StatDAO = {
	id: string
	inmo: string
	createdAt: Date
	updatedAt: Date
	propiedades: number
	pedidos: number
	coincidencias: number
	coincidenciasOK: number
	tasaOK: number
}

export const statSchema = z.object({
	inmo: z.string({required_error: "inmo is required."}),
	propiedades: z.number({required_error: "propiedades is required."}),
	pedidos: z.number({required_error: "pedidos is required."}),
	coincidencias: z.number({required_error: "coincidencias is required."}),
	coincidenciasOK: z.number({required_error: "coincidenciasOK is required."}),
	tasaOK: z.number({required_error: "tasaOK is required."}),
})

export type StatFormValues = z.infer<typeof statSchema>


export async function getStatsDAO() {
  const found = await prisma.stat.findMany({
    orderBy: {
      id: 'asc'
    },
  })
  return found as StatDAO[]
}

export async function getStatDAO(id: string) {
  const found = await prisma.stat.findUnique({
    where: {
      id
    },
  })
  return found as StatDAO
}
    
export async function createStat(data: StatFormValues) {
  // TODO: implement createStat
  const created = await prisma.stat.create({
    data
  })
  return created
}

export async function updateStat(id: string, data: StatFormValues) {
  const updated = await prisma.stat.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function deleteStat(id: string) {
  const deleted = await prisma.stat.delete({
    where: {
      id
    },
  })
  return deleted
}

export async function updateAllInmoStats() {
  const inmos= await prisma.inmobiliaria.findMany({
    select: {
      slug: true
    }
  })

  console.log(`Updating stats for ${inmos.length} inmos`);
  

  for (const inmo of inmos) {
    console.log("Updating inmo stats: ", inmo.slug)    
    await updateInmoStats(inmo.slug)
  }

}

export async function updateInmoStats(inmoSlug: string) {
  const inmo= await prisma.inmobiliaria.findUnique({
    where: {
      slug: inmoSlug
    },
    include: {
      properties: {
        select: {
          id: true
        }
      },      
    }    
  })

  if (!inmo) {
    throw new Error("Inmo not found")
  }

  // get pedidos which createdAt is greater than inmo.createdAt
  const pedidosFound= await prisma.pedido.findMany({
    where: {
      createdAt: {
        gt: inmo.createdAt
      }
    },
    select: {
      id: true
    }
  })

  // get coincidences which properties have inmo.id
  const coincidenciasFound= await prisma.coincidence.findMany({
    where: {
      property: {
        inmobiliariaId: inmo.id
      }
    },
    select: {
      id: true,
      state: true
    }
  })

  const coincidencias= coincidenciasFound.length
  const coincidenciasOK= coincidenciasFound.filter(c=> c.state==="checked").length
  // tasaOK with 2 decimals
  const tasaOK= coincidencias ? Math.round((coincidenciasOK/coincidencias)*10000)/100 : 0

  const data: StatFormValues= {
    inmo: inmoSlug,
    propiedades: inmo.properties.length,
    pedidos: pedidosFound.length,
    coincidencias,
    coincidenciasOK,
    tasaOK
  }

  const updated= await prisma.stat.upsert({
    where: {
      inmo: inmoSlug
    },
    update: data,
    create: data
  })

  return updated
}