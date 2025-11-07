import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth'; // ¡NUEVO!
import ConditionsList from './ConditionsList.jsx';
import ConditionForm from './ConditionForm.jsx';
import AlertDialog from '@/componentes/comunes/AlertDialog.jsx';
import Notification from '@/componentes/comunes/Notification.jsx';

// ¡CAMBIO! Ya NO recibe 'user' como prop
const ConditionsModule = ({ db }) => {
  // ¡NUEVO! Obtener user del Context
  const { user } = useAuth();

  const [view, setView] = useState('list');
  const [currentItem, setCurrentItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [conditions, setConditions] = useState([]);
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
        await deleteDoc(doc(db, "usuarios", user.uid, "condicionesPago", itemToDelete));
        setItemToDelete(null);
        setRefreshKey(prevKey => prevKey + 1);
        showListView('Condición de pago eliminada correctamente.');
      } catch (error) {
        console.error("Error al eliminar la condición:", error);
        setNotification({
          type: 'error',
          title: 'Error',
          message: 'Error al eliminar la condición de pago.'
        });
      }
    }
    setDialogOpen(false);
  };

  const showListView = (message = null) => {
    setCurrentItem(null);
    setView('list');

    if (message) {
      setNotification({
        type: 'success',
        title: 'Éxito',
        message: message
      });
    }
  };

  return (
    <div>
      <Notification notification={notification} onDismiss={() => setNotification(null)} />

      {view === 'list' ? (
        <ConditionsList
          db={db}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          setConditions={setConditions}
          key={refreshKey}
        />
      ) : (
        <ConditionForm
          db={db}
          onBack={(saved) => showListView(saved ? 'Condición de pago guardada correctamente.' : null)}
          condition={currentItem}
          itemCount={conditions.length}
        />
      )}

      <AlertDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmDeletion}
        title="¿Estás seguro?"
        description="Esta acción no se puede deshacer. La condición de pago se eliminará permanentemente."
      />
    </div>
  );
};

export default ConditionsModule;