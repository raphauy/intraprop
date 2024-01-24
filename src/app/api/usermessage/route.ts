import { updatePedidoWithFunctions } from "@/services/openai-services";
import { addTextToPedido, getPedidoPaused } from "@/services/pedido-services";
import { NextResponse } from "next/server";


export async function POST(request: Request) {

    try {
        const authorization = request.headers.get("authorization")
        if (!authorization) return NextResponse.json({ error: "authorization is required" }, { status: 400 })
        const apiToken= authorization.replace("Bearer ", "")
        if (!apiToken) return NextResponse.json({ error: "apiToken is required" }, { status: 400 })
        if (apiToken !== process.env.API_TOKEN) return NextResponse.json({ error: "Bad apiToken" }, { status: 400 })
        
        const json= await request.json()
        const message= json.message
        console.log("json: ", json)
        console.log("message: ", message)

        const phone = message.phone
        if (!phone) {
            return NextResponse.json({ error: "phone is required" }, { status: 400 })
        }

        const text = message.text
        if (!text) {
            return NextResponse.json({ error: "text is required" }, { status: 400 })
        }

        console.log("usermessage API, phone: ", phone)
        console.log("usermessage API, text: ", text)

        const pedido= await getPedidoPaused(phone)
        if (!pedido) {
            console.log("usermessage API, there is no pedido paused for phone: ", phone)            
        } else {
            console.log("usermessage API, pedido updated: #", pedido.number)
            const updated= await addTextToPedido(pedido.id, text)
            await updatePedidoWithFunctions(updated.id)
        }
        
        return NextResponse.json({ data: "ACK" }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
}

