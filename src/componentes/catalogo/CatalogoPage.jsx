import React, { useState, useCallback, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import CatalogoList from './CatalogoList';
import ProductoForm from './ProductoForm';

// Componente principal que controla el módulo de Catálogo
const CatalogoPage = ({ db, navigate }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    // 'editingProduct' será null para crear, o un objeto de producto para editar
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "productos"));
            setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error al cargar productos:", error);
        } finally {
            setLoading(false);
        }
    }, [db]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleOpenForm = (product = null) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
        fetchProducts(); // Recargar productos después de guardar/cerrar
    };

    return (
        <div>
            <CatalogoList
                products={products}
                loading={loading}
                navigate={navigate}
                onAddProduct={() => handleOpenForm(null)}
                onEditProduct={handleOpenForm}
            />
            {isFormOpen && (
                <ProductoForm
                    db={db}
                    product={editingProduct}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    );
};

export default CatalogoPage;

