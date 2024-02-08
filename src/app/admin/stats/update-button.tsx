"use client"

import { Button } from "@/components/ui/button"
import { Loader, RefreshCw } from "lucide-react"
import { useState } from "react"
import { updateInmoStatsAction } from "./stat-actions"
import { toast } from "@/components/ui/use-toast"

export default function UpdateAllButton() {

    const [loading, setLoading] = useState(false)

    function updateAll() {
        setLoading(true)
        updateInmoStatsAction("ALL")
        .then(() => {
            toast({ title: "Estadísticas actualizadas" })
        })
        .catch((error) => {
            toast({ title: "Error al actualizar estadísticas", variant: "destructive" })
        })
        .finally(() => {
            setLoading(false)
        })
    }

    return (
        <Button onClick={updateAll} className="w-40 ml-2 gap-1">
            { loading ? <Loader className="h-4 w-4 animate-spin" /> : "Actualizar todos" }            
        </Button>
    )
}

type Props = {
    inmo: string
}
export function UpdateButton({ inmo }: Props) {

    const [loading, setLoading] = useState(false)

    function updateAll() {
        setLoading(true)
        updateInmoStatsAction(inmo)
        .then(() => {
            toast({ title: "Estadísticas actualizadas" })
        })
        .catch((error) => {
            toast({ title: "Error al actualizar estadísticas", variant: "destructive" })
        })
        .finally(() => {
            setLoading(false)
        })
    }

    return (
        <Button onClick={updateAll} variant="ghost" className="ml-2 gap-1">
            { loading ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-5" /> }            
        </Button>
    )
}
