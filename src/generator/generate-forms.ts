import { exec } from 'child_process'
import { promises as fs } from 'fs'
import util from 'util'
import { checkFile, formatModelNameForFile, parseModelFields } from './ts-generator'

const execAsync = util.promisify(exec)

export async function generateFormFile(home:string, frontendPath: string, modelName: string, modelDefinition: string): Promise<void> {
  const formattedModelName = formatModelNameForFile(modelName)
  const filePath = `${home}/src/app${frontendPath}/${formattedModelName}s/${formattedModelName}-forms.tsx`

  const check= await checkFile(filePath)
  if (!check) return  

  const formCode = generateFormCode(modelName, modelDefinition)
  await fs.writeFile(filePath, formCode, 'utf8')

  try {
    await execAsync(`npx prettier --write ${filePath}`)
    console.log(`${formattedModelName}-forms.tsx generado en ${filePath}`)
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

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"
import { delete${modelNameUperCase}Action, createOrUpdate${modelNameUperCase}Action, get${modelNameUperCase}DAOAction } from "./${modelNameLowerCase}-actions"
import { ${modelNameLowerCase}FormSchema, ${modelNameUperCase}FormValues } from '@/services/${modelNameLowerCase}-services'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader } from "lucide-react"

type Props= {
  id?: string
  closeDialog: () => void
}

export function ${modelNameUperCase}Form({ id, closeDialog }: Props) {
  const form = useForm<${modelNameUperCase}FormValues>({
    resolver: zodResolver(${modelNameLowerCase}FormSchema),
    defaultValues: {},
    mode: "onChange",
  })
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: ${modelNameUperCase}FormValues) => {
    setLoading(true)
    try {
      await createOrUpdate${modelNameUperCase}Action(id ? id : null, data)
      toast({ title: id ? "${modelName} updated" : "${modelName} created" })
      closeDialog()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      get${modelNameUperCase}DAOAction(id).then((data) => {
        if (data) {
          form.reset(data)
        }
        Object.keys(form.getValues()).forEach((key: any) => {
          if (form.getValues(key) === null) {
            form.setValue(key, "")
          }
        })
      })
    }
  }, [form, id])

  return (
    <div className="p-4 bg-white rounded-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          ${fields.map(field => `
          <FormField
            control={form.control}
            name="${field.name}"
            render={({ field }) => (
              <FormItem>
                <FormLabel>${field.name.charAt(0).toLocaleUpperCase() + field.name.slice(1)}</FormLabel>
                <FormControl>
                  <Input placeholder="${modelName}'s ${field.name}" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          `).join('\n      ')}

        <div className="flex justify-end">
            <Button onClick={() => closeDialog()} type="button" variant={"secondary"} className="w-32">Cancel</Button>
            <Button type="submit" className="w-32 ml-2">
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : <p>Save</p>}
            </Button>
          </div>
        </form>
      </Form>
    </div>     
  )
}

export function Delete${modelNameUperCase}Form({ id, closeDialog }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!id) return
    setLoading(true)
    delete${modelNameUperCase}Action(id)
    .then(() => {
      toast({title: "${modelNameUperCase} deleted" })
    })
    .catch((error) => {
      toast({title: "Error", description: error.message, variant: "destructive"})
    })
    .finally(() => {
      setLoading(false)
      closeDialog && closeDialog()
    })
  }
  
  return (
    <div>
      <Button onClick={() => closeDialog && closeDialog()} type="button" variant={"secondary"} className="w-32">Cancelar</Button>
      <Button onClick={handleDelete} variant="destructive" className="w-32 ml-2 gap-1">
        { loading && <Loader className="h-4 w-4 animate-spin" /> }
        Delete  
      </Button>
    </div>
  )
}

`
}


