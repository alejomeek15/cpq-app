import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import TaxesList from './TaxesList.jsx';
import TaxForm from './TaxForm.jsx';
import AlertDialog from '@/componentes/comunes/AlertDialog.jsx';
import Notification from '@/componentes/comunes/Notification.jsx';

const TaxesModule = ({ db }) => {
  const [view, setView] = useState('list');
  const [currentItem, setCurrentItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [taxes, setTaxes] = useState([]);
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
      await deleteDoc(doc(db, "impuestos", itemToDelete));
      setItemToDelete(null);
      showListView('Impuesto eliminado correctamente.');
    }
    setDialogOpen(false);
  };

  const showListView = (message = null) => {
    setCurrentItem(null);
    setView('list-refresh');
    setTimeout(() => setView('list'), 0);
    if (message) {
      setNotification({ type: 'success', title: 'Éxito', message });
    }
  };

  return (
    <div>
      <Notification notification={notification} onDismiss={() => setNotification(null)} />
      {view === 'list' || view === 'list-refresh' ? (
        <TaxesList
          db={db}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          key={view}
          setTaxes={setTaxes}
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