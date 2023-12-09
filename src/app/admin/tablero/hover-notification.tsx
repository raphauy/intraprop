
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { cn, mapNotificationStatus } from "@/lib/utils"
import { CoincidenceDAO } from "@/services/coincidence-services"
import { format } from "date-fns"
import { BellRing } from "lucide-react"

type Props = {
    coincidence: CoincidenceDAO
}

 
export default function HoverNotification({ coincidence }: Props) {
    const notificationPedido= coincidence.notificationPedido
    if (!notificationPedido) return null

    return (
        <div>
            <HoverCard>
                <HoverCardTrigger>
                    <BellRing size={20} className={cn(notificationPedido.status === "error" && "text-red-500", notificationPedido.status === "sent" && "text-green-500")}/>
                </HoverCardTrigger>
                <HoverCardContent className="w-72">
                    <p className="mb-5 text-lg font-bold">Notificación</p>
                    <div className="flex flex-col gap-1">
                        <p className="">Estado: <span className="font-bold">{mapNotificationStatus(notificationPedido.status)}</span></p>
                        {
                            notificationPedido.error &&
                            <p className="">Error: {notificationPedido.error}</p>
                        }
                        
                        {
                            notificationPedido.sentAt &&
                            <p className="">Fecha envío: <span className="font-bold">{format(notificationPedido.sentAt, "dd/MM/yyyy HH:mm")}</span></p>
                        }
                        <p className="">Score: <span className="font-bold">{coincidence.score}</span></p>
                        
                    </div>                
                    
                </HoverCardContent>
            </HoverCard>

        </div>
    )
}
