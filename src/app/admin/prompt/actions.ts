"use server"

import { revalidatePath } from "next/cache"
import { PedidoDAO, PedidoFormValues, createPedido, updatePedido, getPedidoDAO, deletePedido, runThread, createCoincidencesProperties } from "@/services/pedido-services"
import { createPedidoWithFunctions, updatePedidoWithFunctions } from "@/services/openai-services"
import { setValue, updateConfig } from "@/services/config-services"

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
