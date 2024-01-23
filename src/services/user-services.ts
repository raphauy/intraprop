import * as z from "zod"
import { prisma } from "@/lib/db"
import { getInmobiliariaDAOByslug } from "./inmobiliaria-services"

export type UserDAO = {
  id:  string
	name?:  string
	email:  string
	role:  string
	emailVerified?:  Date
	image?:  string
  inmobiliariaId?: string
  inmobiliariaName?: string 
}

export const userFormSchema = z.object({
	name: z.string().optional(),
	email: z.string({required_error: "Email is required."}),
	role: z.string({required_error: "Role is required."}),
	image: z.string().optional(),
  inmobiliariaId: z.string().optional(),
})
export type UserFormValues = z.infer<typeof userFormSchema>

export async function getUsersDAO() {
  const found = await prisma.user.findMany({
    orderBy: {
      id: "asc"
    },
    include: {
      inmobiliaria: true
    }
  })

  const res: UserDAO[]= found.map(convert)

  return res
}

function convert(user: any): UserDAO {
  return {
    id: user.id,
    name: user.name || "",
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified || undefined,
    image: user.image || undefined,
    inmobiliariaName: user.inmobiliaria?.name || undefined
  }
}

export async function getUsersDAOBySlug(slug: string) {
  const inmobiliaria= await getInmobiliariaDAOByslug(slug)
  const found = await prisma.user.findMany({
    where: {
      inmobiliariaId: inmobiliaria.id
    },
    orderBy: {
      id: "asc"
    },
    include: {
      inmobiliaria: true
    }
  })
  const res: UserDAO[]= found.map(convert)

  return res
}

export async function getUserDAO(id: string) {
  const found = await prisma.user.findUnique({
    where: {
      id
    },
    include: {
      inmobiliaria: true
    }
  })

  const res= convert(found)

  return res
}
    
export async function createUser(data: UserFormValues) {
  const created = await prisma.user.create({
    data
  })
  return created
}

export async function updateUser(id: string, data: UserFormValues) {
  const updated = await prisma.user.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function deleteUser(id: string) {
  const deleted = await prisma.user.delete({
    where: {
      id
    },
  })
  return deleted
}
    