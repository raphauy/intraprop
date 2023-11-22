import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import { Ban, BedSingle, CheckCircle2, ExternalLink, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CoincidenceDAO } from "@/services/coincidence-services"
import { cn, distanceToPercentage, formatNumberWithDots } from "@/lib/utils"
import { number } from "zod"

type Props = {
    coincidencias: CoincidenceDAO[]
    operacion: string
}

export default function Coincidencias({ coincidencias, operacion }: Props) {
    if (coincidencias.length === 0) 
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No hay Coincidencias</CardTitle>
                </CardHeader>
            </Card>
    )
    return (
        <Card>
            <CardHeader className="px-4">
                <CardTitle>Coincidencias</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground px-1 xl:px-4">
                <div className="p-2 border rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Id</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead>Zona</TableHead>
                        <TableHead>Inmobiliaria</TableHead>
                        <TableHead>Score/Estado</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            coincidencias.map((coincidencia) => {
                                const precioVenta= operacion.toUpperCase() === "VENTA" ? `${formatNumberWithDots(coincidencia.property.precioVenta)} ${coincidencia.property.monedaVenta}` : ""
                                const precioAlquiler= operacion.toUpperCase() === "ALQUILER" || operacion.toUpperCase() === "ALQUILAR" ? `${formatNumberWithDots(coincidencia.property.precioAlquiler)}${coincidencia.property.monedaAlquiler}/mes` : ""
                                const precio= precioVenta || precioAlquiler

                                const distance= coincidencia.distance
                                const score= distanceToPercentage(distance)
                                return (
                                <TableRow key={coincidencia.id}>
                                    <TableCell>{coincidencia.property.idPropiedad}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-bold">{coincidencia.property.tipo}</p>
                                            <p className="flex items-center">{coincidencia.property.dormitorios} <BedSingle size={20} /></p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{precio}</TableCell>
                                    <TableCell><p className="dos-lineas">{coincidencia.property.zona}</p></TableCell>
                                    <TableCell>
                                        <Link href={`/${coincidencia.property.inmobiliariaSlug}/tablero?id=${coincidencia.pedidoId}`} target="_blank">
                                            <Button size="sm" variant="link" className="flex flex-col items-start px-0">
                                                <p className="whitespace-nowrap">{coincidencia.property.inmobiliariaName}</p>
                                                { coincidencia.number !== 0 && <p>#{coincidencia.number} </p> }
                                            </Button>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="flex items-center gap-1 justify-between">
                                        <div className="flex items-center gap-1">
                                            <p className={
                                                cn("border-[3px] h-8 w-8 rounded-full flex items-center justify-center font-bold", 
                                                coincidencia.state === "checked" && score < 50 && "border-red-500",
                                                coincidencia.state === "checked" && 50 <= score && score < 60 && "border-yellow-500",
                                                coincidencia.state === "checked" && 60 <= score && "border-green-500",
                                                )}>{score}
                                            </p>
                                            <div className="w-fit">{
                                                coincidencia.state === "checked" ? "" : 
                                                coincidencia.state === "zone_banned" ? <p className="flex items-center"><Ban /> Z</p>: 
                                                coincidencia.state === "budget_banned" ? <p className="flex items-center"><Ban /> $</p>: 
                                                "pending"
                                                }
                                            </div>
                                        </div>
                                        <Link href={coincidencia.property.url} target="_blank" className="">
                                            <Button size="sm" variant="link"><ExternalLink /></Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            )})
                        }
                    </TableBody>
                </Table>
                </div>
            </CardContent>
        </Card>
  )
}
