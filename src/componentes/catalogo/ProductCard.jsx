import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Badge } from '@/ui/badge.jsx';

// Componente para mostrar un solo producto en la cuadrícula del catálogo
const ProductCard = ({ product, onClick }) => {
  // Mapea el tipo de producto a una variante de color del Badge
  const getBadgeVariant = (type) => {
    switch (type) {
      case 'simple': return 'default'; // Color primario
      case 'composite': return 'secondary'; // Color secundario (gris)
      case 'kit': return 'outline'; // Con borde
      default: return 'secondary';
    }
  };

  // Formateador para el precio
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <Card 
      className="flex flex-col h-full cursor-pointer transition-all hover:border-indigo-500/50 hover:shadow-lg"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative">
          <img 
            className="h-56 w-full object-cover rounded-t-lg" 
            src={product.imageUrl || 'https://placehold.co/600x400/1e293b/94a3b8?text=Producto'} 
            alt={product.name} 
          />
          <Badge 
            variant={getBadgeVariant(product.type)}
            className="absolute top-3 right-3 capitalize"
          >
            {product.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <h2 className="text-lg font-bold truncate" title={product.name}>
          {product.name}
        </h2>
        <p className="text-sm text-slate-400 mt-1 h-20 overflow-hidden line-clamp-4">
          {product.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <span className="text-2xl font-bold text-indigo-400">
          {formatCurrency(product.price)}
        </span>
        <span className="text-sm font-semibold text-indigo-400">
          Ver detalles
        </span>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;