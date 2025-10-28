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

// Function receives onToggleActive handler
export const createColumns = (onEdit, onDelete, onToggleActive) => [
  {
    id: 'drag-handle',
    header: '', // Keep empty or add minimal padding if needed
    cell: () => (
      // Assume TableCell applies base styles
      <TableCell className="w-12 cursor-grab pl-4"> {/* Added padding-left */}
        {/* --- FIX 1: Use text-muted-foreground for the icon --- */}
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </TableCell>
    ),
  },

  {
    id: "nombre",
    accessorKey: "nombre",
    header: "Nombre", // Header text will inherit table header color
    cell: ({ row }) => {
        const condition = row.original;
        return (
            <TableCell>
                <Button
                    variant="link"
                    // --- FIX 2: Removed text-white and hover color ---
                    // Link variant uses primary color by default
                    className="p-0 h-auto font-medium"
                    onClick={() => onEdit(condition)}
                >
                    {condition.nombre}
                </Button>
            </TableCell>
        );
    },
  },

  {
    id: "activo",
    header: "Activo", // Header text inherits
    cell: ({ row }) => {
      const condition = row.original;
      return (
        <TableCell>
          {/* Switch component should be theme-aware */}
          <Switch
            checked={!!condition.activo}
            onCheckedChange={(newStatus) => onToggleActive(condition.id, newStatus)}
          />
        </TableCell>
      );
    },
  },

  {
    id: "actions",
    // Header alignment is OK
    header: () => <div className="text-right pr-4">Acciones</div>, // Added padding-right
    cell: ({ row }) => {
      const condition = row.original;
      return (
        // Cell alignment is OK
        <TableCell className="text-right pr-4"> {/* Added padding-right */}
          {/* DropdownMenu components should be theme-aware */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* Button ghost is theme-aware */}
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
              {/* Destructive item colors are semantic, OK to keep red */}
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