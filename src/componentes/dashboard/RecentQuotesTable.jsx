import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/ui/table.jsx";
import { Badge } from '@/ui/badge.jsx';

// Componente para mostrar las últimas 5 cotizaciones
export const RecentQuotesTable = ({ quotes, onRowClick }) => {
  // Función de ayuda para los badges de estado
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Aprobada': return 'default';
      case 'Rechazada': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <TableRow key={quote.id} onClick={() => onRowClick(quote.id)} className="cursor-pointer">
              <TableCell className="font-medium">{quote.numero}</TableCell>
              <TableCell>{quote.clienteNombre}</TableCell>
              <TableCell className="text-slate-400">
                {quote.fechaCreacion ? format(quote.fechaCreacion.toDate(), 'PPP', { locale: es }) : '-'}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={getStatusVariant(quote.estado)}>{quote.estado}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(quote.total || 0)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};