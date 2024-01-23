"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import {
  deleteUserAction,
  createOrUpdateUserAction,
  getUserDAOAction,
} from "./user-actions";
import { userFormSchema, UserFormValues } from "@/services/user-services";
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
import { Check, CheckIcon, Loader } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InmobiliariaDAO } from "@/services/inmobiliaria-services";
import { getInmobiliariaDAOAction, getInmobiliariasDAOAction } from "../inmobiliarias/inmobiliaria-actions";

export const roles= [
  "admin",
  "inmobiliaria",
]

type Props = {
  id?: string;
  closeDialog: () => void;
};

export function UserForm({ id, closeDialog }: Props) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {},
    mode: "onChange",
  });
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("admin")
  const [inmoName, setInmoName] = useState("")
  const [inmobiliarias, setInmobiliarias] = useState<InmobiliariaDAO[]>([])

  const onSubmit = async (data: UserFormValues) => {
    setLoading(true);
    try {
      if (form.getValues("role") === "admin") {
        data.inmobiliariaId = undefined
      }
      await createOrUpdateUserAction(id ? id : null, data);
      toast({ title: id ? "User updated" : "User created" });
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
    getInmobiliariasDAOAction()
    .then((data) => {
      if (data) {
        setInmobiliarias(data)
      }
    })

    if (id) {
      getUserDAOAction(id).then((data) => {
        
        if (data) {
          form.reset(data);
          data.inmobiliariaName && setInmoName(data.inmobiliariaName)
          data.name && form.setValue("name", data.name);
          data.inmobiliariaId && form.setValue("inmobiliariaId", data.inmobiliariaId);
          form.setValue("role", data.role);
          setRole(data.role)
        }
      });
    } else {
      console.log("setting role")      
      setRole("admin")
      form.setValue("role", "admin");
    }
    
  }, [form, id]);

  function handleRoleChange(value: string) {
    setRole(value)
    form.setValue("role", value);
    if (value === "admin") {
      form.setValue("inmobiliariaId", undefined);
      setInmoName("")
    }
  }

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
                  <Input placeholder="User's name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="User's email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <Select onValueChange={handleRoleChange} defaultValue={field.value+""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue className="text-muted-foreground">{role}</SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>                      
                      ))
                    }
                  </SelectContent>
                </Select>
                <FormDescription>el rol inmobiliaria debe tener una inmbobiliaria asociada</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {
            role === "inmobiliaria" &&
            <FormField
              control={form.control}
              name="inmobiliariaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        {
                          id ? 
                          <SelectValue className="text-muted-foreground" placeholder={inmoName} /> :
                          <SelectValue className="text-muted-foreground" placeholder="Selecciona un Cliente" />
                        }
                        
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inmobiliarias.map(inmo => (
                        <SelectItem key={inmo.id} value={inmo.id}>{inmo.name}</SelectItem>
                      ))
                      }
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          }


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

export function DeleteUserForm({ id, closeDialog }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!id) return;
    setLoading(true);
    deleteUserAction(id)
      .then(() => {
        toast({ title: "User deleted" });
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
