import { exec } from 'child_process'
import { promises as fs } from 'fs'
import util from 'util'
import { checkFile, formatModelNameForFile, parseModelFields } from './ts-generator'

const execAsync = util.promisify(exec)

export async function generateTableFile(home:string, frontendPath: string, modelName: string, modelDefinition: string): Promise<void> {
  const formattedModelName = formatModelNameForFile(modelName)
  const filePath = `${home}/src/app${frontendPath}/${formattedModelName}s/${formattedModelName}-table.tsx`
  
  const check= await checkFile(filePath)
  if (!check) return  

  const formCode = generateCode(modelName, modelDefinition)
  await fs.writeFile(filePath, formCode, 'utf8')

  try {
    await execAsync(`npx prettier --write ${filePath}`)
    console.log(`${formattedModelName}-table.tsx generado en ${filePath}`)
  } catch (error) {
    console.error('Error formateando el archivo:', error)
  }
}

function generateCode(modelName: string, modelDefinition: string): string {
  const fields = parseModelFields(modelDefinition).filter(field => field.name !== 'id' && field.name !== 'createdAt' && field.name !== 'updatedAt'  && field.name !== 'emailVerified?')
  fields.forEach(field => {
    if (field.name.includes('?')) {
      field.name = field.name.slice(0, -1)
    }
  })

  return `"use client"

import * as React from "react"
import { Table as TanstackTable } from "@tanstack/react-table"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
  
interface DataTableToolbarProps<TData> {
  table: TanstackTable<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex gap-1 dark:text-white items-center">
        ${fields.map(field => `
          <Input className="max-w-xs" placeholder="${field.name} filter..."
              value={(table.getColumn("${field.name}")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("${field.name}")?.setFilterValue(event.target.value)}                
          />
          `).join('\n      ')}
        {/* {table.getColumn("role") && roles && (
          <DataTableFacetedFilter
            column={table.getColumn("role")}
            title="Rol"
            options={roles}
          />
        )} */}
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
        <div className="flex-1 ">
          <DataTableViewOptions table={table}/>
        </div>
    </div>
  )
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  columnsOff?: string[]
  subject: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  columnsOff,
  subject,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })
  React.useEffect(() => {
    columnsOff && columnsOff.forEach(colName => {
      table.getColumn(colName)?.toggleVisibility(false)      
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [])

  return (
    <div className="w-full space-y-4 dark:text-white">
      <DataTableToolbar table={table}/>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} subject={subject}/>
    </div>
  )
}
`
}


