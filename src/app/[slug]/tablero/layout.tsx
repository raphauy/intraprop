import { columns } from "@/app/admin/tablero/pedido-columns";
import { DataTable } from "@/app/admin/tablero/pedido-table";
import { getCurrentUser } from "@/lib/auth";
import { getOperaciones, getPedidosDAO, getTipos } from "@/services/pedido-services";
import { Loader } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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
  const operaciones= await getOperaciones()
  const tipos= await getTipos()

  return (
    <div className="mx-1 flex flex-col w-full gap-2 lg:items-start xl:gap-4 lg:flex-row sm:items-center">
      <div className="sm:w-full lg:w-[450px] mt-3">
        <DataTable columns={columns} data={data} subject="Pedido" columnsOff={["tipo"]} operaciones={operaciones} tipos={tipos} />
      </div>
      <div className="flex-1 w-full">
        <Suspense fallback={<Loader className="animate-spin w-full mt-10" size="2rem" />}>
          {children}
        </Suspense>
      </div>
    </div>
  )
}
