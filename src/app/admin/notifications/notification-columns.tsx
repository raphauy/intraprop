"use client";

import { Button } from "@/components/ui/button";
import { formatDateTimeWithSeconds } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import {
  DeleteNotificationDialog,
} from "./notification-dialogs";
import { NotificationPedidoDAO } from "@/services/notification-pedidos-services";

export const columns: ColumnDef<NotificationPedidoDAO>[] = [
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
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
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
      let inmobiliariaName= ""
      if (data.coincidences.length > 0) {
        inmobiliariaName= data.coincidences[0].property.inmobiliariaName
      }

      return (
        <Button variant="link" className="px-0">
          <Link href={`/admin/tablero?id=${data.pedidoId}`} prefetch={false} target="_blank" className="text-left">
            <p>{data.pedidoNumber}</p>
            <p>{inmobiliariaName}</p>
            <p>{data.pedidoOperacion?.toUpperCase()}({data.pedidoTipo})</p>
          </Link>
        </Button>
      );
    }
  },

  {
    accessorKey: "Propiedad",
    cell: ({ row }) => {
      const data = row.original;
      const coincidences= data.coincidences
      if (!coincidences) {
        return null
      }
      const slug= coincidences[0].property.inmobiliariaSlug
      return (
        <div className="flex flex-col">
        {
          coincidences.map((coincidence) => {
            return (
              <Link key={coincidence.id} prefetch={false} target="_blank" 
                href={`/${slug}/tablero?id=${data.pedidoId}&coincidenceId=${coincidence.id}`}                 
                className="text-left cursor-pointer text-black hover:underline whitespace-nowrap">
                #{coincidence.number} - Propiedad: {coincidence.property.idPropiedad}
              </Link>
          )
          })
        }
        </div>
      )
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
        <p>{formatDateTimeWithSeconds(data.sentAt)}</p>
      );
    }
  },


  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const data = row.original;

  //     const description = `Do you want to delete Notification ${data.id}?`;

  //     return (
  //       <div className="flex items-center justify-end gap-2">
  //         <DeleteNotificationDialog description={description} id={data.id} />
  //       </div>
  //     );
  //   },
  // },
];
