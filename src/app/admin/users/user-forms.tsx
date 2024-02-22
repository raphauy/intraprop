"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { InmobiliariaDAO } from "@/services/inmobiliaria-services";
import { UserFormValues, userFormSchema } from "@/services/user-services";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsRight, ChevronsUpDown, Loader, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { getInmobiliariasDAOAction } from "../inmobiliarias/inmobiliaria-actions";
import {
  createOrUpdateUserAction,
  deleteUserAction,
  getUserDAOAction,
} from "./user-actions";

export type ComboBoxData={
  value: string,
  label: string
}

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
  const [inmobiliarias, setInmobiliarias] = useState<InmobiliariaDAO[]>([])

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [selectors, setSelectors] = useState<ComboBoxData[]>([])

  const filteredValues = useMemo(() => {
    if (!searchValue) return selectors
    const lowerCaseSearchValue = searchValue.toLowerCase();
    return selectors.filter((line) => 
    line.label.toLowerCase().includes(lowerCaseSearchValue)
    )
  }, [selectors, searchValue])

  const customFilter = (searchValue: string, itemValue: string) => {      
    return itemValue.toLowerCase().includes(searchValue.toLowerCase()) ? searchValue.toLowerCase().length : 0
  }      
    
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

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
        const initialSelectors= data.map(inmo => {
          return {
            value: inmo.id,
            label: inmo.name
          }
        })
        setSelectors(initialSelectors)
      }
    })

    if (id) {
      getUserDAOAction(id).then((data) => {
        
        if (data) {
          form.reset(data);
          data.name && form.setValue("name", data.name)
          data.inmobiliariaId && form.setValue("inmobiliariaId", data.inmobiliariaId)
          form.setValue("role", data.role)
          setRole(data.role)
          data.inmobiliariaName && setValue(data.inmobiliariaName)
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
                  <FormLabel>Inmobiliaria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>

                    <div className="w-full px-1 ">
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            role="combobox"
                            aria-expanded={open}
                            className="justify-between w-full text-base whitespace-nowrap min-w-[230px]"
                          >
                            {value
                              ? selectors.find(selector => selector.label.toLowerCase() === value.toLowerCase())?.label
                              : "Seleccionar inmobiliaria"}
                            <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                          </Button>
                        </PopoverTrigger>

                        <PopoverContent className="min-w-[230px] p-0">
                          <Command filter={customFilter} >
                            <div className='flex items-center w-full gap-1 p-2 border border-gray-300 rounded-md shadow'>
                                <Search className="w-4 h-4 mx-1 opacity-50 shrink-0" />
                                <input placeholder="Buscar inmobiliaria..." onInput={handleInputChange} value={searchValue} className="w-full bg-transparent focus:outline-none"/>
                            </div>
                            
                            <CommandEmpty>inmobiliaria no encontrada</CommandEmpty>
                            <CommandGroup>
                              {filteredValues.map((inmo, index) => {
                                if (index >= 10) return null
                                return (
                                  <CommandItem
                                    key={inmo.value}
                                    onSelect={(currentValue) => {
                                      if (currentValue === value) {
                                        setValue("")
                                      } else {
                                        setValue(currentValue)
                                        const inmoId= inmobiliarias.find(inmo => inmo.name.toLowerCase() === currentValue)?.id
                                        
                                        form.setValue("inmobiliariaId", inmoId)

                                        // router.push(`/${inmo.slug}/${restOfPath}?${search}`)
                                      }
                                      setSearchValue("")
                                      setOpen(false)
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", value.toLowerCase() === inmo.label.toLowerCase() ? "opacity-100" : "opacity-0")}/>
                                    {inmo.label}
                                  </CommandItem>
                              )})}

                              {filteredValues.length - 10 > 0 &&
                                <div className="flex items-center mt-5 font-bold">
                                  <ChevronsRight className="mr-2 ml-1 h-5 w-5"/>
                                  <p className="text-sm">Hay {filteredValues.length - 10} inmobiliarias más</p>
                                </div>
                              }

                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>



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
