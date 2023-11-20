import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card"
import { BedSingle, CheckCircle2, ExternalLink, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CoincidenceDAO } from "@/services/coincidence-services"
import { cn, formatNumberWithDots } from "@/lib/utils"

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
                        <TableHead>Dist.</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            coincidencias.map((coincidencia) => {
                                const precioVenta= operacion.toUpperCase() === "VENTA" ? `${formatNumberWithDots(coincidencia.property.precioVenta)} ${coincidencia.property.monedaVenta}` : ""
                                const precioAlquiler= operacion.toUpperCase() === "ALQUILER" ? `${formatNumberWithDots(coincidencia.property.precioAlquiler)}${coincidencia.property.monedaVenta}/mes` : ""
                                const precio= precioVenta || precioAlquiler

                                const distance= coincidencia.distance
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
                                                <p>#{coincidencia.number} </p>
                                            </Button>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="flex items-center">
                                        <p>{distance}{distance < 0.5 && <CheckCircle2 className="text-green-500"/>}</p>
                                        <Link href={coincidencia.property.url} target="_blank">
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
