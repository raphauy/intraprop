"use server"

import { getShareData, setSharedBy } from "@/services/coincidence-services"
import { revalidatePath } from "next/cache"

export type WapShareData= {
    pedidoName: string
    pedidoPhone: string
    groupName: string
    inmoName: string
    url: string
}

export async function getShareDataAction(coincidenceId: string) {
    const res= getShareData(coincidenceId)

    return res
}

export async function setSharedByAction(coincidenceId: string, userName: string) {
    const res= setSharedBy(coincidenceId, userName)

    revalidatePath("/admin/tablero")

    return res
}