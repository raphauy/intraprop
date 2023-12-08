import { createOrUpdatePedidoAction } from "@/app/admin/pedidos/pedido-actions";
import { updateEmbedding } from "@/services/property-services";
import { createOrUpdatePropertyWithPrisma } from "@/services/propertyUpdateService";
import { NextResponse } from "next/server";

type Props = {
    params: {
        inmobiliariaId: string
    }
}

export async function POST(request: Request, { params }: Props ) {

    try {
        const authorization = request.headers.get("authorization")
        if (!authorization) return NextResponse.json({ error: "authorization is required" }, { status: 400 })
        const apiToken= authorization.replace("Bearer ", "")
        if (!apiToken) return NextResponse.json({ error: "apiToken is required" }, { status: 400 })
        if (apiToken !== process.env.API_TOKEN) return NextResponse.json({ error: "Bad apiToken" }, { status: 400 })
        
        const json= await request.json()
        console.log("json: ", json)

        const message= json.message
        const text= message.text
        const phone= message.phone + ""
        const name= message.name
        const group= message.group

        if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 })
        if (!phone) return NextResponse.json({ error: "phone is required" }, { status: 400 })

        const dataPedido= {
            text: text,
            phone: phone as string,
            name: name as string,
            group: group as string,
        }

        const updated= await createOrUpdatePedidoAction(null, dataPedido)

        if (!updated) return NextResponse.json({ error: "error: " + "No se pudo crear el pedido."}, { status: 502 })

        return NextResponse.json({ data: "ACK" }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
}

