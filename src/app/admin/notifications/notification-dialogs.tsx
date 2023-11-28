"use client";

import { useState } from "react";
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DeleteNotificationForm } from "./notification-forms";

type DeleteProps = {
  id: string;
  description: string;
};

export function DeleteNotificationDialog({ id, description }: DeleteProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Trash2 className="hover:cursor-pointer" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Notification</DialogTitle>
          <DialogDescription className="py-8">{description}</DialogDescription>
        </DialogHeader>
        <DeleteNotificationForm closeDialog={() => setOpen(false)} id={id} />
      </DialogContent>
    </Dialog>
  );
}
