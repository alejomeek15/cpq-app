import { Button } from "@/ui/button.jsx";
import { Switch } from "@/ui/switch.jsx";
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

export const createColumns = (onEdit, onDelete, onToggleActive) => [
  {
    id: 'drag-handle',
    header: '',
    cell: () => (
      <TableCell className="w-12 cursor-grab">
        <GripVertical className="h-4 w-4 text-slate-400" />
      </TableCell>
    ),
  },
  {
    id: "nombre",
    accessorKey: "nombre",
    header: "Nombre",
    // --- ¡CAMBIO AQUÍ! ---
    // Ahora la celda es un botón clickeable que llama a 'onEdit'.
    cell: ({ row }) => {
        const tax = row.original;
        return (
            <TableCell>
                <Button 
                    variant="link" 
                    className="p-0 h-auto font-medium text-white hover:text-indigo-400"
                    onClick={() => onEdit(tax)}
                >
                    {tax.nombre}
                </Button>
            </TableCell>
        );
    },
  },
  {
    id: "descripcion",
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => <TableCell className="text-slate-400">{row.original.descripcion}</TableCell>,
  },
  {
    id: "activo",
    header: "Activo",
    cell: ({ row }) => {
      const tax = row.original;
      return (
        <TableCell>
          <Switch
            checked={!!tax.activo} 
            onCheckedChange={(newStatus) => onToggleActive(tax.id, newStatus)}
          />
        </TableCell>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => {
      const tax = row.original;
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
              <DropdownMenuItem onClick={() => onEdit(tax)}>
                Editar Impuesto
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                onClick={() => onDelete(tax.id)}
              >
                Eliminar Impuesto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      )
    },
  },
];