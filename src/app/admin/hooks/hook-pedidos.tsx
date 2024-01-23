"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import useCopyToClipboard from "@/lib/useCopyToClipboard"
import { Copy, Edit } from "lucide-react"
import { useEffect, useState } from "react"

interface Props {
    updateEndpoint: string
    userMessageEndpoint: string
}

export default function HookPedidos({ updateEndpoint, userMessageEndpoint }: Props) {

    const [value, copy] = useCopyToClipboard()
    const [updateAPIEndpoint, setUpdateAPIEndpoint] = useState(updateEndpoint)
    const [userMessageAPIEndpoint, setUserMessageAPIEndpoint] = useState(userMessageEndpoint)

    function copyUpdateAPIEndpointIdToClipboard(){   
        copy(updateAPIEndpoint)    
        toast({title: "Update API Endpoint copiado" })
    }

    function copyUserMessageAPIEndpointIdToClipboard(){
        copy(userMessageAPIEndpoint)
        toast({title: "User Message API Endpoint copiado" })
    }

    return (
        <div>
            <div className="flex items-center gap-4 pb-3 mb-3 border-b">
                <p><strong>Pedidos API Endpoint</strong>: {updateAPIEndpoint}</p>
                <Button variant="ghost" className="p-1 h-7"><Copy onClick={copyUpdateAPIEndpointIdToClipboard} /></Button>
            </div>
            <div className="flex items-center gap-4 pb-3 mb-3 border-b">
                <p><strong>User Message API Endpoint</strong>: {userMessageAPIEndpoint}</p>
                <Button variant="ghost" className="p-1 h-7"><Copy onClick={copyUserMessageAPIEndpointIdToClipboard} /></Button>
            </div>
        </div>
    )
}
