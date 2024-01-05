import { deleteAllPropertiesOfInmo, deletePropertyOfInmobiliariaByIdPropiedad } from "@/services/property-services";
import { NextResponse } from "next/server";

type Props = {
    params: {
        inmobiliariaId: string
    }
}

export async function POST(request: Request, { params }: Props) {

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

        if (idPropiedad === "ALL") {
            const deleted= await deleteAllPropertiesOfInmo(inmobiliariaId)
            if (!deleted) return NextResponse.json({ error: "properties not found" }, { status: 404 })
            console.log(`properties of inmo ${inmobiliariaId} deleted`)
            return NextResponse.json({ data: "ACK" }, { status: 200 })
        } else {

            const deleted= await deletePropertyOfInmobiliariaByIdPropiedad(inmobiliariaId, idPropiedad)
            if (!deleted) return NextResponse.json({ error: "property not found" }, { status: 404 })
            console.log(`property ${idPropiedad} of inmo ${inmobiliariaId} deleted`)
            return NextResponse.json({ data: "ACK" }, { status: 200 })
        }

    } catch (error) {
        return NextResponse.json({ error: "error: " + error}, { status: 502 })        
    }
   
}

