import { exec } from 'child_process'
import { promises as fs } from 'fs'
import inquirer from 'inquirer'
import util from 'util'
import { fileExists, formatModelNameForFile, parseModelFields } from './ts-generator'

const execAsync = util.promisify(exec)

export async function generateServicesFile( servicesDirectory: string, modelName: string, modelDefinition: string ): Promise<boolean> {

  const formattedModelName = formatModelNameForFile(modelName)
  const filePath = `${servicesDirectory}/${formattedModelName}-services.ts`

  if (await fileExists(filePath)) {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `El archivo ${formattedModelName}-services.ts ya existe. ¿Deseas sobrescribirlo?`,
        default: true
      }
    ])

    if (!answers.overwrite) {
      console.log('Generación de archivo cancelada por el usuario.')
      return false
    }
  }

  const imports= getImports()
  const daoContent= generateDAOType(modelName, modelDefinition)
  const zodSchema= generateZodSchema(modelName, modelDefinition)
  const crudFunctions= generateCRUDFunctions(modelName);
  await fs.writeFile(filePath, imports + daoContent + zodSchema + crudFunctions, 'utf8')

  try {
//    await execAsync(`npx prettier --write ${filePath}`)
    await execAsync(`npx prettier ${filePath}`)
    console.log(`${formattedModelName}-services.ts generado en ${servicesDirectory}`)
  } catch (error) {
    console.error('Error formateando el archivo:', error)
  }

  return true
}

function getImports(): string {
  const res= `import * as z from "zod"\nimport { prisma } from "@/lib/db"\n`
  return res
}


function generateDAOType(modelName: string, modelDefinition: string): string {
    console.log(modelDefinition)
    
    const lines = modelDefinition.split('\n')
    const fields = parseModelFields(modelDefinition)
      .map(field => {
        const { name, type } = field
        return `${name}: ${type}`
      })
    
    const res= `
export type ${modelName}DAO = {
  ${fields.join('\n\t')}
}\n`

    return res
}
  

function generateZodSchema(modelName: string, modelDefinition: string): string {
    const modelNameUnCapitalized = modelName.charAt(0).toLocaleLowerCase() + modelName.slice(1);
    const lines = modelDefinition.split('\n')
    const zodFields = lines
      .filter((line) => line.includes('String') && !line.includes('@id'))
      .map((line) => {
        const [fieldName, fieldType] = line.trim().split(/\s+/)
        const optional = fieldType.endsWith('?')
        const validation = optional
          ? '.optional()'
          : `{required_error: "${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required."}`
        
        if (optional)
            return `\t${fieldName}: z.string().optional(),`
  
        return `\t${fieldName}: z.string(${validation}),`
      })
  
    const res= `
export const ${modelNameUnCapitalized}FormSchema = z.object({\n${zodFields.join('\n')}\n})
export type ${modelName}FormValues = z.infer<typeof ${modelNameUnCapitalized}FormSchema>\n`
    return res
  }



function generateCRUDFunctions(modelName: string): string {
    const modelNameCapitalized = modelName.charAt(0).toUpperCase() + modelName.slice(1)
  
    const crudOperations = `
export async function get${modelNameCapitalized}sDAO() {
  const found = await prisma.${modelName.toLowerCase()}.findMany({
    orderBy: {
      id: 'asc'
    },
  })
  return found as ${modelNameCapitalized}DAO[]
}
  
export async function get${modelNameCapitalized}DAO(id: string) {
  const found = await prisma.${modelName.toLowerCase()}.findUnique({
    where: {
      id
    },
  })
  return found as ${modelNameCapitalized}DAO
}
    
export async function create${modelNameCapitalized}(data: ${modelName}FormValues) {
  const created = await prisma.${modelName.toLowerCase()}.create({
    data
  })
  return created
}

export async function update${modelNameCapitalized}(id: string, data: ${modelName}FormValues) {
  const updated = await prisma.${modelName.toLowerCase()}.update({
    where: {
      id
    },
    data
  })
  return updated
}

export async function delete${modelNameCapitalized}(id: string) {
  const deleted = await prisma.${modelName.toLowerCase()}.delete({
    where: {
      id
    },
  })
  return deleted
}
    `

    return crudOperations
  }
  
