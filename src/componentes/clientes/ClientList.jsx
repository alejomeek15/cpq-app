import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs, writeBatch, doc, query, orderBy } from 'firebase/firestore'; 
import { useAuth } from '@/context/useAuth';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { createColumns } from './columns.jsx';
import { DataTable } from '@/ui/DataTable.jsx';
import AlertDialog from '../comunes/AlertDialog.jsx';
import CardView from '../comunes/CardView';
import ClientCard from './ClientCard';

// Iconos
const ListIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>;
const KanbanIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>;
const SearchIcon = () => <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;

// normalizarTexto
const normalizarTexto = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// CAMBIO: Ahora recibe initialFilter como prop
const ClientList = ({ db, onEditClient, onAddNewClient, onImportClients, setNotification, initialFilter = '' }) => {
  const { user } = useAuth();

  // Estados
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState([]);
  
  // CAMBIO: Inicializar filtroGlobal con initialFilter
  const [filtroGlobal, setFiltroGlobal] = useState(initialFilter);

  // NUEVO: useEffect para actualizar el filtro cuando cambie initialFilter
  useEffect(() => {
    if (initialFilter) {
      setFiltroGlobal(initialFilter);
    }
  }, [initialFilter]);

  const handleDeleteClient = (clientId) => {
    setItemsToDelete([clientId]);
    setDialogOpen(true);
  };
  
  const columns = React.useMemo(() => createColumns(onEditClient, handleDeleteClient), [onEditClient, handleDeleteClient]);

  const fetchClients = useCallback(async () => {
    if (!user || !user.uid) {
      setLoading(false);
      setError("No se pudo verificar el usuario.");
      return;
    }

    setLoading(true);
    try {
        const clientsCollectionPath = collection(db, "usuarios", user.uid, "clientes");
        const q = query(clientsCollectionPath, orderBy("nombre", "asc"));
        const querySnapshot = await getDocs(q);
        const clientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClients(clientsData);
        setError(null);
    } catch (err) {
        setError("Error al cargar los clientes.");
        console.error("Error fetching clients:", err);
    } finally {
        setLoading(false);
    }
  }, [db, user]);

  useEffect(() => { 
    fetchClients(); 
  }, [fetchClients]);

  // clientsFiltrados
  const clientsFiltrados = useMemo(() => {
    const terminoNormalizado = normalizarTexto(filtroGlobal);
    if (!terminoNormalizado) {
      return clients;
    }
    return clients.filter(client => {
      const nombreNorm = normalizarTexto(client.nombre);
      const emailNorm = normalizarTexto(client.email);
      const telefonoNorm = normalizarTexto(client.telefono);
      const ciudadNorm = normalizarTexto(client.direccion?.ciudad);
      return (
        nombreNorm.includes(terminoNormalizado) ||
        emailNorm.includes(terminoNormalizado) ||
        telefonoNorm.includes(terminoNormalizado) ||
        ciudadNorm.includes(terminoNormalizado)
      );
    });
  }, [clients, filtroGlobal]);

  const handleDeleteSelected = (selectedRows) => {
    const idsToDelete = selectedRows.map(row => row.original.id);
    setItemsToDelete(idsToDelete);
    setDialogOpen(true);
  };

  const confirmDeletion = async () => {
    if (!user || !user.uid) {
      setNotification({ type: 'error', title: 'Error', message: 'No se pudo verificar el usuario para eliminar.' });
      return;
    }

    try {
      const batch = writeBatch(db);
      itemsToDelete.forEach(id => {
        if (id) {
            const docRef = doc(db, "usuarios", user.uid, "clientes", id);
            batch.delete(docRef);
        }
      });
      await batch.commit();
      fetchClients();
      setNotification({
          type: 'success',
          title: 'Operación exitosa',
          message: `${itemsToDelete.length} cliente(s) eliminado(s).`
      });
    } catch (err) {
      setNotification({ type: 'error', title: 'Error', message: 'No se pudieron eliminar los clientes.' });
      console.error("Error deleting clients:", err);
    } finally {
      setDialogOpen(false);
      setItemsToDelete([]);
    }
  };

  if (loading) return <div className="text-center p-10 text-muted-foreground">Cargando clientes...</div>;
  if (error) return <div className="text-center p-10 text-destructive">{error}</div>;

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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Clientes</h1> 
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-muted rounded-lg p-1 border">
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md ${view === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              title="Vista de Lista"
            >
              <ListIcon />
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-md ${view === 'kanban' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              title="Vista de Tarjetas"
            >
              <KanbanIcon />
            </button>
          </div>
          <Button variant="outline" onClick={onImportClients}>Importar</Button>
          <Button onClick={onAddNewClient}><PlusIcon className="mr-2 h-4 w-4" /> Nuevo Cliente</Button>
        </div>
      </div>

      <div className="mb-4 relative">
        <Input
          placeholder="Filtrar por nombre, email, teléfono o ciudad..."
          value={filtroGlobal}
          onChange={(e) => setFiltroGlobal(e.target.value)}
          className="max-w-sm pl-10"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <SearchIcon />
        </div>
      </div>

      {clientsFiltrados.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {filtroGlobal ? "No hay resultados para tu búsqueda." : "No hay clientes."}
        </div>
      ) : (
        view === 'list' ? (
          <DataTable
            columns={columns}
            data={clientsFiltrados}
            onDeleteSelectedItems={handleDeleteSelected}
          />
        ) : (
          <CardView
            items={clientsFiltrados}
            onCardClick={onEditClient}
            renderCard={(client) => <ClientCard client={client} />}
          />
        )
      )}
    </div>
  );
};

export default ClientList;