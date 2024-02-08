import { getStatsDAO } from "@/services/stat-services"
import { StatDialog } from "./stat-dialogs"
import { DataTable } from "./stat-table"
import { columns } from "./stat-columns"
import UpdateButton from "./update-button"
import UpdateAllButton from "./update-button"

export default async function UsersPage() {
  
  const data= await getStatsDAO()

  return (
    <div className="w-full">      

      <div className="flex justify-between my-5">        
        <p></p>
        <p className="text-3xl font-bold">Estadísticas</p>
        <UpdateAllButton />
      </div>

      <div className="container p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="Stat"/>      
      </div>
    </div>
  )
}
  
