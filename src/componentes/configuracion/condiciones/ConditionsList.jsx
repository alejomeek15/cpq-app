import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, writeBatch, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth'; // ¡NUEVO!
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/ui/button.jsx';
import { Table, TableBody, TableHeader, TableRow, TableHead } from '@/ui/table.jsx';
import { DraggableTableRow } from './DraggableTableRow.jsx';
import { createColumns } from './columns.jsx';
import CardView from '@/componentes/comunes/CardView.jsx';
import ConditionCard from './ConditionCard.jsx';

// --- Icons (sin cambios) ---
const ListIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>;
const KanbanIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;

// ¡CAMBIO! Ya NO recibe 'user' como prop
const ConditionsList = ({ db, onAddNew, onEdit, onDelete, setConditions }) => {
  // ¡NUEVO! Obtener user del Context
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');

  // handleToggleActive logic
  const handleToggleActive = useCallback(async (id, newStatus) => {
    // ¡NUEVO! Validar que el usuario esté autenticado
    if (!user || !user.uid) {
      console.error('Error: Usuario no autenticado.');
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, activo: newStatus } : item
      )
    );
    try {
      // ¡CAMBIO! Ruta anidada con user.uid
      const docRef = doc(db, "usuarios", user.uid, "condicionesPago", id);
      await updateDoc(docRef, { activo: newStatus });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      fetchData();
    }
  }, [db, user]); // ¡CAMBIO! Añadir 'user' a las dependencias

  const columns = React.useMemo(() => createColumns(onEdit, onDelete, handleToggleActive), [onEdit, onDelete, handleToggleActive]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // ¡CAMBIO! fetchData ahora obtiene datos DEL USUARIO
  const fetchData = useCallback(async () => {
    // ¡NUEVO! Validar que el usuario esté autenticado
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // ¡CAMBIO! Ruta anidada con user.uid
      const q = query(
        collection(db, "usuarios", user.uid, "condicionesPago"),
        orderBy("posicion")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
      if (setConditions) setConditions(data);
    } catch (error) {
      console.error("Error fetching conditions:", error);
    } finally {
      setLoading(false);
    }
  }, [db, user, setConditions]); // ¡CAMBIO! Añadir 'user' a las dependencias

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ¡CAMBIO! handleDragEnd ahora actualiza en la ruta anidada
  async function handleDragEnd(event) {
    // ¡NUEVO! Validar que el usuario esté autenticado
    if (!user || !user.uid) {
      console.error('Error: Usuario no autenticado.');
      return;
    }

    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const reorderedItems = arrayMove(items, oldIndex, newIndex);

      setItems(reorderedItems);

      try {
        const batch = writeBatch(db);
        reorderedItems.forEach((item, index) => {
          // ¡CAMBIO! Ruta anidada con user.uid
          const docRef = doc(db, "usuarios", user.uid, "condicionesPago", item.id);
          batch.update(docRef, { posicion: index });
        });
        await batch.commit();
      } catch (error) {
        console.error("Error updating positions:", error);
        fetchData();
      }
    }
  }

  if (loading) return <p className="text-center text-muted-foreground">Cargando condiciones...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">Condiciones de Pago</h2>
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
          <Button onClick={onAddNew}>+ Nueva condición</Button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="rounded-md border">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow className="border-b hover:bg-muted/50">
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
          onCardClick={(id) => {
            const itemToEdit = items.find(item => item.id === id);
            if (itemToEdit) onEdit(itemToEdit);
          }}
          renderCard={(item) => <ConditionCard condition={item} />}
        />
      )}
    </div>
  );
};

export default ConditionsList;