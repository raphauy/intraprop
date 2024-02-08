"use server"
  
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"
import { StatDAO, StatFormValues, createStat, updateStat, deleteStat, getStatDAO, updateAllInmoStats, updateInmoStats } from "@/services/stat-services"


export async function getStatDAOAction(id: string): Promise<StatDAO | null> {
    return getStatDAO(id)
}

export async function createOrUpdateStatAction(id: string | null, data: StatFormValues): Promise<StatDAO | null> {       
    let updated= null
    if (id) {
        updated= await updateStat(id, data)
    } else {
        // const currentUser= await getCurrentUser()
        // if (!currentUser) {
        //   throw new Error("User not found")
        // }
        // updated= await createStat(data, currentUser.id)

        updated= await createStat(data)
    }     

    revalidatePath("/admin/stats")

    return updated as StatDAO
}

export async function deleteStatAction(id: string): Promise<StatDAO | null> {    
    const deleted= await deleteStat(id)

    revalidatePath("/admin/stats")

    return deleted as StatDAO
}

export async function updateInmoStatsAction(inmo: string) {
    if (inmo === "ALL")
        await updateAllInmoStats()
    else {
        await updateInmoStats(inmo)
    }
    revalidatePath("/admin/stats")    
}