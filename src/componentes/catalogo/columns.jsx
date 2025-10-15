import { Button } from "@/ui/button.jsx";
import { Checkbox } from "@/ui/checkbox.jsx";
import { Badge } from "@/ui/badge.jsx";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/ui/dropdown-menu.jsx";
import { MoreHorizontal } from "lucide-react";

// Helper to format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0);
};

// Helper to get badge style based on product type
const getBadgeVariant = (type) => {
    switch (type) {
      case 'simple': return 'default';
      case 'composite': return 'secondary';
      case 'kit': return 'outline';
      default: return 'secondary';
    }
};

export const createColumns = (onProductClick) => [
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
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => (
      <button 
        onClick={() => onProductClick(row.original)}
        className="font-medium hover:underline"
      >
        {row.getValue("name")}
      </button>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => (
      <Badge variant={getBadgeVariant(row.getValue("type"))} className="capitalize">
        {row.getValue("type")}
      </Badge>
    ),
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Precio</div>,
    cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue("price"))}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onProductClick(product)}>
                Ver / Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
];