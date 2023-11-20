"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import {
  deleteInmobiliariaAction,
  createOrUpdateInmobiliariaAction,
  getInmobiliariaDAOAction,
} from "./inmobiliaria-actions";
import {
  inmobiliariaFormSchema,
  InmobiliariaFormValues,
} from "@/services/inmobiliaria-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  id?: string;
  closeDialog?: () => void;
};

export function InmobiliariaForm({ id, closeDialog }: Props) {
  const form = useForm<InmobiliariaFormValues>({
    resolver: zodResolver(inmobiliariaFormSchema),
    defaultValues: {},
    mode: "onChange",
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: InmobiliariaFormValues) => {
    setLoading(true);
    try {
      await createOrUpdateInmobiliariaAction(id ? id : null, data);
      toast({ title: id ? "Inmobiliaria updated" : "Inmobiliaria created" });
      closeDialog && closeDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getInmobiliariaDAOAction(id).then((data) => {
        if (data) {
          form.reset(data);
        }
        Object.keys(form.getValues()).forEach((key: any) => {
          if (form.getValues(key) === null) {
            form.setValue(key, "");
          }
        });
      });
    }
  }, [form, id]);

  return (
    <div className="p-4 bg-white rounded-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder=""
                    {...field}
                    rows={5}
                  />
                </FormControl>
                <FormDescription className="mx-1">
                  Este campo se usa para mostrar una descripción de la inmobiliaria en el Dashboard, la
                  primera pantalla que los usuarios con el rol inmobiliaria ven cuando se loguean
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          /> 

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sitio Web</FormLabel>
                <FormControl>
                  <Input placeholder="URL del sitio" {...field} />
                </FormControl>
                <FormDescription className="mx-1">
                  Este campo es meramente informativo
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="celulares"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Celulares</FormLabel>
                <FormControl>
                  <Input placeholder="59899123456,59898654321" {...field} />
                </FormControl>
                <FormDescription className="mx-1">
                  Celular o celulares separados por coma, se utilizarán para enviar notificaciones vía whatsapp
                  cuando se detecta una coincidencia para esta inmobiliaria
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              onClick={() => closeDialog && closeDialog()}
              type="button"
              variant={"secondary"}
              className="w-32"
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-32 ml-2">
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
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

export function DeleteInmobiliariaForm({ id, closeDialog }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!id) return;
    setLoading(true);
    deleteInmobiliariaAction(id)
      .then(() => {
        toast({ title: "Inmobiliaria deleted" });
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
        variant={"secondary"}
        className="w-32"
      >
        Cancelar
      </Button>
      <Button
        onClick={handleDelete}
        variant="destructive"
        className="w-32 ml-2 gap-1"
      >
        {loading && <Loader className="h-4 w-4 animate-spin" />}
        Eliminar
      </Button>
    </div>
  );
}
