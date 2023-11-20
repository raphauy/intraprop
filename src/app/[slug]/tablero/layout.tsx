import { columns } from "@/app/admin/tablero/pedido-columns";
import { DataTable } from "@/app/admin/tablero/pedido-table";
import { getCurrentUser } from "@/lib/auth";
import { getPedidosDAO } from "@/services/pedido-services";
import { redirect } from "next/navigation";

interface Props {
  children: React.ReactNode;
  params : {
    slug: string
  }
}

export default async function TableroLayout({ children, params }: Props) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return redirect("/login")
  }

  if (currentUser?.role !== "admin" && currentUser?.role !== "inmobiliaria") {
    return redirect("/unauthorized?message=You are not authorized to access this page")
  }

  const slug= params.slug
  console.log(slug)  
  const data = await getPedidosDAO(slug);
 
  return (
    <div className="flex flex-col w-full gap-2 lg:items-start xl:gap-4 lg:flex-row sm:items-center">
      <div className="sm:w-full lg:w-[450px] mt-3">
        <DataTable columns={columns} data={data} subject="Pedido" columnsOff={["tipo"]} />
      </div>
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  )
}
