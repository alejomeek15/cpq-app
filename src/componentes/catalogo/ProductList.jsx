import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth'; // ¡NUEVO!
import ProductCard from './ProductCard.jsx';
import { Button } from '@/ui/button.jsx';
import { PlusIcon } from 'lucide-react';

import { DataTable } from '@/ui/DataTable.jsx';
import { createColumns } from './columns.jsx';

// --- Iconos para el selector de vista ---
const ListIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>;
const KanbanIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;

// ¡CAMBIO! Ya NO recibe 'user' como prop
const ProductList = ({ db, onProductClick, onAddNewProduct }) => {
  // ¡NUEVO! Obtener user del Context
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('kanban');

  const columns = React.useMemo(() => createColumns(onProductClick), [onProductClick]);

  // ¡CAMBIO! useEffect ahora obtiene productos DEL USUARIO
  useEffect(() => {
    // ¡NUEVO! Validar que el usuario esté autenticado
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // ¡CAMBIO! Ruta anidada con user.uid
      const unsubscribe = onSnapshot(
        collection(db, 'usuarios', user.uid, 'productos'),
        (snapshot) => {
          const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setProducts(productsData);
          setLoading(false);
        },
        (err) => {
          console.error("Error al obtener productos:", err);
          setError("Error al cargar los productos.");
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up listener:", err);
      setError("Error al cargar los productos.");
      setLoading(false);
    }
  }, [db, user]); // ¡CAMBIO! Añadir 'user' a las dependencias

  if (loading) {
    return <div className="text-center p-10 text-muted-foreground">Cargando productos...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-destructive">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Catálogo de Productos</h1>
        <div className="flex items-center gap-4">
          {/* Selector de vista */}
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
          <Button onClick={onAddNewProduct}>
            <PlusIcon className="mr-2 h-4 w-4" /> Crear Producto
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No se encontraron productos. ¡Crea el primero!
        </div>
      ) : (
        view === 'list' ? (
          <DataTable
            columns={columns}
            data={products}
            filterColumn="nombre"
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