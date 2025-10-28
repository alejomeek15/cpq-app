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
import { TableCell } from '@/ui/table.jsx'; // Assuming TableCell handles theming

export const createColumns = (onEdit, onDelete, onToggleActive) => [
  {
    id: 'drag-handle',
    header: '',
    cell: () => (
      // Added padding-left for alignment
      <TableCell className="w-12 cursor-grab pl-4">
        {/* --- FIX 1: Use text-muted-foreground --- */}
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </TableCell>
    ),
  },
  {
    id: "nombre",
    accessorKey: "nombre",
    header: "Nombre", // Inherits theme color
    cell: ({ row }) => {
        const tax = row.original;
        return (
            <TableCell>
                <Button
                    variant="link"
                    // --- FIX 2: Removed text-white and hover color ---
                    // Link variant uses primary theme color
                    className="p-0 h-auto font-medium"
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
    header: "Descripción", // Inherits theme color
    // --- FIX 3: Use text-muted-foreground ---
    cell: ({ row }) => <TableCell className="text-muted-foreground">{row.original.descripcion}</TableCell>,
  },
  {
    id: "activo",
    header: "Activo", // Inherits theme color
    cell: ({ row }) => {
      const tax = row.original;
      return (
        <TableCell>
          {/* Switch should be theme-aware */}
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
    // Added padding-right for alignment
    header: () => <div className="text-right pr-4">Acciones</div>,
    cell: ({ row }) => {
      const tax = row.original;
      return (
        // Added padding-right for alignment
        <TableCell className="text-right pr-4">
          {/* DropdownMenu components should be theme-aware */}
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
              {/* Destructive item colors are semantic, OK to keep red */}
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