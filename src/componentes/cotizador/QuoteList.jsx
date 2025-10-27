import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx'; 
import { createColumns } from './columns.jsx';
import { DataTable } from '@/ui/DataTable.jsx';
import AlertDialog from '../comunes/AlertDialog.jsx';
import CardView from '../comunes/CardView';
import QuoteCard from './QuoteCard';
import { QuoteBoard } from './QuoteBoard.jsx';

// --- Iconos (sin cambios) ---
const ListIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>;
const CardsIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const BoardIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm7 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V3zm7 0a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V3z"></path></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const SearchIcon = () => <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>; 

// --- ¡CAMBIO 1! Función helper para normalizar texto (ignora tildes y mayúsculas) ---
const normalizarTexto = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD") // Separa letras de acentos (ej: "é" -> "e" + "´")
    .replace(/[\u0300-\u036f]/g, ""); // Elimina los acentos
};
// --- FIN DEL CAMBIO ---

const QuoteList = ({ db, onAddNewQuote, onEditQuote, setNotification, clients, loadingClients }) => {
    const [quotes, setQuotes] = useState([]);
    const [loadingQuotes, setLoadingQuotes] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('list');
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState([]);
    
    const [filtroGlobal, setFiltroGlobal] = useState('');

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

    // --- ¡CAMBIO 2! El filtro ahora usa la función 'normalizarTexto' ---
    const quotesFiltrados = useMemo(() => {
      // Normalizamos el término de búsqueda UNA SOLA VEZ
      const terminoNormalizado = normalizarTexto(filtroGlobal);
      
      if (!terminoNormalizado) {
        return quotes; // Sin filtro, devuelve todo
      }

      return quotes.filter(quote => {
        // Normalizamos los datos de la cotización antes de comparar
        const numeroNormalizado = normalizarTexto(quote.numero);
        const clienteNormalizado = normalizarTexto(quote.clienteNombre);

        return (
          numeroNormalizado.includes(terminoNormalizado) ||
          clienteNormalizado.includes(terminoNormalizado)
        );
      });
    }, [quotes, filtroGlobal]);
    // --- FIN DEL CAMBIO ---


    const handleDeleteSelected = (selectedRows) => {
        const idsToDelete = selectedRows.map(row => row.original.id);
        setItemsToDelete(idsToDelete);
        setDialogOpen(true);
    };

    const confirmDeletion = async () => {
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

    if (loadingQuotes || loadingClients) return <div className="text-center p-10">Cargando datos...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
    
    return (
        <div className="min-w-0"> 
            <AlertDialog
                isOpen={isDialogOpen}
                onClose={() => setDialogOpen(false)}
                onConfirm={confirmDeletion}
                title="¿Estás completamente seguro?"
                description={`Esta acción no se puede deshacer. Se eliminarán permanente ${itemsToDelete.length} cotización(es).`}
            />

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold tracking-tight">Cotizaciones</h1>
                <div className="flex items-center gap-4">
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
                    <Button onClick={onAddNewQuote}>
                        <PlusIcon className="mr-2 h-4 w-4" /> Nueva Cotización
                    </Button>
                </div>
            </div>

            <div className="mb-4 relative">
              <Input
                placeholder="Filtrar por número o cliente..."
                value={filtroGlobal}
                onChange={(e) => setFiltroGlobal(e.target.value)}
                className="max-w-sm bg-slate-800 border-slate-700 pl-10"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </div>
            </div>

            {quotesFiltrados.length === 0 ? (
                <div className="text-center py-16">
                  {filtroGlobal ? "No hay resultados para tu búsqueda." : "No hay cotizaciones."}
                </div>
            ) : view === 'list' ? (
                <DataTable
                    columns={columns}
                    data={quotesFiltrados}
                    onDeleteSelectedItems={handleDeleteSelected}
                />
            ) : view === 'card' ? (
                <CardView 
                    items={quotesFiltrados}
                    onCardClick={onEditQuote}
                    renderCard={(quote) => <QuoteCard quote={quote} />}
                />
            ) : (
                <QuoteBoard
                  quotes={quotesFiltrados}
                  setQuotes={setQuotes}
                  db={db}
                  setNotification={setNotification}
                  fetchQuotes={fetchQuotes}
                />
            )}
        </div>
    );
};

export default QuoteList;