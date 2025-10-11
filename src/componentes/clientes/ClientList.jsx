import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useSelection } from '../../hooks/useSelection';
import SelectionToolbar from '../comunes/SelectionToolbar';
import CardView from '../comunes/CardView';
import ClientCard from './ClientCard';
import AlertDialog from '../comunes/AlertDialog';
import { Button } from '@/ui/button.jsx';

// --- Iconos para la Interfaz de Usuario ---
const ListIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
  </svg>
);

const KanbanIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
  </svg>
);

const ClientList = ({ db, onEditClient, onAddNewClient, onImportClients, setNotification }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('list');
  const [isDialogOpen, setDialogOpen] = useState(false);

  const { selectedItems, handleSelect, handleSelectAll, hasSelection, isAllSelected } =
    useSelection(clients);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'clientes'));
      const clientsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClients(clientsData);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Error al cargar los clientes.');
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDeleteSelected = () => {
    setDialogOpen(true);
  };

  const confirmDeletion = async () => {
    try {
      const batch = writeBatch(db);
      selectedItems.forEach((id) => batch.delete(doc(db, 'clientes', id)));
      await batch.commit();
      fetchClients();
      setNotification({
        type: 'success',
        title: 'Operación exitosa',
        message: `${selectedItems.size} cliente(s) eliminado(s).`,
      });
    } catch (err) {
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron eliminar los clientes.',
      });
      console.error('Error deleting clients:', err);
    }
  };

  const handleExportSelected = () => {
    const headers = [
      'tipo',
      'nombre',
      'email',
      'telefono',
      'calle',
      'ciudad',
      'departamento',
      'pais',
      'identificacionNumero',
      'sitioWeb',
      'nombreCompania',
      'puestoTrabajo',
    ];

    const selectedData = clients.filter((client) => selectedItems.has(client.id));
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + headers.join(',') + '\n';
    selectedData.forEach((client) => {
      const row = [
        client.tipo || '',
        `"${client.nombre || ''}"`,
        client.email || '',
        client.telefono || '',
        `"${client.direccion?.calle || ''}"`,
        `"${client.direccion?.ciudad || ''}"`,
        `"${client.direccion?.departamento || ''}"`,
        `"${client.direccion?.pais || ''}"`,
        client.identificacionNumero || '',
        client.sitioWeb || '',
        client.nombreCompania || '',
        client.puestoTrabajo || '',
      ];
      csvContent += row.join(',') + '\n';
    });

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'clientes_exportados.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="text-center p-10 text-text-secondary">Cargando...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div>
      <AlertDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmDeletion}
        title="¿Estás completamente seguro?"
        description={`Esta acción no se puede deshacer. Se eliminarán permanentemente ${selectedItems.size} cliente(s) de la base de datos.`}
      />

      {/* --- Encabezado con botones principales --- */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Clientes</h1>

        <div className="flex items-center gap-4">
          {/* Selector de vista */}
          <div className="flex items-center bg-surface rounded-lg p-1 border border-border">
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md ${
                view === 'list'
                  ? 'bg-background text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <ListIcon />
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-md ${
                view === 'kanban'
                  ? 'bg-background text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <KanbanIcon />
            </button>
          </div>

          {/* Botón Importar registros */}
          <Button variant="secondary" onClick={onImportClients}>
            Importar registros
          </Button>

          {/* Botón Nuevo Cliente */}
          <Button onClick={onAddNewClient}>
            <PlusIcon className="mr-2 h-4 w-4" /> Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Barra de selección múltiple */}
      {hasSelection && (
        <SelectionToolbar
          selectionCount={selectedItems.size}
          onDelete={handleDeleteSelected}
          onExport={handleExportSelected}
        />
      )}

      {/* Contenido principal */}
      {clients.length === 0 ? (
        <div className="text-center text-text-secondary py-16">No hay clientes.</div>
      ) : view === 'list' ? (
        <div className="bg-surface rounded-large border border-border">
          <table className="w-full text-sm">
            <thead className="text-xs text-text-secondary uppercase">
              <tr className="border-b border-border">
                <th scope="col" className="p-4 w-4">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={isAllSelected}
                    className="bg-surface border-border rounded focus:ring-primary"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left">Email</th>
                <th scope="col" className="px-6 py-3 text-left">Teléfono</th>
                <th scope="col" className="px-6 py-3 text-left">País</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-white/5">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(client.id)}
                      onChange={() => handleSelect(client.id)}
                      className="bg-surface border-border rounded focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                    <button
                      onClick={() => onEditClient(client.id)}
                      className="hover:text-primary transition-colors"
                    >
                      {client.nombre}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{client.email}</td>
                  <td className="px-6 py-4 text-text-secondary">{client.telefono}</td>
                  <td className="px-6 py-4 text-text-secondary">{client.direccion?.pais}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <CardView
          items={clients}
          onCardClick={onEditClient}
          renderCard={(client) => <ClientCard client={client} />}
        />
      )}
    </div>
  );
};

export default ClientList;
