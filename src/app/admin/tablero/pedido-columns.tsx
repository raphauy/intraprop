"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatPedidoNumber } from "@/lib/utils";
import { PedidoDAO } from "@/services/pedido-services";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowUpDown, Calendar, Eye, Target } from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<PedidoDAO>[] = [
  {
    accessorKey: "number",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          #
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const data = row.original
      const numberFormatted= formatPedidoNumber(data.number)

      return (<p className="">{numberFormatted}</p>)
    },
  },

  {
    accessorKey: "operacion",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Operacion
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const data = row.original

      return (
        <Link href={`tablero?id=${data.id}`} prefetch={false}>
          <Button size="sm" variant="link" className="p-0 text-left text-muted-foreground">
            <div className="w-[110px]">
              <p className="">{data.operacion?.toUpperCase()}</p>
              <p className="whitespace-nowrap">{data.tipo}</p>
            </div>
          </Button>
        </Link>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },

  {
    accessorKey: "tipo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0 dark:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tipo
          <ArrowUpDown className="w-4 h-4 ml-1" />
        </Button>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className=" dark:text-white flex justify-center"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Calendar size={20} />
          
        </Button>
      );
    },
    cell: ({ row }) => {
      const data = row.original
      const hourFormatted= format(data.createdAt, "HH:mm 'h'", { locale: es })
      const isToday= format(data.createdAt, "dd/MM/yyyy", { locale: es }) === format(new Date(), "dd/MM/yyyy", { locale: es })
      const dateFormatted= isToday ? "hoy" : format(data.createdAt, "MMM dd", { locale: es })      

      return (
      <div className="w-12">
        <p className="">{hourFormatted}</p>
        <p className="whitespace-nowrap">{dateFormatted}</p>
      </div>
      )
    },
  },
  {
    accessorKey: "cantCoincidencias",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className=" dark:text-white px-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Target size={20} />
          
        </Button>
      )
    },
    cell: ({ row }) => {
      const data = row.original
      const cantCoincidencias= data.cantCoincidencias || 0

      return (
        <Link href={`tablero?id=${data.id}`} prefetch={false}>
          <Badge 
            className={cn("bg-white text-muted-foreground text-base px-2 rounded-full hover:cursor-pointer w-6 h-6 flex items-center justify-center", 
            cantCoincidencias > 0 && "bg-green-500 text-white", 
            data.status === "paused" && "bg-yellow-500 text-white")}
          >
            {cantCoincidencias}
          </Badge>
        </Link>
      )
    },
  },
];
