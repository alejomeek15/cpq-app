import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth'; // ¡NUEVO!
import TaxesList from './TaxesList.jsx';
import TaxForm from './TaxForm.jsx';
import AlertDialog from '@/componentes/comunes/AlertDialog.jsx';
import Notification from '@/componentes/comunes/Notification.jsx';

// ¡CAMBIO! Ya NO recibe 'user' como prop
const TaxesModule = ({ db }) => {
  // ¡NUEVO! Obtener user del Context
  const { user } = useAuth();

  const [view, setView] = useState('list');
  const [currentItem, setCurrentItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [taxes, setTaxes] = useState([]);
  const [notification, setNotification] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddNew = () => {
    setCurrentItem(null);
    setView('form');
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setView('form');
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setDialogOpen(true);
  };

  // ¡CAMBIO! confirmDeletion ahora usa la ruta anidada
  const confirmDeletion = async () => {
    // ¡NUEVO! Validar que el usuario esté autenticado
    if (!user || !user.uid) {
      setNotification({
        type: 'error',
        title: 'Error',
        message: 'Error: Usuario no autenticado.'
      });
      setDialogOpen(false);
      return;
    }

    if (itemToDelete) {
      try {
        // ¡CAMBIO! Ruta anidada con user.uid
        await deleteDoc(doc(db, "usuarios", user.uid, "impuestos", itemToDelete));
        setItemToDelete(null);
        setRefreshKey(prevKey => prevKey + 1);
        showListView('Impuesto eliminado correctamente.');
      } catch (error) {
        console.error("Error al eliminar el impuesto:", error);
        setNotification({
          type: 'error',
          title: 'Error',
          message: 'Error al eliminar el impuesto.'
        });
      }
    }
    setDialogOpen(false);
  };

  const showListView = (message = null) => {
    setCurrentItem(null);
    setView('list');
    if (message) {
      setNotification({ type: 'success', title: 'Éxito', message });
    }
  };

  return (
    <div>
      <Notification notification={notification} onDismiss={() => setNotification(null)} />
      {view === 'list' ? (
        <TaxesList
          db={db}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          setTaxes={setTaxes}
          key={refreshKey}
        />
      ) : (
        <TaxForm
          db={db}
          onBack={(saved) => showListView(saved ? 'Impuesto guardado correctamente.' : null)}
          tax={currentItem}
          itemCount={taxes.length}
        />
      )}
      <AlertDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmDeletion}
        title="¿Estás seguro?"
        description="Esta acción no se puede deshacer. El impuesto se eliminará permanentemente."
      />
    </div>
  );
};

export default TaxesModule;