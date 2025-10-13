import { Button } from "@/ui/button.jsx";
import { Switch } from "@/ui/switch.jsx"; // <-- 1. Importamos el componente Switch
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

// La función ahora también recibe un manejador para el switch
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
    cell: ({ row }) => {
        const condition = row.original;
        return (
            <TableCell>
                <Button 
                    variant="link" 
                    className="p-0 h-auto font-medium text-white hover:text-indigo-400"
                    onClick={() => onEdit(condition)}
                >
                    {condition.nombre}
                </Button>
            </TableCell>
        );
    },
  },
  
  // --- ¡NUEVA COLUMNA "ACTIVO"! ---
  {
    id: "activo",
    header: "Activo",
    cell: ({ row }) => {
      const condition = row.original;
      return (
        <TableCell>
          <Switch
            // El estado del switch se basa en el campo 'activo' del documento
            checked={!!condition.activo} 
            // Cuando cambia, llamamos a la función que nos pasaron
            onCheckedChange={(newStatus) => onToggleActive(condition.id, newStatus)}
          />
        </TableCell>
      );
    },
  },

  {
    id: "actions",
    header: () => <div className="text-right">Acciones</div>,
    cell: ({ row }) => {
      // ... (código del menú de acciones sin cambios)
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