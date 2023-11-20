"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  tipos: string[]
  zonas: string[]
  ciudades: string[]
  departamentos: string[]
  paises: string[]
  enVentas: string[]
  enAlquileres: string[]
  alquiladas: string[]  
  dormitorios: string[]
  banios: string[]
  garages: string[]
  parrilleros: string[]
  piscinas: string[]
  calefacciones: string[]
  amuebladas: string[]
  pisos: string[]
}

export function DataTableToolbar<TData>({ table, tipos, zonas, ciudades, departamentos, paises, enVentas, enAlquileres, alquiladas, dormitorios, banios, garages, parrilleros, piscinas, calefacciones, amuebladas, pisos }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const sino= ["si", "no"]
  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        <Input className="max-w-xs" placeholder="Filtrar por Id Propiedad..."
            value={(table.getColumn("idPropiedad")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("idPropiedad")?.setFilterValue(event.target.value)}                
        />
        <Input className="max-w-xs" placeholder="Filtrar por título..."
            value={(table.getColumn("titulo")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("titulo")?.setFilterValue(event.target.value)}                
        />
        <Input className="max-w-xs" placeholder="Filtrar por descripción..."
            value={(table.getColumn("descripcion")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("descripcion")?.setFilterValue(event.target.value)}                
        />
        <div className="flex-1 ">
          <DataTableViewOptions table={table}/>
        </div>
      </div>
      <div className="flex items-center gap-1 dark:text-white">
        {table.getColumn("tipo") && tipos.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("tipo")}
            title="Tipo"
            options={tipos}
          />
        )}
        {table.getColumn("enVenta") && ciudades.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("enVenta")}
            title="EnVenta"
            options={enVentas}
          />
        )}
        {table.getColumn("enAlquiler") && ciudades.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("enAlquiler")}
            title="EnAlquiler"
            options={enAlquileres}
          />
        )}
        {table.getColumn("alquilada") && ciudades.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("alquilada")}
            title="Alquilada"
            options={alquiladas}
          />
        )}
        {table.getColumn("amueblada") && ciudades.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("amueblada")}
            title="Amueblada"
            options={amuebladas}
          />
        )}
        {table.getColumn("piso") && ciudades.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("piso")}
            title="Piso"
            options={pisos}
          />
        )}
      </div>
      <div className="flex items-center gap-1 dark:text-white">
        {table.getColumn("zona") && zonas.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("zona")}
            title="Zona"
            options={zonas}
          />
        )}
        {table.getColumn("ciudad") && ciudades.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("ciudad")}
            title="Ciudad"
            options={ciudades}
          />
        )}
        {table.getColumn("departamento") && ciudades.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("departamento")}
            title="Departamento"
            options={departamentos}
          />
        )}
        {table.getColumn("pais") && ciudades.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("pais")}
            title="País"
            options={paises}
          />
        )}
        <div className="flex gap-1 ml-10">
          {table.getColumn("seguridad") && ciudades.length>0 && (
            <DataTableFacetedFilter
              column={table.getColumn("seguridad")}
              title="Seguridad"
              options={sino}
            />
          )}
          {table.getColumn("asensor") && ciudades.length>0 && (
            <DataTableFacetedFilter
              column={table.getColumn("asensor")}
              title="Asensor"
              options={sino}
            />
          )}
          {table.getColumn("lavadero") && ciudades.length>0 && (
            <DataTableFacetedFilter
              column={table.getColumn("lavadero")}
              title="Lavadero"
              options={sino}
            />
          )}

        </div>
      </div>
      <div className="flex items-center gap-1 dark:text-white">
        {table.getColumn("dormitorios") && ciudades.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("dormitorios")}
            title="Dormitorios"
            options={dormitorios}
          />
        )}
        {table.getColumn("banios") && ciudades.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("banios")}
            title="Baños"
            options={banios}
          />
        )}
        {table.getColumn("garages") && ciudades.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("garages")}
            title="Garages"
            options={garages}
          />
        )}
        {table.getColumn("parrilleros") && ciudades.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("parrilleros")}
            title="Parrilleros"
            options={parrilleros}
          />
        )}
        {table.getColumn("piscinas") && ciudades.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("piscinas")}
            title="Piscinas"
            options={piscinas}
          />
        )}
        {table.getColumn("calefaccion") && ciudades.length>0 && (
          <DataTableFacetedFilter
            column={table.getColumn("calefaccion")}
            title="Calefaccion"
            options={calefacciones}
          />
        )}


        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="w-4 h-4 ml-2" />
          </Button>
        )}
    </div>

    </div>
  )
}