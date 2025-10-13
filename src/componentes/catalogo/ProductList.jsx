import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import ProductCard from './ProductCard.jsx';
import { Button } from '@/ui/button.jsx';
import { PlusIcon } from 'lucide-react';

const ProductList = ({ db, onProductClick, onAddNewProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect para escuchar los cambios en Firestore en tiempo real
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'productos_c'), (snapshot) => {
      if (snapshot.empty) {
        setProducts([]);
      } else {
        const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error al obtener productos:", error);
      setLoading(false);
    });

    // Función de limpieza para dejar de escuchar cuando el componente se desmonte
    return () => unsubscribe();
  }, [db]);

  if (loading) {
    return <div className="text-center p-10">Cargando productos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Catálogo de Productos</h1>
        <Button onClick={onAddNewProduct}>
          <PlusIcon className="mr-2 h-4 w-4" /> Crear Producto
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          No se encontraron productos. ¡Crea el primero!
        </div>
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
      )}
    </div>
  );
};

export default ProductList;