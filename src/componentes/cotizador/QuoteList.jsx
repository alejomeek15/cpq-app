import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

import { useSelection } from '../../hooks/useSelection';
import SelectionToolbar from '../comunes/SelectionToolbar';
import CardView from '../comunes/CardView';
import QuoteCard from './QuoteCard';
import AlertDialog from '../comunes/AlertDialog';
import { Button } from '@/ui/button.jsx'; // <-- ¡IMPORTANTE! Se importa el componente Button

// --- Iconos para la Interfaz de Usuario ---
const ListIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>;
const KanbanIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;

// Este componente es responsable de mostrar la lista de cotizaciones.
const QuoteList = ({ db, onAddNewQuote, onEditQuote, setNotification }) => {
    // --- Estados del Componente ---
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('list');
    const [isDialogOpen, setDialogOpen] = useState(false);

    // --- Lógica de Selección ---
    const { selectedItems, handleSelect, handleSelectAll, hasSelection, isAllSelected } = useSelection(quotes);

    // --- Obtención de Datos ---
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

    useEffect(() => {
        fetchQuotes();
    }, [fetchQuotes]);

    // --- Manejadores de Acciones ---
    const handleDeleteSelected = () => {
        setDialogOpen(true);
    };

    const confirmDeletion = async () => {
        try {
            const batch = writeBatch(db);
            selectedItems.forEach(id => batch.delete(doc(db, "cotizaciones", id)));
            await batch.commit();
            fetchQuotes();
            setNotification({ 
                type: 'success', 
                title: 'Operación exitosa', 
                message: `${selectedItems.size} cotización(es) eliminada(s).` 
            });
        } catch (err) {
            setNotification({ 
                type: 'error', 
                title: 'Error', 
                message: 'No se pudieron eliminar las cotizaciones.' 
            });
            console.error("Error deleting quotes:", err);
        }
    };

    const getStatusBadge = (status = 'Borrador') => {
        const s = status.toLowerCase().replace(/\s/g, '-');
        const styles = {
            'borrador': 'bg-blue-500/10 text-blue-400', 'aprobada': 'bg-green-500/10 text-green-400',
            'rechazada': 'bg-red-500/10 text-red-400', 'enviada': 'bg-amber-500/10 text-amber-400',
        };
        return `px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[s] || 'bg-gray-500/10 text-gray-400'}`;
    };

    if (loading) return <div className="text-center p-10 text-text-secondary">Cargando...</div>;
    if (error) return <div className="text-center p-10 text-red-500 p-4">{error}</div>;
    
    return (
        <div>
            <AlertDialog
                isOpen={isDialogOpen}
                onClose={() => setDialogOpen(false)}
                onConfirm={confirmDeletion}
                title="¿Estás completamente seguro?"
                description={`Esta acción no se puede deshacer. Se eliminarán permanentemente ${selectedItems.size} cotización(es) de la base de datos.`}
            />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">Cotizaciones</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-surface rounded-lg p-1 border border-border">
                        <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-background text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}><ListIcon /></button>
                        <button onClick={() => setView('card')} className={`p-1.5 rounded-md ${view === 'card' ? 'bg-background text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}><KanbanIcon /></button>
                    </div>

                    {/* --- ¡CÓDIGO ACTUALIZADO AQUÍ! --- */}
                    {/* Usamos el componente Button importado */}
                    <Button onClick={onAddNewQuote}>
                        <PlusIcon className="mr-2 h-4 w-4" /> Nueva Cotización
                    </Button>

                </div>
            </div>

            {hasSelection && (
                <SelectionToolbar
                    selectionCount={selectedItems.size}
                    onDelete={handleDeleteSelected}
                />
            )}

            {quotes.length === 0 ? (
                <div className="text-center text-text-secondary py-16">No hay cotizaciones.</div>
            ) : (
                view === 'list' ? (
                    <div className="bg-surface rounded-large border border-border">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-text-secondary uppercase">
                                <tr className="border-b border-border">
                                    <th scope="col" className="p-4 w-4"><input type="checkbox" onChange={handleSelectAll} checked={isAllSelected} className="bg-surface border-border rounded focus:ring-primary"/></th>
                                    <th scope="col" className="px-6 py-3 text-left">Número</th>
                                    <th scope="col" className="px-6 py-3 text-left">Cliente</th>
                                    <th scope="col" className="px-6 py-3 text-left">Total</th>
                                    <th scope="col" className="px-6 py-3 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {quotes.map(quote => (
                                    <tr key={quote.id} className="hover:bg-white/5">
                                        <td className="p-4"><input type="checkbox" checked={selectedItems.has(quote.id)} onChange={() => handleSelect(quote.id)} className="bg-surface border-border rounded focus:ring-primary"/></td>
                                        <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap"><button onClick={() => onEditQuote(quote.id)} className="hover:text-primary transition-colors">{quote.numero}</button></td>
                                        <td className="px-6 py-4 text-text-secondary">{quote.clienteNombre}</td>
                                        <td className="px-6 py-4 text-text-secondary">${(quote.total || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center"><span className={getStatusBadge(quote.estado)}>{quote.estado}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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