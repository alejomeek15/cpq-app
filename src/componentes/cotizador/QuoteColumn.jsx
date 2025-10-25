import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableQuoteCard } from './SortableQuoteCard';

export function QuoteColumn({ id, title, quotes }) {
  const { setNodeRef } = useDroppable({
    id: id, // El 'id' de esta columna es el nombre del estado (ej. "Borrador")
    data: {
      type: 'Column',
      status: id,
    }
  });

  return (
    // Contenedor principal de la columna
    <div className="flex-shrink-0 w-80">
      <h2 className="text-sm font-semibold uppercase text-slate-400 mb-3 px-1">
        {title} <span className="text-slate-500 ml-1">{quotes.length}</span>
      </h2>
      
      {/* Contexto 'Sortable' para las tarjetas */}
      <SortableContext
        id={id}
        items={quotes.map(q => q.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef} // Referencia para que sea un área 'droppable'
          className="flex flex-col gap-4 p-4 min-h-[300px] bg-slate-900/50 rounded-lg"
        >
          {quotes.map(quote => (
            <SortableQuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}