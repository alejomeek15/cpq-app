import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, writeBatch, doc, query, orderBy, updateDoc } from 'firebase/firestore'; // <-- Importa updateDoc
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/ui/button.jsx';
import { Table, TableBody, TableHeader, TableRow, TableHead } from '@/ui/table.jsx';
import { DraggableTableRow } from './DraggableTableRow.jsx';
import { createColumns } from './columns.jsx';
import CardView from '@/componentes/comunes/CardView.jsx';
import ConditionCard from './ConditionCard.jsx';

const ListIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>;
const KanbanIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;

const ConditionsList = ({ db, onAddNew, onEdit, onDelete, setConditions }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');

  // --- ¡NUEVA FUNCIÓN! ---
  // Se ejecuta cuando el usuario hace clic en un Switch.
  const handleToggleActive = useCallback(async (id, newStatus) => {
    // 1. Actualización optimista: Cambia el estado en la UI inmediatamente.
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, activo: newStatus } : item
      )
    );
    // 2. Guarda el cambio en Firestore en segundo plano.
    try {
      const docRef = doc(db, "condicionesPago", id);
      await updateDoc(docRef, { activo: newStatus });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      // Opcional: Revertir el cambio en la UI si Firestore falla.
      fetchData(); // Recargamos para asegurar consistencia
    }
  }, [db]); // Depende de 'db' para poder escribir en la base de datos

  // Pasamos la nueva función a las columnas
  const columns = React.useMemo(() => createColumns(onEdit, onDelete, handleToggleActive), [onEdit, onDelete, handleToggleActive]);
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    const q = query(collection(db, "condicionesPago"), orderBy("posicion"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setItems(data);
    setConditions(data); 
    setLoading(false);
  }, [db, setConditions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const reorderedItems = arrayMove(items, oldIndex, newIndex);
      
      setItems(reorderedItems);

      const batch = writeBatch(db);
      reorderedItems.forEach((item, index) => {
        const docRef = doc(db, "condicionesPago", item.id);
        batch.update(docRef, { posicion: index });
      });
      await batch.commit();
    }
  }

  if (loading) return <p>Cargando condiciones...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Condiciones de Pago</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-slate-700' : 'text-slate-400 hover:text-white'}`}><ListIcon /></button>
            <button onClick={() => setView('kanban')} className={`p-1.5 rounded-md ${view === 'kanban' ? 'bg-slate-700' : 'text-slate-400 hover:text-white'}`}><KanbanIcon /></button>
          </div>
          <Button onClick={onAddNew}>+ Nueva condición</Button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="rounded-md border border-slate-700">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-800/50">
                  {columns.map((column) => (
                    <TableHead key={column.id}>
                      {typeof column.header === 'function' ? column.header() : column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <TableBody>
                  {items.map(item => (
                    <DraggableTableRow key={item.id} rowId={item.id}>
                      {columns.map(column => (
                         <React.Fragment key={column.id}>
                            {column.cell({ row: { original: item } })}
                         </React.Fragment>
                      ))}
                    </DraggableTableRow>
                  ))}
                </TableBody>
              </SortableContext>
            </Table>
          </DndContext>
        </div>
      ) : (
        <CardView
          items={items}
          onCardClick={(item) => onEdit(item)}
          renderCard={(item) => <ConditionCard condition={item} />}
        />
      )}
    </div>
  );
};

export default ConditionsList;