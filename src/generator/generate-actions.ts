import { exec } from 'child_process'
import { promises as fs } from 'fs'
import util from 'util'
import { checkFile, formatModelNameForFile } from './ts-generator'

const execAsync = util.promisify(exec)

export async function generateActionsFile(home:string, frontendPath: string, modelName: string): Promise<void> {
  const formattedModelName = formatModelNameForFile(modelName)
  const filePath = `${home}/src/app${frontendPath}/${formattedModelName}s/${formattedModelName}-actions.ts`

  const check= await checkFile(filePath)
  if (!check) return  

  const imports= getImports(modelName)
  const actions= generateActions(modelName, frontendPath)
  await fs.writeFile(filePath, imports + actions, 'utf8')

  try {
    await execAsync(`npx prettier ${filePath}`)
    console.log(`${formattedModelName}-actions.ts generado en ${filePath}`)
  } catch (error) {
    console.error('Error formateando el archivo:', error)
  }
}


function getImports(modelName: string): string {
  const modelNameUnCapitalized = modelName.charAt(0).toLocaleLowerCase() + modelName.slice(1) 
  const res= `"use server"

import { revalidatePath } from "next/cache"
import { ${modelName}DAO, ${modelName}FormValues, create${modelName}, update${modelName}, get${modelName}DAO, delete${modelName} } from "@/services/${modelNameUnCapitalized}-services"
`
  return res
}


function generateActions(modelName: string, frontendPath: string): string {
    const modelNameCapitalized = modelName.charAt(0).toUpperCase() + modelName.slice(1)
    const modelNameUnCapitalized = modelName.charAt(0).toLocaleLowerCase() + modelName.slice(1) 
 
    const res = `
export async function get${modelNameCapitalized}DAOAction(id: string): Promise<${modelNameCapitalized}DAO | null> {
  return get${modelNameCapitalized}DAO(id)
}

export async function createOrUpdate${modelNameCapitalized}Action(id: string | null, data: ${modelNameCapitalized}FormValues): Promise<${modelNameCapitalized}DAO | null> {       
  let updated= null
  if (id) {
      updated= await update${modelNameCapitalized}(id, data)
  } else {
      updated= await create${modelNameCapitalized}(data)
  }     

  revalidatePath("${frontendPath}/${modelNameUnCapitalized}s")

  return updated as ${modelNameCapitalized}DAO
}

export async function delete${modelNameCapitalized}Action(id: string): Promise<${modelNameCapitalized}DAO | null> {    
  const deleted= await delete${modelNameCapitalized}(id)

  revalidatePath("${frontendPath}/${modelNameUnCapitalized}s")

  return deleted as ${modelNameCapitalized}DAO
}
`;
    return res;
}
  

  // create a function main to test generateZodSchema
async function main() {
  try {
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()

