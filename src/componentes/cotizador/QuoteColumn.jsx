// --- QuoteColumn.jsx (Modificado) ---

import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableQuoteCard } from './SortableQuoteCard';
import { Badge } from '@/ui/badge.jsx'; // <-- 1. Importar Badge
import { cn } from "@/lib/utils";      // <-- 1. Importar cn

export function QuoteColumn({ id, title, quotes }) {
  const { setNodeRef, isOver } = useDroppable({ // <-- 4. Obtener isOver
    id: id,
    data: {
      type: 'Column',
      status: id,
    }
  });

  return (
    // Contenedor principal de la columna
    <div className="flex-shrink-0 w-80">
      
      {/* --- 2. Título centrado con flex y gap --- */}
      <h2 className="flex items-center justify-center gap-2 text-sm font-semibold uppercase text-slate-400 mb-3 px-1">
        {title} 
        
        {/* --- 3. Usar el componente Badge --- */}
        <Badge variant="secondary" className="text-slate-300 bg-slate-700/50">
          {quotes.length}
        </Badge>
      </h2>
      
      {/* Contexto 'Sortable' para las tarjetas */}
      <SortableContext
        id={id}
        items={quotes.map(q => q.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          // --- 4. Mejora visual: Borde resalta en 'isOver' ---
          className={cn(
            "flex flex-col gap-4 p-4 min-h-[300px] bg-slate-900/50 rounded-lg border transition-colors",
            isOver ? "border-blue-600/50" : "border-slate-700/50"
          )}
        >
          {quotes.map(quote => (
            <SortableQuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}