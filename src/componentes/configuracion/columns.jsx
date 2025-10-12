import { Button } from "@/ui/button.jsx";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/ui/dropdown-menu.jsx";
import { GripVertical, MoreHorizontal } from "lucide-react";
import { TableCell } from '@/ui/table.jsx';

// La función ahora recibe manejadores para editar y eliminar
export const createColumns = (onEdit, onDelete) => [
  // Columna para el control de arrastre (Handle)
  {
    id: 'drag-handle',
    header: '',
    cell: () => (
      <TableCell className="w-12 cursor-grab">
        <GripVertical className="h-4 w-4 text-slate-400" />
      </TableCell>
    ),
  },
  
  // Columna de Nombre
  {
    id: "nombre",
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => <TableCell>{row.original.nombre}</TableCell>,
  },
  
  // Columna de Acciones
  {
    id: "actions",
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => {
      const condition = row.original;
      return (
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(condition)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                onClick={() => onDelete(condition.id)}
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      )
    },
  },
];