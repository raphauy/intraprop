"use server"

import { revalidatePath } from "next/cache"
import { ConfigDAO, ConfigFormValues, createConfig, updateConfig, getConfigDAO, deleteConfig } from "@/services/config-services"
import { getCurrentUser } from "@/lib/auth"

export async function getConfigDAOAction(id: string): Promise<ConfigDAO | null> {
  return getConfigDAO(id)
}

export async function createOrUpdateConfigAction(id: string | null, data: ConfigFormValues): Promise<ConfigDAO | null> {       
  let updated= null
  if (id) {
      updated= await updateConfig(id, data)
  } else {
      updated= await createConfig(data)
  }     

  revalidatePath("/admin/configs")

  return updated as ConfigDAO
}

export async function deleteConfigAction(id: string): Promise<ConfigDAO | null> {    
  const user= await getCurrentUser()
  const isRapha= user?.email === "rapha.uy@rapha.uy"
  if (!isRapha) {
    throw new Error("You are not authorized to delete configs.")
  }

  const deleted= await deleteConfig(id)

  revalidatePath("/admin/configs")

  return deleted as ConfigDAO
}
