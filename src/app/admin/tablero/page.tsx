import { getLastPedidoDAO, getPedidoDAO } from "@/services/pedido-services"
import { redirect } from "next/navigation"
import PedidoBox from "./pedido-box"
import Coincidencias from "./coincidencias"
import { getCoincidencesDAO } from "@/services/coincidence-services"

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

  return (
    <main className="flex flex-col gap-2 mt-[25px] overflow-auto lg:gap-8 ">
    {
      pedido && <PedidoBox pedido={pedido} cantCoincidencias={coincidencias.length} />
    }
    {
      pedido && <Coincidencias coincidencias={coincidencias} operacion={pedido.operacion || ""} coincidenceId={coincidenceId} presupuestoLog={pedido.presupuestoLog} />
    }
    
  </main>

  )
}
