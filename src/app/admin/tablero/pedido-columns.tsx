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
    accessorKey: "tipo",
    header: ({ column }) => {
      return (
        <p>#</p>
      );
    },
    cell: ({ row }) => {
      const data = row.original
      const numberFormatted= formatPedidoNumber(data.number)

      return (<p className="">{numberFormatted}</p>)
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
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
        <Link href={`tablero?id=${data.id}`} prefetch={false} className="w-fit">
          <Button size="sm" variant="link" className="p-0 text-left text-muted-foreground">
            <div className="">
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
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <p>$</p>
      );
    },
    cell: ({ row }) => {
      const data = row.original

      return (
        <Link href={`tablero?id=${data.id}`} prefetch={false} className="w-fit">
          <Button size="sm" variant="link" className="p-0 text-left text-muted-foreground">
            <div className="">
              <p className="">{data.presupuesto}</p>
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
      const dateFormatted= format(data.createdAt, "MMM dd", { locale: es })      

      return (
      <div className="w-fit">
        {!isToday && <p className="whitespace-nowrap">{dateFormatted}</p>}
        <p className="whitespace-nowrap">{hourFormatted}</p>
      </div>
      )
    },
  },
  {
    accessorKey: "coincidencesChecked",
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
      const coincidencesChecked= data.coincidencesChecked || 0

      if (coincidencesChecked === 0 && data.status !== "paused") return null

      return (
        <Link href={`tablero?id=${data.id}`} prefetch={false}>
          <Badge 
            className={cn("bg-white text-muted-foreground text-base px-2 rounded-full hover:cursor-pointer w-6 h-6 flex items-center justify-center", 
            coincidencesChecked > 0 && "bg-green-500 text-white", 
            data.status === "paused" && "bg-yellow-500 text-white")}
          >
            {coincidencesChecked ? coincidencesChecked : "P"}
          </Badge>
        </Link>
      )
    },
  },
];
