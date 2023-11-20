import { DataTable } from "@/app/admin/users/user-table";
import { getInmobiliariaDAOByslug } from "@/services/inmobiliaria-services";
import { getUsersDAOBySlug } from "@/services/user-services";
import { UserDialog } from "./user-dialogs";
import { columns as columnsForAdmin } from "@/app/admin/users/user-columns";
import { columns as columnsForInmo } from "./user-columns";
import { getCurrentUser } from "@/lib/auth";

type Props = {
  params: {
    slug: string
  }
}

export default async function UsersPage({ params }: Props) {
  const inmo= await getInmobiliariaDAOByslug(params.slug)
  const data = await getUsersDAOBySlug(inmo.slug)

  const currentUser = await getCurrentUser()
  const isAdmin = currentUser?.role === "admin"
  let columnsFiltered= isAdmin ? columnsForAdmin : columnsForInmo

  return (
    <div className="w-full ">
      <div className="flex items-center justify-center my-4">
        <p className="text-2xl font-bold dark:text-white">Usuarios de {inmo.name}</p>
      </div>
      {
        isAdmin && 
          <div className="flex justify-end mx-auto my-2">
            <UserDialog />
          </div>
      }
      <div className="container p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columnsFiltered} data={data} subject="User" columnsOff={["image"]}/>
      </div>
    </div>
  );
}
