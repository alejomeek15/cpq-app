import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { Button } from '@/ui/button.jsx';
import { createColumns } from './columns.jsx';
import { DataTable } from '@/ui/DataTable.jsx';
import AlertDialog from '../comunes/AlertDialog.jsx';
import CardView from '../comunes/CardView';
import ClientCard from './ClientCard';

// Iconos...
const ListIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>;
const KanbanIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;

const ClientList = ({ db, onEditClient, onAddNewClient, onImportClients, setNotification }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState([]);

  // --- ¡CAMBIO 1! ---
  // Nueva función para manejar la eliminación de un solo cliente.
  const handleDeleteClient = (clientId) => {
    setItemsToDelete([clientId]); // Ponemos el único ID en el estado
    setDialogOpen(true); // Abrimos el mismo diálogo de confirmación
  };
  
  // Pasamos la nueva función a createColumns.
  const columns = React.useMemo(() => createColumns(onEditClient, handleDeleteClient), [onEditClient]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
        const querySnapshot = await getDocs(collection(db, "clientes"));
        const clientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClients(clientsData);
    } catch (err) {
        setError("Error al cargar los clientes.");
        console.error("Error fetching clients:", err);
    } finally {
        setLoading(false);
    }
  }, [db]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // Esta función ahora se usa para la eliminación en lote desde la DataTable
  const handleDeleteSelected = (selectedRows) => {
    const idsToDelete = selectedRows.map(row => row.id);
    setItemsToDelete(idsToDelete);
    setDialogOpen(true);
  };

  const confirmDeletion = async () => {
    try {
      const batch = writeBatch(db);
      itemsToDelete.forEach(id => batch.delete(doc(db, "clientes", id)));
      await batch.commit();
      fetchClients();
      setNotification({ 
          type: 'success', 
          title: 'Operación exitosa', 
          message: `${itemsToDelete.length} cliente(s) eliminado(s).` 
      });
      setDialogOpen(false);
      setItemsToDelete([]);
    } catch (err) {
      setNotification({ type: 'error', title: 'Error', message: 'No se pudieron eliminar los clientes.' });
      console.error("Error deleting clients:", err);
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
        description={`Esta acción no se puede deshacer. Se eliminarán permanentemente ${itemsToDelete.length} cliente(s).`}
      />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-slate-700' : 'hover:text-white'}`}><ListIcon /></button>
            <button onClick={() => setView('kanban')} className={`p-1.5 rounded-md ${view === 'kanban' ? 'bg-slate-700' : 'hover:text-white'}`}><KanbanIcon /></button>
          </div>
          <Button variant="outline" onClick={onImportClients}>Importar</Button>
          <Button onClick={onAddNewClient}><PlusIcon className="mr-2 h-4 w-4" /> Nuevo Cliente</Button>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16">No hay clientes.</div>
      ) : (
        view === 'list' ? (
          <DataTable
            columns={columns}
            data={clients}
            filterColumn="nombre"
            // --- ¡CAMBIO 2! ---
            // Le pasamos la función para manejar la eliminación en lote.
            onDeleteSelectedItems={(selectedRows) => handleDeleteSelected(selectedRows)}
          />
        ) : (
          <CardView
            items={clients}
            onCardClick={onEditClient}
            renderCard={(client) => <ClientCard client={client} />}
          />
        )
      )}
    </div>
  );
};

export default ClientList;