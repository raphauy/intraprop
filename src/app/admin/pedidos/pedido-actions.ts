"use server"

import { revalidatePath } from "next/cache"
import { PedidoDAO, PedidoFormValues, createPedido, updatePedido, getPedidoDAO, deletePedido, runThread, createCoincidencesProperties, removeCoincidences } from "@/services/pedido-services"
import { createPedidoWithFunctions, updatePedidoWithFunctions } from "@/services/openai-services"

export async function getPedidoDAOAction(id: string): Promise<PedidoDAO | null> {
  return getPedidoDAO(id)
}

export async function createOrUpdatePedidoAction(id: string | null, data: PedidoFormValues): Promise<PedidoDAO | null> {       
  let updated= null
  if (id) {
      updated= await updatePedido(id, data)
  } else {
      updated= await createPedidoWithFunctions(data.text, data.phone, data.name, data.group)
  }

  if (!updated) throw new Error("Error al crear el pedido")
  
  await new Promise(resolve => setTimeout(resolve, 2000))

  //await createCoincidencesProperties(updated.id)

  revalidatePath("/admin/pedidos")
  revalidatePath("/admin/tablero")

  return updated as PedidoDAO
}

export async function deletePedidoAction(id: string): Promise<PedidoDAO | null> {    
  const deleted= await deletePedido(id)

  revalidatePath("/admin/pedidos")
  revalidatePath("/admin/tablero")

  return deleted as PedidoDAO
}

export async function runThreadAction(id: string): Promise<boolean> {
  //const ok= await runThread(id)

  //const res= await createCoincidencesProperties(id)

  const updated= await updatePedidoWithFunctions(id)
  if (!updated) throw new Error("Error al actualizar el pedido")

  await new Promise(resolve => setTimeout(resolve, 4000))

  await removeCoincidences(updated.id)
  await createCoincidencesProperties(updated.id)

  console.log("revalidating...");
  
  revalidatePath("/admin/pedidos")
  revalidatePath("/admin/tablero")
  
  return true
}