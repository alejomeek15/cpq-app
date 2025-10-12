import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

import { Button } from '@/ui/button.jsx';
import { createColumns } from './columns.jsx';
import { DataTable } from '@/ui/DataTable.jsx';
import AlertDialog from '../comunes/AlertDialog.jsx';
import CardView from '../comunes/CardView';
import QuoteCard from './QuoteCard';

const ListIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>;
const KanbanIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;

const QuoteList = ({ db, onAddNewQuote, onEditQuote, setNotification }) => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('list');
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState([]);

    const handleDeleteQuote = (quoteId) => {
        setItemsToDelete([quoteId]);
        setDialogOpen(true);
    };
    
    const columns = React.useMemo(() => createColumns(onEditQuote, handleDeleteQuote), [onEditQuote]);

    const fetchQuotes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const querySnapshot = await getDocs(collection(db, "cotizaciones"));
            const quotesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            quotesData.sort((a, b) => (b.fechaCreacion?.toMillis() || 0) - (a.fechaCreacion?.toMillis() || 0));
            setQuotes(quotesData);
        } catch (err) {
            console.error("Error fetching quotes:", err);
            setError("No se pudieron cargar las cotizaciones.");
        } finally {
            setLoading(false);
        }
    }, [db]);

    useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

    const handleDeleteSelected = (selectedRows) => {
        const idsToDelete = selectedRows.map(row => row.id);
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

    if (loading) return <div className="text-center p-10">Cargando...</div>;
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
                    <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-slate-700' : 'hover:text-white'}`}><ListIcon /></button>
                        <button onClick={() => setView('card')} className={`p-1.5 rounded-md ${view === 'card' ? 'bg-slate-700' : 'hover:text-white'}`}><KanbanIcon /></button>
                    </div>
                    <Button onClick={onAddNewQuote}>
                        <PlusIcon className="mr-2 h-4 w-4" /> Nueva Cotización
                    </Button>
                </div>
            </div>

            {quotes.length === 0 ? (
                <div className="text-center py-16">No hay cotizaciones.</div>
            ) : (
                view === 'list' ? (
                    <DataTable
                        columns={columns}
                        data={quotes}
                        filterColumn="numero"
                        onDeleteSelectedItems={handleDeleteSelected}
                    />
                ) : (
                    <CardView 
                        items={quotes}
                        onCardClick={onEditQuote}
                        renderCard={(quote) => <QuoteCard quote={quote} />}
                    />
                )
            )}
        </div>
    );
};

export default QuoteList;