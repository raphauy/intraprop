import { getCoincidencesDAO } from "@/services/coincidence-services"
import { getLastPedidoDAO, getPedidoDAO } from "@/services/pedido-services"
import { redirect } from "next/navigation"
import Coincidencias from "./coincidencias"
import PedidoBox from "./pedido-box"

type Props = {
  searchParams: {
    id: string
    coincidenceId?: string
  }
}
export default async function TableroPage({ searchParams }: Props) {

  const id = searchParams.id
  const coincidenceId = searchParams.coincidenceId
  if (!id) {
    const last= await getLastPedidoDAO()
    if (last) {
      redirect(`/admin/tablero?id=${last.id}`)
    } else {
      return <div className="mt-6">No hay pedidos en la base de datos</div>
    }
  }
  const pedido= await getPedidoDAO(id)
  const coincidencias= await getCoincidencesDAO(id)
  const coincidenciasOver60= coincidencias.filter((coincidence) => coincidence.score >= 60)
  const coincidencesSent= coincidencias.filter((coincidence) => coincidence.state === "checked")

  return (
    <main className="flex flex-col gap-2 mt-[25px] overflow-auto lg:gap-8 ">
    {
      pedido && <PedidoBox pedido={pedido} cantCoincidencias={coincidencesSent.length} />
    }
    {
      pedido && <Coincidencias coincidencias={coincidenciasOver60} operacion={pedido.operacion || ""} coincidenceId={coincidenceId} presupuestoLog={pedido.presupuestoLog} />
    }
    
  </main>

  )
}
