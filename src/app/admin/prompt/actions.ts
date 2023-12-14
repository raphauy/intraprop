"use server"

import { setValue } from "@/services/config-services"
import { PedidoDAO, getPedidoDAO } from "@/services/pedido-services"
import { revalidatePath } from "next/cache"

export async function getPedidoDAOAction(id: string): Promise<PedidoDAO | null> {
  return getPedidoDAO(id)
}

export async function setPrompt(prompt: string): Promise<boolean> {
  const updated= await setValue("PROMPT", prompt)

  if (updated) {
    revalidatePath("/admin/prompt")
  }

  return updated !== null
}
