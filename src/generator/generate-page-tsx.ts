import { exec } from 'child_process'
import { promises as fs } from 'fs'
import util from 'util'
import { checkFile, formatModelNameForFile } from './ts-generator'

const execAsync = util.promisify(exec)

export async function generatePageFile(home:string, frontendPath: string, modelName: string): Promise<void> {
  const formattedModelName = formatModelNameForFile(modelName)
  const filePath = `${home}/src/app${frontendPath}/${formattedModelName}s/page.tsx`
  
  const check= await checkFile(filePath)
  if (!check) return  

  const code = generateCode(modelName)
  await fs.writeFile(filePath, code, 'utf8')

  try {
    await execAsync(`npx prettier --write ${filePath}`)
    console.log(`page.tsx generado en ${filePath}`)
  } catch (error) {
    console.error('Error formateando el archivo:', error)
  }
}

function generateCode(modelName: string): string {
  const modelNameUperCase = modelName.charAt(0).toLocaleUpperCase() + modelName.slice(1);
  const modelNameLowerCase = modelName.charAt(0).toLocaleLowerCase() + modelName.slice(1);

  return `
import { get${modelNameUperCase}sDAO } from "@/services/${modelNameLowerCase}-services"
import { ${modelNameUperCase}Dialog } from "./${modelNameLowerCase}-dialogs"
import { DataTable } from "./${modelNameLowerCase}-table"
import { columns } from "./${modelNameLowerCase}-columns"

export default async function UsersPage() {
  
  const data= await get${modelNameUperCase}sDAO()

  return (
    <div className="w-full">      

      <div className="flex justify-end mx-auto my-2">
        <${modelNameUperCase}Dialog />
      </div>

      <div className="container p-3 py-4 mx-auto border rounded-md text-muted-foreground dark:text-white">
        <DataTable columns={columns} data={data} subject="${modelNameUperCase}"/>      
      </div>
    </div>
  )
}
  
`
}


