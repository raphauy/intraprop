import * as z from "zod"
import { prisma } from "@/lib/db"
import { slugify } from "@/lib/utils"

export type InmobiliariaDAO = {
  id:  string
	name:  string
	description?:  string
	url?:  string
	celulares?:  string
	slug:  string
	createdAt:  Date
	updatedAt:  Date
}

export const inmobiliariaFormSchema = z.object({
	name: z.string({required_error: "Name is required."}),
	description: z.string().optional(),
	url: z.string().optional(),
	celulares: z.string().optional(),
})
export type InmobiliariaFormValues = z.infer<typeof inmobiliariaFormSchema>

export async function getInmobiliariasDAO() {
  const found = await prisma.inmobiliaria.findMany({
    orderBy: {
      createdAt: "desc"
    },
  })
  return found as InmobiliariaDAO[]
}

// get total amout of properties on the database
export async function getTotalProperies() {
  const found = await prisma.property.count()
  return found  
}

export async function getTotalProperiesByInmobiliaria(inmobiliariaId: string) {
  const found = await prisma.property.count({
    where: {
      inmobiliariaId
    }
  })
  return found  
}
  
export async function getInmobiliariaDAO(id: string) {
  if (!id) throw new Error("id is required")
  
  const found = await prisma.inmobiliaria.findUnique({
    where: {
      id
    },
  })
  return found as InmobiliariaDAO
}

export async function getInmobiliariaDAOByslug(slug: string) {
  const found = await prisma.inmobiliaria.findUnique({
    where: {
      slug
    },
  })
  return found as InmobiliariaDAO
}
    
export async function createInmobiliaria(data: InmobiliariaFormValues) {
  const slug= slugify(data.name)
  const created = await prisma.inmobiliaria.create({
    data: {
      ...data,
      slug
    },
  })

  return created
}

export async function updateInmobiliaria(id: string, data: InmobiliariaFormValues) {
  const slug= slugify(data.name)
  const updated = await prisma.inmobiliaria.update({
    where: {
      id
    },
    data: {
      ...data,
      slug
    },
  })
  return updated
}

export async function deleteInmobiliaria(id: string) {
  const deleted = await prisma.inmobiliaria.delete({
    where: {
      id
    },
  })
  return deleted
}
    