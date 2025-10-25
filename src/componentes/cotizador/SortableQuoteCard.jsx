import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import QuoteCard from './QuoteCard';

export function SortableQuoteCard({ quote }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: quote.id,
    // Pasamos el estado actual como 'data' para saber de qué columna viene
    data: {
      type: 'Quote',
      status: quote.estado,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <QuoteCard
      ref={setNodeRef}
      style={style}
      quote={quote}
      isDragging={isDragging} // Pasamos isDragging a tu QuoteCard
      {...attributes}
      {...listeners} // Esto aplica los listeners para 'mousedown', 'touchstart', etc.
    />
  );
}