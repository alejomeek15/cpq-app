import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import ConditionsList from './ConditionsList.jsx';
import ConditionForm from './ConditionForm.jsx';
import AlertDialog from '@/componentes/comunes/AlertDialog.jsx';
import Notification from '@/componentes/comunes/Notification.jsx';

const ConditionsModule = ({ db }) => {
  const [view, setView] = useState('list');
  const [currentItem, setCurrentItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [notification, setNotification] = useState(null);

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

  const confirmDeletion = async () => {
    if (itemToDelete) {
      await deleteDoc(doc(db, "condicionesPago", itemToDelete));
      setItemToDelete(null);
      showListView('Condición de pago eliminada correctamente.');
    }
    setDialogOpen(false);
  };

  const showListView = (message = null) => {
    setCurrentItem(null);
    setView('list-refresh');
    setTimeout(() => setView('list'), 0);

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

      {view === 'list' || view === 'list-refresh' ? (
        <ConditionsList
          db={db}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          key={view}
          setConditions={setConditions}
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