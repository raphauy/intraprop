"use server"

import { revalidatePath } from "next/cache"
import { InmobiliariaDAO, InmobiliariaFormValues, createInmobiliaria, updateInmobiliaria, getInmobiliariaDAO, deleteInmobiliaria, getInmobiliariasDAO } from "@/services/inmobiliaria-services"

export async function getInmobiliariaDAOAction(id: string): Promise<InmobiliariaDAO | null> {
  return getInmobiliariaDAO(id)
}

export async function getInmobiliariasDAOAction(): Promise<InmobiliariaDAO[] | null> {
  return getInmobiliariasDAO()
}

export async function createOrUpdateInmobiliariaAction(id: string | null, data: InmobiliariaFormValues): Promise<InmobiliariaDAO | null> {       
  let updated= null
  if (id) {
      updated= await updateInmobiliaria(id, data)
  } else {
      updated= await createInmobiliaria(data)
  }     

  revalidatePath("/admin/inmobiliarias")

  return updated as InmobiliariaDAO
}

export async function deleteInmobiliariaAction(id: string): Promise<InmobiliariaDAO | null> {    
  const deleted= await deleteInmobiliaria(id)

  revalidatePath("/admin/inmobiliarias")

  return deleted as InmobiliariaDAO
}
