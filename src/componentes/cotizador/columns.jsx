import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotePDF from './QuotePDF.jsx';
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

const getStatusBadge = (status = 'Borrador') => {
    const s = status.toLowerCase().replace(/\s/g, '-');
    const styles = {
        'borrador': 'bg-blue-500/10 text-blue-400', 'aprobada': 'bg-green-500/10 text-green-400',
        'rechazada': 'bg-red-500/10 text-red-400', 'enviada': 'bg-amber-500/10 text-amber-400',
        'en-negociacion': 'bg-purple-500/10 text-purple-400', 'vencida': 'bg-gray-500/10 text-gray-400'
    };
    return `px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[s] || 'bg-gray-500/10 text-gray-400'}`;
};

// **CAMBIO: La función ahora acepta 'clients'**
export const createColumns = (onEditQuote, onDeleteQuote, clients) => [
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
  {
    accessorKey: "clienteNombre",
    header: "Cliente",
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total") || 0);
      const formatted = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
        <span className={getStatusBadge(row.getValue("estado"))}>
            {row.getValue("estado")}
        </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const quote = row.original;
      // **CAMBIO: Buscamos el cliente aquí mismo**
      const client = clients.find(c => c.id === quote.clienteId);

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

            {/* **CAMBIO: El botón de descarga ahora tiene acceso a 'client'** */}
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                {client ? (
                    <PDFDownloadLink
                        document={<QuotePDF quote={quote} client={client} />}
                        fileName={`${quote.numero || 'cotizacion'}.pdf`}
                        style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
                    >
                        {({ loading }) => (loading ? 'Generando...' : 'Descargar PDF')}
                    </PDFDownloadLink>
                ) : (
                    // Fallback por si el cliente no se encuentra
                    <span style={{color: 'gray', fontSize: '12px'}}>Cargando datos...</span>
                )}
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