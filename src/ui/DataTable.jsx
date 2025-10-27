// --- DataTable.jsx (Actualizado) ---
import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table.jsx";

import { Button } from "@/ui/button.jsx";
// 'Input' ya no es necesario aquí
import { Trash2 } from 'lucide-react';

// --- ¡CAMBIO! 'filterColumn' se ha eliminado de las props ---
export function DataTable({ columns, data, onDeleteSelectedItems }) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]); // Esto se queda, es inofensivo
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Se queda para la selección/paginación
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });
  
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div>
      {/* --- Barra de Herramientas Superior (Filtro y Acciones) --- */}
      <div className="flex items-center justify-end py-4"> {/* ¡CAMBIO! se quita justify-between */}
        
        {/* --- ¡CAMBIO! El <Input> ha sido eliminado de este archivo --- */}

        {selectedRowCount > 0 && (
          <Button
            variant="destructive"
            onClick={() => onDeleteSelectedItems(table.getFilteredSelectedRowModel().rows)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar ({selectedRowCount})
          </Button>
        )}
      </div>

      {/* --- La Tabla --- */}
      <div className="rounded-md border border-slate-700">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-slate-700 hover:bg-slate-800/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-slate-700 data-[state=selected]:bg-slate-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- Controles de Paginación y Conteo de Selección --- */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-slate-400">
          {selectedRowCount} de {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}