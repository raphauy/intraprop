"use client";

import { Button } from "@/components/ui/button";
import { NotificationDAO } from "@/services/notification-services";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import {
  DeleteNotificationDialog,
} from "./notification-dialogs";
import { format } from "date-fns";
import { formatDateTime, formatPedidoNumber } from "@/lib/utils";

export const columns: ColumnDef<NotificationDAO>[] = [
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estado
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex items-center gap-2">
          {data.status === "pending" && "pending"}
          {data.status === "sent" && <CheckCircle2 className="w-6 h-6 text-green-500" />}
          {data.status === "error" && 
            <div className="flex items-center gap-1">
              <p className="text-red-500">Error</p>
              <p className="text-red-500">{data.error}</p>
            </div>
          }
        </div>
      );
    }
  },

  {
    accessorKey: "pedidoNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Pedido
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const data = row.original;
      return (
        <Button variant="link" className="px-0">
          <Link href={`/admin/tablero?id=${data.pedidoId}&coincidenceId=${data.coincidenceId}`} prefetch={false} target="_blank" className="text-left">
            <p>{data.pedidoOperacion?.toUpperCase()}</p>
            <p>{data.pedidoTipo}</p>
            <p>{data.pedidoNumber}</p>
          </Link>
        </Button>
      );
    }
  },

  {
    accessorKey: "Propiedad",
    cell: ({ row }) => {
      const data = row.original;
      const slug= data.coincidence.property.inmobiliariaSlug
      return (
        <Button variant="link" className="px-0">
          <Link href={`/${slug}/tablero?id=${data.pedidoId}&coincidenceId=${data.coincidenceId}`} prefetch={false} target="_blank" className="text-left">
            <p>{data.coincidence.property.inmobiliariaName}</p>
            <p>Propiedad: {data.coincidence.property.idPropiedad}</p>
            <p>#{data.coincidence.number}</p>
          </Link>
        </Button>
      );
    }
  },

  {
    accessorKey: "inmobiliaria",
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
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },

  {
    accessorKey: "sentAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Envío
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const data = row.original;
      if (!data.sentAt) {
        return null
      }

      return (
        <p>{formatDateTime(data.sentAt)}</p>
      );
    }
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

      const description = `Do you want to delete Notification ${data.id}?`;

      return (
        <div className="flex items-center justify-end gap-2">
          <DeleteNotificationDialog description={description} id={data.id} />
        </div>
      );
    },
  },
];
