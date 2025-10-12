import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, writeBatch, doc, query, orderBy } from 'firebase/firestore';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/ui/button.jsx';
import { Table, TableBody, TableHeader, TableRow, TableHead } from '@/ui/table.jsx';
import { DraggableTableRow } from './DraggableTableRow.jsx';
import { createColumns } from './columns.jsx';

const ConditionsList = ({ db, onAddNew, onEdit, onDelete, setConditions }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = React.useMemo(() => createColumns(onEdit, onDelete), [onEdit, onDelete]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

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
        <Button onClick={onAddNew}>+ Nueva condición</Button>
      </div>

      <div className="rounded-md border border-slate-700">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-slate-800/50">
                {columns.map((column) => (
                  <TableHead key={column.id}>
                    {/* --- ¡CAMBIO CLAVE AQUÍ! --- */}
                    {/* Verificamos si 'header' es una función antes de llamarla. */}
                    {typeof column.header === 'function'
                      ? column.header()
                      : column.header}
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
    </div>
  );
};

export default ConditionsList;