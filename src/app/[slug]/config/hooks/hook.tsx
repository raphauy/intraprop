"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import useCopyToClipboard from "@/lib/useCopyToClipboard"
import { Copy, Edit } from "lucide-react"
import { useEffect, useState } from "react"

interface Props {
    updateEndpoint: string
}

export default function Hook({ updateEndpoint }: Props) {

    const [value, copy] = useCopyToClipboard()
    const [updateAPIEndpoint, setUpdateAPIEndpoint] = useState(updateEndpoint)

    function copyUpdateAPIEndpointIdToClipboard(){   
        copy(updateAPIEndpoint)    
        toast({title: "Update API Endpoint copiado" })
    }

    return (
        <div>
            <div className="flex items-center gap-4 pb-3 mb-3 border-b">
                <p><strong>Update API Endpoint</strong>: {updateAPIEndpoint}</p>
                <Button variant="ghost" className="p-1 h-7"><Copy onClick={copyUpdateAPIEndpointIdToClipboard} /></Button>
            </div>
        </div>
    )
}
