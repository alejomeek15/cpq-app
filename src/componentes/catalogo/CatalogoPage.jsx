import React, { useState } from 'react';
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

const CatalogoPage = ({ db, navigate }) => {
  const [view, setView] = useState('list'); // 'list', 'simple-form'
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleProductClick = (product) => {
    console.log("Selected Product:", product);
    setSelectedProduct(product);
    // Future: setView('details');
  };

  const handleAddNewProduct = () => {
    setIsTypeSelectorOpen(true);
  };

  const handleTypeSelected = (type) => {
    setIsTypeSelectorOpen(false);
    if (type === 'simple') {
      setView('simple-form');
    }
    // Future: handle 'composite' and 'kit'
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedProduct(null);
  };

  const renderContent = () => {
    switch (view) {
      case 'simple-form':
        // --- ¡CAMBIO CLAVE AQUÍ! ---
        // Añadimos la prop db={db} al componente del formulario.
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