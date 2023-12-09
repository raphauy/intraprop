"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { setPrompt } from "./actions"


const formSchema = z.object({  
  prompt: z.string().optional(),
})

export type PromptFormValues = z.infer<typeof formSchema>

const defaultValues: Partial<PromptFormValues> = {
  prompt: "Eres un asistente inmobiliario",
}

interface Props{
  prompt: string
}

export function PromptForm({ prompt }: Props) {
  const form = useForm<PromptFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  })
  const router= useRouter()
  const [loading, setLoading] = useState(true)

  async function onSubmit(data: PromptFormValues) {

    if (!data.prompt) {
      toast({title: "Prompt vacío" })
      return
    }

    setLoading(true)
    setPrompt(data.prompt)
    .then(() => {
      toast({title: "Prompt configurado" })
      setLoading(false)
    })
    .catch((error) => {
      toast({title: "Error al configurar prompt" })
      setLoading(false)
    })
    .finally(() => {
      setLoading(false)
    })

//    router.push("/admin/prompts")

  }

  useEffect(() => {
    form.setValue("prompt", prompt)
    setLoading(false)

  }, [prompt, form])



  return (
    <div className="p-4 bg-white rounded-md">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt para extraer datos desde el texto del pedido:</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Prompt del cliente"                  
                  {...field}
                  rows={18}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> 
      <div className="flex justify-end">
          <Button onClick={() => router.back() } type="button" variant={"secondary"} className="w-32">Cancelar</Button>
          <Button type="submit" className="w-32 ml-2" >{loading ? <Loader className="animate-spin" /> : <p>Guardar</p>}</Button>
        </div>
      </form>
    </Form>
   </div>
 )
}