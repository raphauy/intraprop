"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"
import { deleteStatAction, createOrUpdateStatAction, getStatDAOAction } from "./stat-actions"
import { statSchema, StatFormValues } from '@/services/stat-services'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader } from "lucide-react"

type Props= {
  id?: string
  closeDialog: () => void
}

export function StatForm({ id, closeDialog }: Props) {
  const form = useForm<StatFormValues>({
    resolver: zodResolver(statSchema),
    defaultValues: {},
    mode: "onChange",
  })
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: StatFormValues) => {
    setLoading(true)
    try {
      await createOrUpdateStatAction(id ? id : null, data)
      toast({ title: id ? "Stat updated" : "Stat created" })
      closeDialog()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      getStatDAOAction(id).then((data) => {
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
          
          <FormField
            control={form.control}
            name="inmo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inmo</FormLabel>
                <FormControl>
                  <Input placeholder="Stat's inmo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
      
          <FormField
            control={form.control}
            name="propiedades"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Propiedades</FormLabel>
                <FormControl>
                  <Input placeholder="Stat's propiedades" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
      
          <FormField
            control={form.control}
            name="pedidos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pedidos</FormLabel>
                <FormControl>
                  <Input placeholder="Stat's pedidos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
      
          <FormField
            control={form.control}
            name="coincidencias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coincidencias</FormLabel>
                <FormControl>
                  <Input placeholder="Stat's coincidencias" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
      
          <FormField
            control={form.control}
            name="coincidenciasOK"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CoincidenciasOK</FormLabel>
                <FormControl>
                  <Input placeholder="Stat's coincidenciasOK" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
      
          <FormField
            control={form.control}
            name="tasaOK"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TasaOK</FormLabel>
                <FormControl>
                  <Input placeholder="Stat's tasaOK" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          

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

export function DeleteStatForm({ id, closeDialog }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!id) return
    setLoading(true)
    deleteStatAction(id)
    .then(() => {
      toast({title: "Stat deleted" })
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
      <Button onClick={() => closeDialog && closeDialog()} type="button" variant={"secondary"} className="w-32">Cancel</Button>
      <Button onClick={handleDelete} variant="destructive" className="w-32 ml-2 gap-1">
        { loading && <Loader className="h-4 w-4 animate-spin" /> }
        Delete  
      </Button>
    </div>
  )
}

