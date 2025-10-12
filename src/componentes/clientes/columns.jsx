import { Button } from "@/ui/button.jsx";
import { Checkbox } from "@/ui/checkbox.jsx";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator, // <-- Importamos el separador
  DropdownMenuTrigger 
} from "@/ui/dropdown-menu.jsx";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

// La función ahora también recibe un manejador para eliminar
export const createColumns = (onEditClient, onDeleteClient) => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  
  {
    accessorKey: "nombre",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const client = row.original;
      return (
        <Button
          variant="link"
          className="p-0 h-auto font-medium text-white"
          onClick={() => onEditClient(client.id)}
        >
          {client.nombre}
        </Button>
      );
    },
  },

  { accessorKey: "email", header: "Email" },
  { accessorKey: "telefono", header: "Teléfono" },
  { accessorFn: (row) => row.direccion?.pais, id: "pais", header: "País" },
  
  // --- ¡CAMBIO AQUÍ! ---
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEditClient(client.id)}>
              Editar Cliente
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* 2. Añadimos el nuevo ítem para eliminar, con un color rojo */}
            <DropdownMenuItem 
              className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
              onClick={() => onDeleteClient(client.id)}
            >
              Eliminar Cliente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
];