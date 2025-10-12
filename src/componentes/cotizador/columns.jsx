import { Button } from "@/ui/button.jsx";
import { Checkbox } from "@/ui/checkbox.jsx";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/ui/dropdown-menu.jsx";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

// Función de ayuda para los badges de estado (la movimos aquí desde QuoteList)
const getStatusBadge = (status = 'Borrador') => {
    const s = status.toLowerCase().replace(/\s/g, '-');
    const styles = {
        'borrador': 'bg-blue-500/10 text-blue-400', 'aprobada': 'bg-green-500/10 text-green-400',
        'rechazada': 'bg-red-500/10 text-red-400', 'enviada': 'bg-amber-500/10 text-amber-400',
        'en-negociacion': 'bg-purple-500/10 text-purple-400', 'vencida': 'bg-gray-500/10 text-gray-400'
    };
    return `px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[s] || 'bg-gray-500/10 text-gray-400'}`;
};

export const createColumns = (onEditQuote, onDeleteQuote) => [
  // Columna de Selección (Checkbox)
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
  
  // Columna de Número (Ordenable y Clickable)
  {
    accessorKey: "numero",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Número <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Button
        variant="link"
        className="p-0 h-auto font-medium text-white"
        onClick={() => onEditQuote(row.original.id)}
      >
        {row.getValue("numero")}
      </Button>
    ),
  },

  // Columna de Cliente
  {
    accessorKey: "clienteNombre",
    header: "Cliente",
  },

  // Columna de Total (Formateada como moneda)
  {
    accessorKey: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total") || 0);
      const formatted = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },

  // Columna de Estado (con badge de color)
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
        <span className={getStatusBadge(row.getValue("estado"))}>
            {row.getValue("estado")}
        </span>
    ),
  },
  
  // Columna de Acciones
  {
    id: "actions",
    cell: ({ row }) => {
      const quote = row.original;
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
            <DropdownMenuItem onClick={() => onEditQuote(quote.id)}>
              Editar Cotización
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
              onClick={() => onDeleteQuote(quote.id)}
            >
              Eliminar Cotización
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
];