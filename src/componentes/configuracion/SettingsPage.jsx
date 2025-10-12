import React, { useState } from 'react';
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import ConditionsList from './ConditionsList.jsx';
import ConditionForm from './ConditionForm.jsx';
import AlertDialog from '@/componentes/comunes/AlertDialog.jsx';

const SettingsPage = ({ db }) => {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [currentItem, setCurrentItem] = useState(null); // The item being edited
  const [itemToDelete, setItemToDelete] = useState(null); // The ID of the item to delete
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [conditions, setConditions] = useState([]); // State to hold the conditions

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
      // Trigger a re-fetch in ConditionsList by changing the view back
      setView('list-refresh'); // A temporary state to force re-render
      setTimeout(() => setView('list'), 0);
    }
    setDialogOpen(false);
  };

  const showListView = () => {
    setCurrentItem(null);
    setView('list-refresh');
    setTimeout(() => setView('list'), 0);
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-8">Configuración</h1>

      {view === 'list' || view === 'list-refresh' ? (
        <ConditionsList
          db={db}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          key={view} // Using key to force re-mount on 'list-refresh'
          setConditions={setConditions} // Pass setter to update parent state
        />
      ) : (
        <ConditionForm
          db={db}
          onBack={showListView}
          condition={currentItem}
          itemCount={conditions.length} // Pass the total item count for positioning
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

export default SettingsPage;