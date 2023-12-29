"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User } from "@prisma/client"
import { DialogDescription } from "@radix-ui/react-dialog"
import { useState } from "react"
import DeleteForm from "./delete-all-form"

interface Props{
  title: string
  description: string
  trigger: React.ReactNode
  inmoId: string
}

export function DeleteDialog({ title, description, trigger, inmoId}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="py-8">{description}</DialogDescription>
        </DialogHeader>
        <DeleteForm closeDialog={() => setOpen(false)} inmoId={inmoId} />
      </DialogContent>
    </Dialog>
  )
}
