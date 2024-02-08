"use client"

import { Button } from "@/components/ui/button"
import { StatDAO } from "@/services/stat-services"
import { ColumnDef } from "@tanstack/react-table"
import { format, formatDistanceToNow } from "date-fns"
import { ArrowUpDown } from "lucide-react"
import { UpdateButton } from "./update-button"
import { es } from "date-fns/locale"


export const columns: ColumnDef<StatDAO>[] = [
  
  {
    accessorKey: "inmo",
    header: ({ column }) => {
        return (
          <Button variant="ghost" className="pl-0 dark:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Inmo
            <ArrowUpDown className="w-4 h-4 ml-1" />
          </Button>
    )},
    cell: ({ row }) => {
      const data= row.original
      return (<p className="font-bold">{data.inmo}</p>)
    }
  },

  {
    accessorKey: "propiedades",
    header: ({ column }) => {
        return (
          <div className="text-right">
            <Button variant="ghost" className="pl-0 dark:text-white"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Propiedades
              <ArrowUpDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
    )},
    cell: ({ row }) => {
      const data= row.original
      return (<p className="mr-12 text-right">{Intl.NumberFormat("es-UY", { minimumFractionDigits: 0 }).format(data.propiedades)}</p>)
    }
  },

  {
    accessorKey: "pedidos",
    header: ({ column }) => {
        return (
          <div className="text-right">
            <Button variant="ghost" className="pl-0 dark:text-white"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Pedidos
              <ArrowUpDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
    )},
    cell: ({ row }) => {
      const data= row.original
      return (<p className="mr-9 text-right">{Intl.NumberFormat("es-UY", { minimumFractionDigits: 0 }).format(data.pedidos)}</p>)
    }
  },

  {
    accessorKey: "coincidencias",
    header: ({ column }) => {
        return (
          <div className="text-right">
            <Button variant="ghost" className="pl-0 dark:text-white"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Coincidencias
              <ArrowUpDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
    )},
    cell: ({ row }) => {
      const data= row.original
      return (<p className="mr-12 text-right">{Intl.NumberFormat("es-UY", { minimumFractionDigits: 0 }).format(data.coincidencias)}</p>)
    }
  },

  {
    accessorKey: "coincidenciasOK",
    header: ({ column }) => {
        return (
          <div className="text-right">
            <Button variant="ghost" className="pl-0 dark:text-white"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              CoincidenciasOK
              <ArrowUpDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
    )},
    cell: ({ row }) => {
      const data= row.original
      return (<p className="mr-14 text-right">{Intl.NumberFormat("es-UY", { minimumFractionDigits: 0 }).format(data.coincidenciasOK)}</p>)
    }
  },

  {
    accessorKey: "tasaOK",
    header: ({ column }) => {
        return (
          <div className="text-right">
            <Button variant="ghost" className="pl-0 dark:text-white"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              TasaOK
              <ArrowUpDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
    )},
    cell: ({ row }) => {
      const data= row.original
      return (<p className="mr-7 text-right">{data.tasaOK}%</p>)
    }
  },

  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
        return (
          <div className="text-center">
            <Button variant="ghost" className="pl-0 dark:text-white"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Actualizado
              <ArrowUpDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
    )},
		cell: ({ row }) => {
      const data= row.original
      return (
        <p className="text-center mr-4">
          {formatDistanceToNow(data.updatedAt, {
                    locale: es,
          })}
        </p>
      )
    }
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const data= row.original

      const deleteDescription= `Do you want to delete Stat ${data.id}?`
 
      return (
        <div className="flex items-center justify-end gap-2">

          <UpdateButton inmo={data.inmo}/>
        </div>

      )
    },
  },
]


