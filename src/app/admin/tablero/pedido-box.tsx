import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { formatPresupuesto } from "@/lib/utils"
import { PedidoDAO } from "@/services/pedido-services"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Info, Target } from "lucide-react"

type Props= {
    pedido: PedidoDAO
    cantCoincidencias: number
}

export default function PedidoBox({pedido, cantCoincidencias}: Props) {
    const numberFormatted= pedido.number.toString().padStart(4, "0")
    const formattedDate= format(pedido.createdAt, "dd MMMM, yyyy - HH:mm 'h'", { locale: es })

    return (
        <Card>
            <CardHeader className="px-4">
                <div className="flex justify-between">
                    <div className="flex gap-10">
                        <CardTitle>Pedido {numberFormatted}</CardTitle>
                        <HoverCard>
                            <HoverCardTrigger><Info size={20}/></HoverCardTrigger>
                            <HoverCardContent className="w-72">
                                <p className="mb-5 text-lg font-bold">Texto original del pedido:</p>
                                <p className="text-sm whitespace-pre-wrap">{pedido.text}</p>
                            </HoverCardContent>
                        </HoverCard>
                    </div>
                    <p className="text-green-400 font-bold flex items-center gap-1 text-2xl"><Target size={20} />{cantCoincidencias}</p>
                </div>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </CardHeader>
            <CardContent className="text-muted-foreground px-4">
            <div className="flex gap-2">
                <div className="flex flex-col justify-between">
                    <div className="grid grid-cols-[1fr_2fr] gap-2 w-[260px]">
                        <p>Operación: </p>
                        <p className="font-bold">{pedido.operacion?.toUpperCase()}</p>
                        <p>Tipo: </p>
                        <p className="font-bold whitespace-nowrap">{pedido.tipo}</p>
                        <p>Dormitorios: </p>
                        <p className="font-bold whitespace-nowrap">{pedido.dormitorios}</p>
                        <p>Presupuesto: </p>
                        <p className="font-bold">{pedido.presupuesto}</p>
                        <p className="border-t pt-2">Grupo: </p>
                        <p className="font-bold pt-2 border-t">{pedido.group}</p>
                        <p>Nombre: </p>
                        <p className="font-bold">{pedido.name}</p>
                        <p>Contacto: </p>
                        <p className="font-bold">{pedido.phone}</p>
                    </div>
                </div>
                <div className="flex flex-col justify-between flex-1 pl-2 border-l gap-7">
                    <div>
                        <p className="font-bold">Características: </p>
                        <p>{pedido.caracteristicas}</p>
                    </div>
                    <div>
                        <p><span className="font-bold">Zona:</span> {pedido.zona}</p>
                    </div>
                </div>
            </div>
            </CardContent>
        </Card>

  )
}



function getContacto(pedido: PedidoDAO) {
    if (!pedido.phone)
        return pedido.contacto
    
    if (!pedido.contacto || pedido.contacto === "N/D")
        return " (+" + pedido.phone + ")"

    return pedido.contacto + " (" + pedido.phone + ")"
}