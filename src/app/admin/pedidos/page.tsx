import { getAllPedidosDAO, getPedidosDAO } from "@/services/pedido-services";
import { PedidoDialog } from "./pedido-dialogs";
import { DataTable } from "./pedido-table";
import { columns } from "./pedido-columns";

export default async function UsersPage() {
  const data = await getAllPedidosDAO();

  return (
    <div className="w-full">
      <div className="flex justify-end mx-auto my-2">
        <PedidoDialog />
      </div>

      <div className="container p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="Pedido" columnsOff={["operacion", "tipo", "presupuesto", "zona", "dormitorios", "caracteristicas"]} />
      </div>
    </div>
  );
}
