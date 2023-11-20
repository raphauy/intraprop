import { exec } from 'child_process'
import { promises as fs } from 'fs'
import util from 'util'
import { checkFile, formatModelNameForFile } from './ts-generator'

const execAsync = util.promisify(exec)

export async function generateDialogsFile(home:string, frontendPath: string, modelName: string): Promise<void> {
  const formattedModelName = formatModelNameForFile(modelName)
  const filePath = `${home}/src/app${frontendPath}/${formattedModelName}s/${formattedModelName}-dialogs.tsx`

  const check= await checkFile(filePath)
  if (!check) return  

  const code = generateCode(modelName)
  await fs.writeFile(filePath, code, 'utf8')

  try {
    await execAsync(`npx prettier --write ${filePath}`)
    console.log(`${formattedModelName}-dialogs.tsx generado en ${filePath}`)
  } catch (error) {
    console.error('Error formateando el archivo:', error)
  }
}

function generateCode(modelName: string): string {
  const modelNameUperCase = modelName.charAt(0).toLocaleUpperCase() + modelName.slice(1);
  const modelNameLowerCase = modelName.charAt(0).toLocaleLowerCase() + modelName.slice(1);

  return `"use client"

import { useState } from "react"
import { Pencil, PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ${modelNameUperCase}Form, Delete${modelNameUperCase}Form } from "./${modelNameLowerCase}-forms"

type Props= {
  id?: string
  create?: boolean
}

const addTrigger= <Button><PlusCircle size={22} className="mr-2"/>Create ${modelNameUperCase}</Button>
const updateTrigger= <Pencil size={30} className="pr-2 hover:cursor-pointer"/>

export function ${modelNameUperCase}Dialog({ id }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {id ? updateTrigger : addTrigger }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{id ? 'Update' : 'Create'} ${modelNameUperCase}
          </DialogTitle>
        </DialogHeader>
        <${modelNameUperCase}Form closeDialog={() => setOpen(false)} id={id} />
      </DialogContent>
    </Dialog>
  )
}
  
type DeleteProps= {
  id: string
  description: string
}

export function Delete${modelNameUperCase}Dialog({ id, description }: DeleteProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Trash2 className="hover:cursor-pointer"/>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete ${modelNameUperCase}</DialogTitle>
          <DialogDescription className="py-8">{description}</DialogDescription>
        </DialogHeader>
        <Delete${modelNameUperCase}Form closeDialog={() => setOpen(false)} id={id} />
      </DialogContent>
    </Dialog>
  )
}

`
}


