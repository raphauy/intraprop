import { exec } from 'child_process'
import { promises as fs } from 'fs'
import util from 'util'
import { checkFile, formatModelNameForFile, parseModelFields } from './ts-generator'

const execAsync = util.promisify(exec)

export async function generateColumnsFile(home:string, frontendPath: string, modelName: string, modelDefinition: string): Promise<void> {
  const formattedModelName = formatModelNameForFile(modelName)
  const filePath = `${home}/src/app${frontendPath}/${formattedModelName}s/${formattedModelName}-columns.tsx`
  
  const check= await checkFile(filePath)
  if (!check) return  

  const formCode = generateFormCode(modelName, modelDefinition)
  await fs.writeFile(filePath, formCode, 'utf8')

  try {
    await execAsync(`npx prettier --write ${filePath}`)
    console.log(`${formattedModelName}-columns.tsx generado en ${filePath}`)
  } catch (error) {
    console.error('Error formateando el archivo:', error)
  }
}

function generateFormCode(modelName: string, modelDefinition: string): string {
  const modelNameUperCase = modelName.charAt(0).toLocaleUpperCase() + modelName.slice(1);
  const modelNameLowerCase = modelName.charAt(0).toLocaleLowerCase() + modelName.slice(1);
  const fields = parseModelFields(modelDefinition).filter(field => field.name !== 'id' && field.name !== 'createdAt' && field.name !== 'updatedAt'  && field.name !== 'emailVerified?')
  // remove simbol ? from fields
  fields.forEach(field => {
    if (field.name.includes('?')) {
      field.name = field.name.slice(0, -1)
    }
  })

  return `"use client"

import { Button } from "@/components/ui/button"
import { ${modelNameUperCase}DAO } from "@/services/${modelNameLowerCase}-services"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Delete${modelNameUperCase}Dialog, ${modelNameUperCase}Dialog } from "./${modelNameLowerCase}-dialogs"

export const columns: ColumnDef<${modelNameUperCase}DAO>[] = [
  ${fields.map(field => `
  {
    accessorKey: "${field.name}",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            ${field.name.charAt(0).toLocaleUpperCase() + field.name.slice(1)}
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )
    },
  },
  `).join('\n      ')}
  // {
  //   accessorKey: "role",
  //   header: ({ column }) => {
  //     return (
  //       <Button variant="ghost" className="pl-0 dark:text-white"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
  //         Rol
  //         <ArrowUpDown className="w-4 h-4 ml-1" />
  //       </Button>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => {
      const data= row.original

      const description= \`Do you want to delete ${modelNameUperCase} \${data.name}?\`
 
      return (
        <div className="flex items-center justify-end gap-2">
          <${modelNameUperCase}Dialog id={data.id} />
          <Delete${modelNameUperCase}Dialog description={description} id={data.id} />
        </div>

      )
    },
  },
]


`
}


