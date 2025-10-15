import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import ProductCard from './ProductCard.jsx';
import { Button } from '@/ui/button.jsx';
import { PlusIcon } from 'lucide-react';

// --- ¡NUEVAS IMPORTACIONES! ---
import { DataTable } from '@/ui/DataTable.jsx';
import { createColumns } from './columns.jsx';

// --- Iconos para el selector de vista ---
const ListIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>;
const KanbanIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;

const ProductList = ({ db, onProductClick, onAddNewProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban'); // <-- Cambiamos la vista por defecto a 'kanban'

  // Instanciamos las columnas para la DataTable
  const columns = React.useMemo(() => createColumns(onProductClick), [onProductClick]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'productos_c'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error al obtener productos:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  if (loading) {
    return <div className="text-center p-10">Cargando productos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Catálogo de Productos</h1>
        <div className="flex items-center gap-4">
          {/* Selector de vista */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button onClick={() => setView('list')} className={`p-1.5 rounded-md ${view === 'list' ? 'bg-slate-700' : 'text-slate-400 hover:text-white'}`}><ListIcon /></button>
            <button onClick={() => setView('kanban')} className={`p-1.5 rounded-md ${view === 'kanban' ? 'bg-slate-700' : 'text-slate-400 hover:text-white'}`}><KanbanIcon /></button>
          </div>
          <Button onClick={onAddNewProduct}>
            <PlusIcon className="mr-2 h-4 w-4" /> Crear Producto
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          No se encontraron productos. ¡Crea el primero!
        </div>
      ) : (
        // Renderizado condicional
        view === 'list' ? (
          <DataTable 
            columns={columns} 
            data={products}
            filterColumn="name" // Habilitamos el filtro por nombre
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => onProductClick(product)} 
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default ProductList;