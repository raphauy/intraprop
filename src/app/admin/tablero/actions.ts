"use server"

import { getShareData, setSharedBy } from "@/services/coincidence-services"
import { revalidatePath } from "next/cache"

export type WapShareData= {
    pedidoName: string
    pedidoPhone: string
    pedidoText: string
    groupName: string
    inmoName: string
    url: string
}

export async function getShareDataAction(coincidenceId: string) {
    const res= getShareData(coincidenceId)

    return res
}

export async function setSharedByAction(coincidenceId: string, userName: string, destination: string, text: string) {
    const res= setSharedBy(coincidenceId, userName, destination, text)

    revalidatePath("/admin/tablero")

    return res
}