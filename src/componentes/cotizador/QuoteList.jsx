import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs, writeBatch, doc, updateDoc } from 'firebase/firestore'; // <-- 1. Importar updateDoc
import { Button } from '@/ui/button.jsx';
import { createColumns } from './columns.jsx';
import { DataTable } from '@/ui/DataTable.jsx';
import AlertDialog from '../comunes/AlertDialog.jsx';
import CardView from '../comunes/CardView';
import QuoteCard from './QuoteCard';

// --- 2. Importaciones de Dnd-Kit y nuevos componentes ---
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
import { QuoteColumn } from './QuoteColumn';
import { SortableQuoteCard } from './SortableQuoteCard';
// --- Fin Importaciones ---


// --- 3. Definimos los iconos para las 3 vistas ---
const ListIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>;
const CardsIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const BoardIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm7 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V3zm7 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V3z"></path></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
// --- Fin Iconos ---

// --- 4. Definimos el orden y los nombres de las columnas del tablero ---
// Usamos los estados que vimos en tu 'columns.jsx'
const BOARD_COLUMNS = {
  'Borrador': 'Borrador 📝',
  'Enviada': 'Enviada ✉️',
  'En negociación': 'En negociación 💬',
  'Aprobada': 'Aprobada ✅',
  'Rechazada': 'Rechazada ❌',
  'Vencida': 'Vencida ⏳',
};

