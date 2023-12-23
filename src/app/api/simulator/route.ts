import { NextResponse } from "next/server"

export async function POST(request: Request ) {

    try {
        
        const json= await request.json()
        const notification= JSON.parse(json)
        console.log(notification)        
        
        console.log("pedido #", notification.number)
        console.log("inmobiliaria: ", notification.inmobiliaria)        
        console.log("celulares: ", notification.celulares)
        console.log("tablero", notification.tablero)
        console.log("name", notification.name)
        console.log("group", notification.group)
        const coincidences= notification.coincidencias
        console.log("coincidences: ")
        for(const coincidence of coincidences) {
            console.log("\tcoincidence: #", coincidence.number)
            console.log("\tscore: ", coincidence.score)
            console.log("\tidPropiedad: ", coincidence.idPropiedad)
            console.log("\ttipo: ", coincidence.tipo)
            console.log("\tvalor: ", coincidence.valor)
            console.log("\tmoneda: ", coincidence.moneda)
            console.log("\tzona: ", coincidence.zona)
            console.log("\turl: ", coincidence.url)
        }
        console.log("----------------------")

        // sleep 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));

        return NextResponse.json({ data: "ACK" }, { status: 200 })

    } catch (error) {
        console.log("error: ", error)        
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
}

