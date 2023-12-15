import { getValue } from "@/services/config-services";
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
        
        const inmobiliariaId = params.inmobiliariaId
        if (!inmobiliariaId) return NextResponse.json({ error: "inmobiliariaId is required" }, { status: 400 })

        const json= await request.json()
        console.log("json: ", json)

        const idPropiedad= json.idPropiedad
        if (!idPropiedad) {
            console.log("idPropiedad is required")            
            return NextResponse.json({ error: "idPropiedad is required" }, { status: 400 })
        }

        const dormitorios= json.dormitorios
        if (dormitorios && isNaN(dormitorios)) {
            console.log("dormitorios is not a number")            
            return NextResponse.json({ error: "dormitorios is not a number" }, { status: 400 })
        }
        const isAlquilable= json.precioAlquiler && json.monedaAlquiler
        if (isAlquilable) {
            const monedaAlquiler= json.monedaAlquiler.toUpperCase()
            if (monedaAlquiler === "USD" || monedaAlquiler === "U$S") {
                const COTIZACION= await getValue("COTIZACION")
                let cotizacion= 40
                if(COTIZACION) cotizacion= parseFloat(COTIZACION)
                else console.log("COTIZACION not found")

                json.precioAlquilerUYU= Math.round(parseFloat(json.precioAlquiler) * cotizacion)
            } else if (monedaAlquiler === "UYU" || monedaAlquiler === "$") {
                json.precioAlquilerUYU= json.precioAlquiler
            } else {
                console.log("monedaAlquiler is not valid")                
            }
        }
        const isSellable= json.precioVenta && json.monedaVenta
        if (!isAlquilable && !isSellable) {
            console.log("****************************************************")            
            console.log("ALERT: precioVenta and/or precioAlquiler is required")            
            console.log("****************************************************")            
        }

        const updated= await createOrUpdatePropertyWithPrisma(json, inmobiliariaId)

        if (!updated) return NextResponse.json({ error: "error updating property" }, { status: 502 })

        await updateEmbedding(updated.id)

        console.log("updated!")
        return NextResponse.json({ data: "ACK" }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
}

