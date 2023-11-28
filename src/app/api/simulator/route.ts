import { NextResponse } from "next/server"

export async function POST(request: Request ) {

    try {
        
        const json= await request.json()
        const notification= JSON.parse(json)
        console.log("inmobiliaria: ", notification.propiedad.inmobiliaria)        
        console.log("celulares: ", notification.celulares)
        console.log("pedido #", notification.pedido.number)
        console.log("idPropiedad", notification.propiedad.idPropiedad)
        console.log("tablero", notification.tablero)
        console.log("----------------------")


        return NextResponse.json({ data: "ACK" }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
}

