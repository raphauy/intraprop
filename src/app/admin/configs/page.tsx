import { getConfigsDAO } from "@/services/config-services";
import { ConfigDialog } from "./config-dialogs";
import { DataTable } from "./config-table";
import { columns } from "./config-columns";
import { getCurrentUser } from "@/lib/auth";

export default async function UsersPage() {
  let data = await getConfigsDAO()

  const user= await getCurrentUser()
  const isRapha= user?.email === "rapha.uy@rapha.uy"
  if (!isRapha) {
    data= data.filter((item) => item.name !== "PROCESS_BLOCKED")
  }

  return (
    <div className="w-full">
      <p className="text-center font-bold text-2xl my-5">Configuración</p>
      <div className="flex justify-end mx-auto my-2">
        {
          isRapha && <ConfigDialog />
        }
      </div>

      <div className="container p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="Config" />
      </div>
    </div>
  );
}
