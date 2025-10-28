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
  // Función de ayuda para los badges de estado (sin cambios, esto está bien)
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Aprobada': return 'default'; // Suponiendo que 'default' en Badge es el verde o similar
      case 'Rechazada': return 'destructive';
      default: return 'secondary'; // Para Borrador, Enviada, etc.
    }
  };

  return (
    // El contenedor usa 'border-border', está bien
    <div className="rounded-lg border border-border">
      {/* El componente Table de tu UI debería ser theme-aware */}
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
            // TableRow de tu UI debería ser theme-aware
            <TableRow key={quote.id} onClick={() => onRowClick(quote.id)} className="cursor-pointer">
              <TableCell className="font-medium">{quote.numero}</TableCell>
              <TableCell>{quote.clienteNombre}</TableCell>
              {/* --- ¡CAMBIO AQUÍ! --- */}
              {/* Reemplazamos 'text-slate-400' por 'text-muted-foreground' */}
              <TableCell className="text-muted-foreground">
                {quote.fechaCreacion ? format(quote.fechaCreacion.toDate(), 'PPP', { locale: es }) : '-'}
              </TableCell>
              <TableCell className="text-center">
                {/* El Badge usa variantes, está bien */}
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