import { getZona } from "@/app/admin/tablero/coincidencias"
import HoverNotification from "@/app/admin/tablero/hover-notification"
import HoverShared from "@/app/admin/tablero/hover-shared"
import { ShareDialog } from "@/app/admin/tablero/share-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn, distanceToPercentage, formatNumberWithDots } from "@/lib/utils"
import { CoincidenceDAO } from "@/services/coincidence-services"
import { getValue } from "@/services/config-services"
import { Ban, BedSingle, BellRing, Car, Drumstick, ExternalLink, Share2, Waves } from "lucide-react"
import Link from "next/link"

type Props = {
    coincidencias: CoincidenceDAO[]
    operacion: string
    coincidenceId?: string
}

export default async function Coincidencias({ coincidencias, operacion, coincidenceId }: Props) {
    const MIN_SCORE_ALTA= await getValue("MIN_SCORE_ALTA")
    const minScoreAlta= MIN_SCORE_ALTA ? parseInt(MIN_SCORE_ALTA) : 60

    const MIN_SCORE_MEDIA= await getValue("MIN_SCORE_MEDIA")
    const minScoreMedia= MIN_SCORE_MEDIA ? parseInt(MIN_SCORE_MEDIA) : 50

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
                        <TableHead className="flex items-center text-lg gap-1"><p>#</p><BellRing size={18} /></TableHead>
                        <TableHead>Coincidencia</TableHead>
                        <TableHead className="text-center">URL</TableHead>
                        <TableHead className="text-center"><Share2 /></TableHead>
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

                                const zona= getZona(coincidencia)

                                return (
                                <TableRow key={coincidencia.id} className={cn( coincidenceId === coincidencia.id && "bg-green-100")}>
                                    <TableCell>{coincidencia.property.idPropiedad}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-bold">{coincidencia.property.tipo}</p>
                                            <div className="flex items-center gap-1">
                                                {coincidencia.property.dormitorios}<BedSingle size={20} />
                                                {coincidencia.property.garages !== "" && coincidencia.property.garages !== "0" && coincidencia.property.garages } {coincidencia.property.garages !== "" && coincidencia.property.garages !== "0" && <Car size={20} />}
                                                {coincidencia.property.parrilleros !== "" && coincidencia.property.parrilleros !== "no" && coincidencia.property.parrilleros !== "0" && <Drumstick size={20} />}
                                                {coincidencia.property.piscinas !== "" && coincidencia.property.piscinas !== "no" && coincidencia.property.piscinas !== "0" && <Waves size={20} />}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className={cn("text-right", coincidencia.state === "budget_banned" && "text-red-400")}>{precio}</TableCell>
                                    <TableCell><p className={cn("dos-lineas", coincidencia.state === "zone_banned" && "text-red-400")}>{zona}</p></TableCell>
                                    <TableCell className="text-center">                                        
                                        {coincidencia.number > 0 ? "#" + coincidencia.number : ""} 
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <div className="whitespace-nowrap text-base flex items-center gap-1">
                                                {minScoreAlta <= score && <p>Alta 💚</p>}
                                                {minScoreMedia <= score && score < minScoreAlta && <p>Media 💛</p>}
                                                {score < minScoreMedia && <p>Baja 🧡</p>}
                                                {coincidencia.notificationPedido && <HoverNotification coincidence={coincidencia} />}
                                            </div>
                                            <div className="w-fit">{
                                                    coincidencia.state === "checked" ? "" : 
                                                    coincidencia.state === "distance_banned" ? "": 
                                                    coincidencia.state === "zone_banned" ? <p className="flex items-center gap-1"><Ban className="text-red-400" /></p>: 
                                                    coincidencia.state === "budget_banned" ? <p className="flex items-center gap-1"><Ban className="text-red-400" /></p>:
                                                    coincidencia.state === "inmo_limit_reached" ? <p className="flex items-center gap-1"><Ban className="text-red-400" /></p>:
                                                    "pending"
                                                    }
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Link href={coincidencia.property.url} target="_blank">
                                            <Button size="sm" variant="link"><ExternalLink /></Button>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-center text-green-400">
                                        {
                                            coincidencia.sharedBy ? 
                                                <HoverShared text={coincidencia.sharedBy} /> :
                                                <ShareDialog coincidenceId={coincidencia.id} showSwitch={false} />
                                        }
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
