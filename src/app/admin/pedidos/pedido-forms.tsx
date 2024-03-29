"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { PedidoFormValues, pedidoFormSchema } from "@/services/pedido-services";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createOrUpdatePedidoAction, deletePedidoAction, getPedidoDAOAction } from "./pedido-actions";
import { Input } from "@/components/ui/input";

type Props = {
  id?: string;
  closeDialog: () => void;
};

export function PedidoForm({ id, closeDialog }: Props) {
  const form = useForm<PedidoFormValues>({
    resolver: zodResolver(pedidoFormSchema),
    defaultValues: {
      group: "Grupo Test",
    },
    mode: "onChange",
  });
  const [loading, setLoading] = useState(false);
  const router= useRouter();

  const onSubmit = async (data: PedidoFormValues) => {
    setLoading(true)
    createOrUpdatePedidoAction(id ? id : null, data)
    .then((data) => {
      toast({ title: id ? "Pedido actualizado" : "Pedido creado" })
      closeDialog()
    })
    .catch((error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    })
    .finally(() => {
      setLoading(false);
    })
};

  useEffect(() => {
    if (id) {
      getPedidoDAOAction(id)
      .then((data) => {
        if (data) {
          form.reset(data);
        }
        Object.keys(form.getValues()).forEach((key: any) => {
          if (form.getValues(key) === null) {
            form.setValue(key, "");
          }
        });
      });
    } else {
      //form.setValue("phone", "web-test")
    }
    
  }, [form, id]);

  function setPerson(name: string, phone: string) {
    form.setValue("name", name)
    form.setValue("phone", phone)    
  }

  return (
    <div className="p-4 rounded-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupo</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <div onClick={() => setPerson("Morti", "59895983155")} className="cursor-pointer underline">
              Morti
            </div>
            <div onClick={() => setPerson("Joaco", "59894197353")} className="cursor-pointer underline">
              Joaco
            </div>
            <div onClick={() => setPerson("Gilberto", "59895923142")} className="cursor-pointer underline">
              Gilberto
            </div>
            <div onClick={() => setPerson("Raphael", "59898353507")} className="cursor-pointer underline">
              RC
            </div>
          </div>


          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Texto</FormLabel>
                <FormControl>
                  <Textarea rows={15} placeholder="Texto del pedido..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <div className="flex justify-end">
            <Button
              onClick={() => closeDialog()}
              type="button"
              variant="ghost"
              className="w-32"
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-32 ml-2">
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <p>Guardar</p>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export function DeletePedidoForm({ id, closeDialog }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!id) return;
    setLoading(true);
    deletePedidoAction(id)
      .then(() => {
        toast({ title: "Pedido eliminado" });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
        closeDialog && closeDialog();
      });
  }

  return (
    <div>
      <Button
        onClick={() => closeDialog && closeDialog()}
        type="button"
        variant="ghost"
        className="w-32"
      >
        Cancelar
      </Button>
      <Button
        onClick={handleDelete}
        variant="destructive"
        className="w-32 gap-1 ml-2"
      >
        {loading && <Loader className="w-4 h-4 animate-spin" />}
        Eliminar
      </Button>
    </div>
  );
}
