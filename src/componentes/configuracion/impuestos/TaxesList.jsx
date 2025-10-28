import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, writeBatch, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/ui/button.jsx';
import { Table, TableBody, TableHeader, TableRow, TableHead } from '@/ui/table.jsx';
// DraggableTableRow and columns need refactoring later
import { DraggableTableRow } from '../condiciones/DraggableTableRow.jsx'; // Assuming this is reusable, otherwise needs its own
import { createColumns } from './columns.jsx';
import CardView from '@/componentes/comunes/CardView.jsx'; // Already refactored
import TaxCard from './TaxCard.jsx'; // Needs refactoring later

// Icons (Ensure they have fixed size like w-5 h-5)
const ListIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>;
const KanbanIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;

const TaxesList = ({ db, onAddNew, onEdit, onDelete, setTaxes }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');

  // handleToggleActive logic (no changes needed)
  const handleToggleActive = useCallback(async (id, newStatus) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, activo: newStatus } : item
      )
    );
    try {
      const docRef = doc(db, "impuestos", id);
      await updateDoc(docRef, { activo: newStatus });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      fetchData(); // Reload to ensure consistency on error
    }
  }, [db]); // Added fetchData dependency below

  // columns definition (depends on columns.jsx)
  const columns = React.useMemo(() => createColumns(onEdit, onDelete, handleToggleActive), [onEdit, onDelete, handleToggleActive]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // fetchData logic (no changes needed)
  const fetchData = useCallback(async () => {
    setLoading(true);
    const q = query(collection(db, "impuestos"), orderBy("posicion"));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setItems(data);
    if (setTaxes) setTaxes(data); // Pass data up if prop exists
    setLoading(false);
  }, [db, setTaxes]); // Added setTaxes dependency

  // Add fetchData to handleToggleActive dependencies
  useEffect(() => {
     handleToggleActive.__proto__.fetchData = fetchData
  }, [fetchData, handleToggleActive])


  useEffect(() => { fetchData(); }, [fetchData]);

  // handleDragEnd logic (no changes needed)
  async function handleDragEnd(event) {
     const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const reorderedItems = arrayMove(items, oldIndex, newIndex);

      setItems(reorderedItems); // Update local state optimistically

      // Update positions in Firestore
      try {
        const batch = writeBatch(db);
        reorderedItems.forEach((item, index) => {
          const docRef = doc(db, "impuestos", item.id);
          batch.update(docRef, { posicion: index });
        });
        await batch.commit();
      } catch (error) {
        console.error("Error updating positions:", error);
        fetchData(); // Revert UI if Firestore update fails
      }
    }
  }

  // --- FIX 1: Add text-muted-foreground to loading message ---
  if (loading) return <p className="text-center text-muted-foreground">Cargando impuestos...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        {/* --- FIX 2: Add text-foreground to title --- */}
        <h2 className="text-xl font-bold text-foreground">Impuestos</h2>
        <div className="flex items-center gap-4">
            {/* --- FIX 3: Refactor view switcher --- */}
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
            {/* Add button uses default variant (OK) */}
            <Button onClick={onAddNew}>+ Nuevo impuesto</Button>
        </div>
      </div>

      {view === 'list' ? (
        // --- FIX 4: Refactor table container border ---
        <div className="rounded-md border">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                 {/* --- FIX 5: Refactor table header row --- */}
                <TableRow className="border-b hover:bg-muted/50">
                  {columns.map((column) => <TableHead key={column.id}>{typeof column.header === 'function' ? column.header() : column.header}</TableHead>)}
                </TableRow>
              </TableHeader>
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <TableBody>
                  {items.map(item => (
                    // DraggableTableRow should be theme-aware (assuming it uses base TableRow)
                    <DraggableTableRow key={item.id} rowId={item.id}>
                      {columns.map(column => <React.Fragment key={column.id}>{column.cell({ row: { original: item } })}</React.Fragment>)}
                    </DraggableTableRow>
                  ))}
                </TableBody>
              </SortableContext>
            </Table>
          </DndContext>
        </div>
      ) : (
        // CardView is already refactored
        <CardView
          items={items}
          onCardClick={(id) => { // Updated to pass ID
              const itemToEdit = items.find(item => item.id === id);
              if (itemToEdit) onEdit(itemToEdit);
            }
          }
          renderCard={(item) => <TaxCard tax={item} />} // TaxCard needs refactoring
        />
      )}
    </div>
  );
};

export default TaxesList;