"use client";

import { Button } from "@/components/ui/button";
import { ConfigDAO } from "@/services/config-services";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { DeleteConfigDialog, ConfigDialog } from "./config-dialogs";

export const columns: ColumnDef<ConfigDAO>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      );
    },
  },

  {
    accessorKey: "value",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Value
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      );
    },
  },

  // {
  //   accessorKey: "role",
  //   header: ({ column }) => {
  //     return (
  //       <Button variant="ghost" className="pl-0 dark:text-white"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
  //         Rol
  //         <ArrowUpDown className="w-4 h-4 ml-1" />
  //       </Button>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original;

      const description = `Do you want to delete Config ${data.name}?`;

      return (
        <div className="flex items-center justify-end gap-2">
          <ConfigDialog id={data.id} />
          <DeleteConfigDialog description={description} id={data.id} />
        </div>
      );
    },
  },
];
