import PedidoBox from "@/app/admin/tablero/pedido-box"
import { getCoincidencesDAOByInmo } from "@/services/coincidence-services"
import { getInmobiliariaDAOByslug } from "@/services/inmobiliaria-services"
import { getLastPedidoDAO, getPedidoDAO } from "@/services/pedido-services"
import { redirect } from "next/navigation"
import Coincidencias from "./coincidencias"

type Props = {
  searchParams: {
    id: string
    coincidenceId?: string
  }
  params: {
    slug: string
  }
}
export default async function TableroPage({ searchParams, params }: Props) {
  const coincidenceId = searchParams.coincidenceId
  const slug= params.slug
  const inmo= await getInmobiliariaDAOByslug(slug)
  if (!inmo) {
    return <div>Inmobiliaria {params.slug} no encontrada</div>
  }

  const id = searchParams.id
  if (!id) {
    const last= await getLastPedidoDAO()
    if (last) {
      redirect(`/${slug}/tablero?id=${last.id}`)
    } else {
      return <div className="mt-6">No hay pedidos en la base de datos</div>
    }
  }
  const pedido= await getPedidoDAO(id)
  const coincidencias= await getCoincidencesDAOByInmo(pedido.id, inmo.id)
  const coincidencesSent= coincidencias.filter((coincidence) => coincidence.state === "checked")

  return (
    <main className="flex flex-col gap-2 mt-6 overflow-auto lg:gap-8 ">
    {
      pedido && <PedidoBox pedido={pedido} cantCoincidencias={coincidencesSent.length} />
    }
    {
      // pedido && <Coincidencias coincidencias={coincidencias} operacion={pedido.operacion || ""} coincidenceId={coincidenceId}/>
      pedido && <Coincidencias coincidencias={coincidencesSent} operacion={pedido.operacion || ""} coincidenceId={coincidenceId}/>
    }
    
  </main>

  )
}
