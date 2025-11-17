import React, { useState } from 'react';
import { useAuth } from '@/context/useAuth';
import ProductList from './ProductList.jsx';
import ProductTypeSelector from './ProductTypeSelector.jsx';
import SimpleProductForm from './SimpleProductForm.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog.jsx";

const CatalogoPage = ({ db, navigate }) => {
  const { user } = useAuth();

  const [view, setView] = useState('list');
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductClick = (product) => {
    console.log("Selected Product:", product);
    setSelectedProduct(product);
    // Aquí podrías abrir un modal o navegar a vista de detalles
    setView('edit');
  };

  const handleAddNewProduct = () => {
    setSelectedProduct(null); // Limpiar producto seleccionado
    setIsTypeSelectorOpen(true);
  };

  const handleTypeSelected = (type) => {
    setIsTypeSelectorOpen(false);
    if (type === 'simple') {
      setView('simple-form');
    }
    // Aquí agregar lógica para otros tipos
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedProduct(null);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    // Determinar el tipo de formulario según el tipo de producto
    if (product.tipo === 'simple' || !product.tipo) {
      setView('simple-form');
    }
    // Aquí agregar para composite y kit cuando los implementes
  };

  // Validar autenticación
  if (!user?.uid) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'simple-form':
        return (
          <SimpleProductForm 
            db={db} 
            product={selectedProduct} // Pasar producto si es edición
            onBack={handleBackToList} 
            onSave={handleBackToList} 
          />
        );

      case 'list':
      default:
        return (
          <ProductList
            db={db}
            onProductClick={handleProductClick}
            onEditProduct={handleEditProduct}
            onAddNewProduct={handleAddNewProduct}
          />
        );
    }
  };

  return (
    <div className="w-full">
      {renderContent()}

      {/* Dialog para selector de tipo */}
      <Dialog open={isTypeSelectorOpen} onOpenChange={setIsTypeSelectorOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Producto</DialogTitle>
          </DialogHeader>
          <ProductTypeSelector onSelectType={handleTypeSelected} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CatalogoPage;