const QuoteList = ({ db, onAddNewQuote, onEditQuote, setNotification, clients, loadingClients }) => {
    const [quotes, setQuotes] = useState([]);
    const [loadingQuotes, setLoadingQuotes] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('list'); // 'list', 'card', 'board'
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState([]);
    
    // --- 5. Estado para Dnd-Kit ---
    const [activeQuote, setActiveQuote] = useState(null); // La cotización que se está arrastrando

    const handleDeleteQuote = (quoteId) => {
        setItemsToDelete([quoteId]);
        setDialogOpen(true);
    };
    
    const columns = React.useMemo(() => createColumns(onEditQuote, handleDeleteQuote, clients), [onEditQuote, clients]);

    const fetchQuotes = useCallback(async () => {
        setLoadingQuotes(true);
        setError(null);
        try {
            const querySnapshot = await getDocs(collection(db, "cotizaciones"));
            const quotesData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    vencimiento: data.vencimiento ? data.vencimiento.toDate() : null
                };
            });
            quotesData.sort((a, b) => (b.fechaCreacion?.toMillis() || 0) - (a.fechaCreacion?.toMillis() || 0));
            setQuotes(quotesData);
        } catch (err) {
            console.error("Error fetching quotes:", err);
            setError("No se pudieron cargar las cotizaciones.");
        } finally {
            setLoadingQuotes(false);
        }
    }, [db]);

    useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

    const handleDeleteSelected = (selectedRows) => {
        const idsToDelete = selectedRows.map(row => row.original.id);
        setItemsToDelete(idsToDelete);
        setDialogOpen(true);
    };

    const confirmDeletion = async () => {
        // ... (Tu función de borrado no necesita cambios)
        try {
            const batch = writeBatch(db);
            itemsToDelete.forEach(id => batch.delete(doc(db, "cotizaciones", id)));
            await batch.commit();
            fetchQuotes();
            setNotification({ 
                type: 'success', 
                title: 'Operación exitosa', 
                message: `${itemsToDelete.length} cotización(es) eliminada(s).` 
            });
            setDialogOpen(false);
            setItemsToDelete([]);
        } catch (err) {
            setNotification({ type: 'error', title: 'Error', message: 'No se pudieron eliminar las cotizaciones.' });
            console.error("Error deleting quotes:", err);
        }
    };

    // --- 6. Lógica de Dnd-Kit ---

    // Agrupamos las cotizaciones por estado para el tablero
    const quoteGroups = useMemo(() => {
      const groups = {};
      Object.keys(BOARD_COLUMNS).forEach(status => groups[status] = []);
      quotes.forEach(quote => {
        // Asegurarse de que el estado existe en nuestras columnas, si no, va a 'Borrador'
        const status = quote.estado && BOARD_COLUMNS[quote.estado] ? quote.estado : 'Borrador';
        if (!groups[status]) {
          groups[status] = []; // Asegurar que el grupo exista
        }
        groups[status].push(quote);
      });
      return groups;
    }, [quotes]);

    // Sensores para 'Pointer' (mouse, touch) y 'Keyboard'
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
        fetchQuotes(); 
      }
    };

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

      // No hacemos nada si estamos sobre el mismo item
      if (activeId === overId) return;

      const isActiveAQuote = active.data.current?.type === 'Quote';
      const isOverAQuote = over.data.current?.type === 'Quote';
      const isOverAColumn = over.data.current?.type === 'Column';

      if (!isActiveAQuote) return;

      // --- Lógica para mover entre columnas ---
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
      
      // Reseteamos la cotización activa del Overlay
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
        return; // No se soltó en un lugar válido
      }

      // Si el estado no cambió, no hacemos nada
      if (originalStatus === newStatus) return;
      
      // El estado local ya se actualizó en 'handleDragOver' (optimista)
      // Ahora, persistimos el cambio en Firebase
      handleUpdateQuoteStatus(activeId, newStatus);
    }

    // --- Fin Lógica Dnd-Kit ---


    if (loadingQuotes || loadingClients) return <div className="text-center p-10">Cargando datos...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
    
    return (
        <div>
            <AlertDialog
                isOpen={isDialogOpen}
                onClose={() => setDialogOpen(false)}
                onConfirm={confirmDeletion}
                title="¿Estás completamente seguro?"
                description={`Esta acción no se puede deshacer. Se eliminarán permanentemente ${itemsToDelete.length} cotización(es).`}
            />

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold tracking-tight">Cotizaciones</h1>
                <div className="flex items-center gap-4">
                    {/* --- 7. Botones de vista actualizados --- */}
                    <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-slate-700' : 'hover:text-white'}`} title="Vista de Lista">
                          <ListIcon />
                        </button>
                        <button onClick={() => setView('card')} className={`p-1.5 rounded-md ${view === 'card' ? 'bg-slate-700' : 'hover:text-white'}`} title="Vista de Tarjetas">
                          <CardsIcon />
                        </button>
                        <button onClick={() => setView('board')} className={`p-1.5 rounded-md ${view === 'board' ? 'bg-slate-700' : 'hover:text-white'}`} title="Vista de Tablero">
                          <BoardIcon />
                        </button>
                    </div>
                    {/* --- Fin Botones --- */}
                    <Button onClick={onAddNewQuote}>
                        <PlusIcon className="mr-2 h-4 w-4" /> Nueva Cotización
                    </Button>
                </div>
            </div>

            {/* --- 8. Lógica de renderizado de vistas --- */}
            {quotes.length === 0 ? (
                <div className="text-center py-16">No hay cotizaciones.</div>
            ) : view === 'list' ? (
                <DataTable
                    columns={columns}
                    data={quotes}
                    filterColumn="numero"
                    onDeleteSelectedItems={handleDeleteSelected}
                />
            ) : view === 'card' ? (
                <CardView 
                    items={quotes}
                    onCardClick={onEditQuote}
                    renderCard={(quote) => <QuoteCard quote={quote} />}
                />
            ) : (
                // --- VISTA DE TABLERO (BOARD) ---
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex gap-6 overflow-x-auto pb-4">
                    {Object.entries(BOARD_COLUMNS).map(([status, title]) => (
                      <QuoteColumn
                        key={status}
                        id={status}
                        title={title}
                        quotes={quoteGroups[status] || []}
                      />
                    ))}
                  </div>
                  
                  {/* Overlay para la tarjeta que se arrastra */}
                  <DragOverlay>
                    {activeQuote ? (
                      <QuoteCard quote={activeQuote} />
                    ) : null}
                  </DragOverlay>
                </DndContext>
            )}
            {/* --- Fin Lógica de renderizado --- */}
        </div>
    );
};

export default QuoteList;