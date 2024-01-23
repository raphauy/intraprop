import { getCurrentUser } from "@/lib/auth";
import { getOperaciones, getPedidosDAO, getTipos } from "@/services/pedido-services";
import { redirect } from "next/navigation";
import { columns } from "./pedido-columns";
import { DataTable } from "./pedido-table";

interface Props {
  children: React.ReactNode;
}

export default async function TableroLayout({ children }: Props) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return redirect("/login")
  }

  if (currentUser?.role !== "admin") {
    return redirect("/unauthorized?message=No estas autorizado para acceder a esta página")
  }

  const data = await getPedidosDAO("ALL");
  const operaciones= await getOperaciones()
  const tipos= await getTipos()

  return (
    <div className="mx-1 flex flex-col w-full gap-2 lg:items-start xl:gap-4 lg:flex-row sm:items-center">
      <div className="sm:w-full lg:w-[450px] mt-3">
        <DataTable columns={columns} data={data} subject="Pedido" columnsOff={["tipo"]} operaciones={operaciones} tipos={tipos} />
      </div>
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  )
}
