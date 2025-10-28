import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableQuoteCard } from './SortableQuoteCard';
import { Badge } from '@/ui/badge.jsx'; 
import { cn } from "@/lib/utils";

export function QuoteColumn({ id, title, quotes }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: 'Column',
      status: id,
    }
  });

  return (
    <div className="flex-shrink-0 w-80">
      
      {/* --- ¡CAMBIO! text-slate-400 -> text-muted-foreground --- */}
      <h2 className="flex items-center justify-center gap-2 text-sm font-semibold uppercase text-muted-foreground mb-3 px-1">
        {title} 
        
        {/* --- ¡CAMBIO! Clases de color eliminadas, confiamos en la variante 'secondary' --- */}
        <Badge variant="secondary">
          {quotes.length}
        </Badge>
      </h2>
      
      <SortableContext
        id={id}
        items={quotes.map(q => q.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          // --- ¡CAMBIOS AQUÍ! ---
          // Reemplazamos clases hard-codeadas por variables
          className={cn(
            "flex flex-col gap-4 p-4 min-h-[300px] bg-muted rounded-lg border transition-colors",
            isOver ? "border-primary" : "border" // Usamos 'border-primary' para el resaltado
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