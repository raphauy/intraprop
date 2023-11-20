import { getInmobiliariasDAO } from "@/services/inmobiliaria-services";
import { InmobiliariaDialog } from "./inmobiliaria-dialogs";
import { DataTable } from "./inmobiliaria-table";
import { columns } from "./inmobiliaria-columns";

export default async function UsersPage() {
  const data = await getInmobiliariasDAO();

  return (
    <div className="w-full">
      <div className="flex justify-end mx-auto my-2">
        <InmobiliariaDialog />
      </div>

      <div className="container p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="Inmobiliaria" />
      </div>
    </div>
  );
}
