import { getUsersDAO } from "@/services/user-services";
import { UserDialog } from "./user-dialogs";
import { DataTable } from "./user-table";
import { columns } from "./user-columns";

export default async function UsersPage() {
  const data = await getUsersDAO();

  return (
    <div className="w-full">
      <div className="flex justify-end mx-auto my-2">
        <UserDialog />
      </div>

      <div className="container p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="User" />
      </div>
    </div>
  );
}
