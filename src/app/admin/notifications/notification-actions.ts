"use server"

import { NotificationDAO, deleteNotification, getNotificationDAO } from "@/services/notification-services"
import { revalidatePath } from "next/cache"

export async function getNotificationDAOAction(id: string): Promise<NotificationDAO | null> {
  return getNotificationDAO(id)
}

export async function deleteNotificationAction(id: string): Promise<boolean | null> {    
  const deleted= await deleteNotification(id)

  revalidatePath("/admin/notifications")

  if (!deleted) {
    return false
  }

  return true
}
