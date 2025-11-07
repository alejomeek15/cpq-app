import React, { useState } from 'react';
import { useAuth } from '@/context/useAuth'; // ¡NUEVO!
import ProductList from './ProductList.jsx';
import ProductTypeSelector from './ProductTypeSelector.jsx';
import SimpleProductForm from './SimpleProductForm.jsx';
import { SidebarTrigger } from '@/ui/sidebar.jsx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/breadcrumb.jsx";
import {
  Dialog,
  DialogContent,
} from "@/ui/dialog.jsx";

// ¡CAMBIO! Ya NO recibe 'user' ni 'auth' como props
const CatalogoPage = ({ db, navigate }) => {
  // ¡NUEVO! Obtener user del Context
  const { user } = useAuth();

  const [view, setView] = useState('list');
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductClick = (product) => {
    console.log("Selected Product:", product);
    setSelectedProduct(product);
  };

  const handleAddNewProduct = () => {
    setIsTypeSelectorOpen(true);
  };

  const handleTypeSelected = (type) => {
    setIsTypeSelectorOpen(false);
    if (type === 'simple') {
      setView('simple-form');
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedProduct(null);
  };

  // ¡NUEVO! Validar que el usuario esté autenticado
  if (!user || !user.uid) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Cargando catálogo...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'simple-form':
        return <SimpleProductForm db={db} onBack={handleBackToList} onSave={handleBackToList} />;

      case 'list':
      default:
        return <ProductList
          db={db}
          onProductClick={handleProductClick}
          onAddNewProduct={handleAddNewProduct}
        />;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <SidebarTrigger />
        <div className="mt-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('dashboard')} className="cursor-pointer">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Catálogo</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {renderContent()}

      <Dialog open={isTypeSelectorOpen} onOpenChange={setIsTypeSelectorOpen}>
        <DialogContent>
          <ProductTypeSelector onSelectType={handleTypeSelected} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CatalogoPage;