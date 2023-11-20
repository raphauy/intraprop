"use client"

import { useState } from "react"
import { runThreadAction } from "./pedido-actions"
import { Button } from "@/components/ui/button"
import { Loader, PlayCircle } from "lucide-react"
import { PedidoDAO } from "@/services/pedido-services"
import { toast } from "@/components/ui/use-toast"

type Prop = {
    pedido: PedidoDAO
}
export default function RunButton({ pedido }: Prop) {
    const [loading, setLoading] = useState(false)

    const handleRun = async () => {
        setLoading(true)
        toast({ title: "Running..."})
        runThreadAction(pedido.id)
        .then(() => {
            toast({ title: "Finalizado"})
        })
        .catch((error) => {
            toast({ title: `Algo salió mal(${error.message}))`, variant: "destructive"} )
        })
        .finally(() => {
            setLoading(false)
        })
    }
  return (
    <div>
          <Button variant="ghost" className="p-0" onClick={handleRun}>
            {
                loading ? <Loader className="w-6 h-6 animate-spin" /> : <PlayCircle className="w-6 h-6" />
            }
          </Button>

    </div>
  )
}
