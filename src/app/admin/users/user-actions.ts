"use server"

import { revalidatePath } from "next/cache"
import { UserDAO, UserFormValues, createUser, updateUser, getUserDAO, deleteUser } from "@/services/user-services"
import { InmobiliariaDAO, getInmobiliariaDAOByslug } from "@/services/inmobiliaria-services"

export async function getUserDAOAction(id: string): Promise<UserDAO | null> {
  return getUserDAO(id)
}

export async function createOrUpdateUserAction(id: string | null, data: UserFormValues): Promise<UserDAO | null> {       
  let updated= null
  if (id) {
      updated= await updateUser(id, data)
  } else {
      updated= await createUser(data)
  }     

  revalidatePath("/admin/users")

  return updated as UserDAO
}

export async function deleteUserAction(id: string): Promise<UserDAO | null> {    
  const deleted= await deleteUser(id)

  revalidatePath("/admin/users")

  return deleted as UserDAO
}

export async function getInmobiliariaAction(slug: string): Promise<InmobiliariaDAO | null> {
  const found= await getInmobiliariaDAOByslug(slug)
  
  return found
}
