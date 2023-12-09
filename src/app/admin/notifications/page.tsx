import { getInmobiliariasDAO } from "@/services/inmobiliaria-services";
import { getNotificationsPedidoDAO } from "@/services/notification-pedidos-services";
import { columns } from "./notification-columns";
import { DataTable } from "./notification-table";

export default async function UsersPage() {
  const data = await getNotificationsPedidoDAO()
  const inmobiliariasDAO= await getInmobiliariasDAO()
  const inmobiliarias= inmobiliariasDAO.map(i=> i.name)

  return (
    <div className="w-full">
      <div className="font-bold text-2xl py-8 text-center">
        Notificaciones
      </div>

      <div className="container p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="Notification" columnsOff={["inmobiliaria", "error"]} inmobiliarias={inmobiliarias}/>
      </div>
    </div>
  );
}
