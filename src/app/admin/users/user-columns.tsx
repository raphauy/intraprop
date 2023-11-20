"use client";

import { Button } from "@/components/ui/button";
import { UserDAO } from "@/services/user-services";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { DeleteUserDialog, UserDialog } from "./user-dialogs";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const columns: ColumnDef<UserDAO>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      );
    },
  },

  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      );
    },
  },

  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Rol
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },

  {
    accessorKey: "inmobiliariaName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Inmobiliaria
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      );
    },
  },

  {
    accessorKey: "emailVerified",
    header: ({ column }) => {
      return (
        <Button variant="ghost" className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Verificado
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const data = row.original
      if (!data.emailVerified) return <div></div> 
      return (<p>{data.emailVerified && format(data.emailVerified, "MMMM dd, yyyy", { locale: es})}</p>)
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original;

      const description = `Deseas eliminar el usuario ${data.name}?`;

      return (
        <div className="flex items-center justify-end gap-2">
          <UserDialog id={data.id} />
          <DeleteUserDialog description={description} id={data.id} />
        </div>
      );
    },
  },
];
