import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/ui/card.jsx';

// Icons for each product type
const SimpleIcon = () => <span>📦</span>;
const CompositeIcon = () => <span>⚙️</span>;
const KitIcon = () => <span>🎁</span>;

const ProductTypeSelector = ({ onSelectType }) => {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Selecciona el tipo de producto</h2>
        <p className="text-slate-400">Elige el tipo de producto que deseas crear.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card for Simple Product */}
        <Card 
          className="text-center cursor-pointer transition-all hover:border-indigo-500 hover:shadow-lg"
          onClick={() => onSelectType('simple')}
        >
          <CardHeader>
            <div className="text-4xl mb-2"><SimpleIcon /></div>
            <CardTitle>Producto Simple</CardTitle>
            <CardDescription>Un artículo individual estándar.</CardDescription>
          </CardHeader>
        </Card>

        {/* Card for Composite Product (Disabled for now) */}
        <Card className="text-center opacity-50 cursor-not-allowed">
          <CardHeader>
            <div className="text-4xl mb-2"><CompositeIcon /></div>
            <CardTitle>Producto Compuesto</CardTitle>
            <CardDescription>Fabricado a partir de insumos (BOM).</CardDescription>
          </CardHeader>
        </Card>

        {/* Card for Kit Product (Disabled for now) */}
        <Card className="text-center opacity-50 cursor-not-allowed">
          <CardHeader>
            <div className="text-4xl mb-2"><KitIcon /></div>
            <CardTitle>Kit de Productos</CardTitle>
            <CardDescription>Un paquete de varios productos simples.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default ProductTypeSelector;