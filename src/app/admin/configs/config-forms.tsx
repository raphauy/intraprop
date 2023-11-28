"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import {
  deleteConfigAction,
  createOrUpdateConfigAction,
  getConfigDAOAction,
} from "./config-actions";
import { configFormSchema, ConfigFormValues } from "@/services/config-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";

type Props = {
  id?: string;
  closeDialog: () => void;
};

export function ConfigForm({ id, closeDialog }: Props) {
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {},
    mode: "onChange",
  });
  const [loading, setLoading] = useState(false)
  const { data }= useSession()

  const onSubmit = async (data: ConfigFormValues) => {
    setLoading(true);
    try {
      await createOrUpdateConfigAction(id ? id : null, data);
      toast({ title: id ? "Config updated" : "Config created" });
      closeDialog();
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
      getConfigDAOAction(id).then((data) => {
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
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Config's name" {...field} disabled={data?.user?.email !== "rapha.uy@rapha.uy"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input placeholder="Config's value" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              onClick={() => closeDialog()}
              type="button"
              variant={"secondary"}
              className="w-32"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-32 ml-2">
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <p>Save</p>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export function DeleteConfigForm({ id, closeDialog }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!id) return;
    setLoading(true);
    deleteConfigAction(id)
      .then(() => {
        toast({ title: "Config deleted" });
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
        Delete
      </Button>
    </div>
  );
}
