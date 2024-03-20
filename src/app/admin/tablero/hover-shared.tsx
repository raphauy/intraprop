
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { format } from "date-fns"
import { CheckCheck } from "lucide-react"

type Props = {
    text: string
}

 
export default function HoverShared({ text }: Props) {

    return (
        <div>
            <HoverCard>
                <HoverCardTrigger>
                    <CheckCheck className="text-sky-400" />
                </HoverCardTrigger>
                <HoverCardContent className="w-72">
                    <p>{text}</p>
                </HoverCardContent>
            </HoverCard>

        </div>
    )
}
