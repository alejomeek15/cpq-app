import React, { useState, useMemo } from 'react';
import { doc, updateDoc } from 'firebase/firestore';

// --- Importaciones de Dnd-Kit ---
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

// --- Importaciones de Componentes de UI ---
import { QuoteColumn } from './QuoteColumn';
import { SortableQuoteCard } from './SortableQuoteCard';
import QuoteCard from './QuoteCard';
import { ScrollArea, ScrollBar } from "@/ui/scroll-area.jsx";

// --- Constantes del Tablero ---
const BOARD_COLUMNS = {
  'Borrador': 'Borrador',
  'Enviada': 'Enviada',
  'En negociación': 'En negociación',
  'Aprobada': 'Aprobada',
  'Rechazada': 'Rechazada',
  'Vencida': 'Vencida',
};

// --- El Componente Especialista ---
export function QuoteBoard({ quotes, setQuotes, db, setNotification, fetchQuotes }) {
  
  // Estado local solo para D&D
  const [activeQuote, setActiveQuote] = useState(null);

  // Agrupamos las cotizaciones por estado
  const quoteGroups = useMemo(() => {
    const groups = {};
    Object.keys(BOARD_COLUMNS).forEach(status => groups[status] = []);
    quotes.forEach(quote => {
      const status = quote.estado && BOARD_COLUMNS[quote.estado] ? quote.estado : 'Borrador';
      if (!groups[status]) {
        groups[status] = []; 
      }
      groups[status].push(quote);
    });
    return groups;
  }, [quotes]);

  // Sensores para 'Pointer' y 'Keyboard'
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Función para actualizar el estado en Firebase
  const handleUpdateQuoteStatus = async (quoteId, newStatus) => {
    const quoteRef = doc(db, "cotizaciones", quoteId);
    try {
      await updateDoc(quoteRef, { estado: newStatus });
      setNotification({
        type: 'success',
        title: 'Cotización actualizada',
        message: `El estado se cambió a ${newStatus}.`
      });
    } catch (err) {
      console.error("Error updating quote status:", err);
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el estado.'
      });
      // Si falla, volvemos a cargar los datos para revertir el cambio visual
      if (fetchQuotes) fetchQuotes(); 
    }
  };

  // --- Manejadores de D&D ---

  function handleDragStart(event) {
    const { active } = event;
    const quote = quotes.find(q => q.id === active.id);
    setActiveQuote(quote);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAQuote = active.data.current?.type === 'Quote';
    const isOverAQuote = over.data.current?.type === 'Quote';
    const isOverAColumn = over.data.current?.type === 'Column';

    if (!isActiveAQuote) return;

    let newStatus;
    if (isOverAColumn) {
      newStatus = over.data.current.status;
    } else if (isOverAQuote) {
      newStatus = over.data.current.status;
    } else {
      return;
    }
    
    const activeQuote = quotes.find(q => q.id === activeId);
    if (activeQuote && activeQuote.estado !== newStatus) {
      // Actualización optimista del estado local
      setQuotes(prevQuotes => {
        const activeIndex = prevQuotes.findIndex(q => q.id === activeId);
        if (activeIndex === -1) return prevQuotes;
        
        const newQuotes = [...prevQuotes];
        newQuotes[activeIndex] = {
          ...newQuotes[activeIndex],
          estado: newStatus,
        };
        return newQuotes;
      });
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    
    setActiveQuote(null);
    if (!over) return;
    
    const activeId = active.id;
    const originalStatus = active.data.current.status;
    
    const isOverAQuote = over.data.current?.type === 'Quote';
    const isOverAColumn = over.data.current?.type === 'Column';

    let newStatus;
    if (isOverAColumn) {
      newStatus = over.data.current.status;
    } else if (isOverAQuote) {
      newStatus = over.data.current.status;
    } else {
      return;
    }

    if (originalStatus === newStatus) return;
    
    // Persistimos el cambio en Firebase
    handleUpdateQuoteStatus(activeId, newStatus);
  }

  // --- Renderizado del Tablero ---
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="w-full whitespace-nowrap rounded-lg">
        <div className="flex gap-6 pb-4">
          {Object.entries(BOARD_COLUMNS).map(([status, title]) => (
            <QuoteColumn
              key={status}
              id={status}
              title={title}
              quotes={quoteGroups[status] || []}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      <DragOverlay>
        {activeQuote ? (
          <QuoteCard quote={activeQuote} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}