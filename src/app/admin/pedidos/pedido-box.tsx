"use client"

import { PedidoDAO } from "@/services/pedido-services"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowRightSquare, BedSingle, Building, Contact2, Home, MapPin } from "lucide-react"

type Props = {
    pedido: PedidoDAO
}

export default function PedidoBox({ pedido }: Props) {
    const formattedCreated= format(pedido.createdAt, "HH:mm - MMMM dd, yyyy", { locale: es })
    return (
        <div className="p-2 space-y-2 text-lg border rounded-xl xl:min-w-[400px]">
            <div className="grid grid-cols-1 text-center lg:grid-cols-3">
                <p className="font-bold lg:text-left">{pedido.operacion}</p>
                <div className="flex items-center justify-center flex-1 gap-2 font-bold text-center">
                    <p className="whitespace-nowrap">{pedido.tipo}</p>
                    <p className="flex items-center">{pedido.dormitorios}<BedSingle /></p>
                </div>
                <p className="self-end font-bold lg:text-right">{pedido.presupuesto}</p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2 text-sm border-t">
                <div>
                    <MapPin size={20}/>
                </div>
                <p className="flex items-center gap-2">{pedido.zona}</p>
            </div>
            <div className="flex items-center gap-2 pt-2 text-sm border-t">
                <div>
                    <ArrowRightSquare size={20}/>
                </div>
                <p className="flex items-center gap-2">{pedido.caracteristicas}</p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 text-sm border-t">
                <div className="flex items-center gap-2">
                    <Contact2 size={20}/> {pedido.contacto}
                </div>
                <p className="flex items-center gap-2">{formattedCreated}</p>
            </div>

        </div>

    )
}
