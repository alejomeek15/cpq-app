import React from 'react';
import { Badge } from '@/ui/badge.jsx'; // <-- 1. Importamos el componente Badge

const TaxCard = ({ tax }) => {
  return (
    // 2. Añadimos 'relative' para posicionar el badge
    <div className="relative bg-slate-800 p-4 rounded-lg border border-slate-700 h-full flex flex-col justify-center cursor-pointer transition-colors hover:bg-slate-700">
      
      {/* 3. Añadimos el Badge de estado */}
      <Badge 
        variant={tax.activo ? "default" : "secondary"}
        className="absolute top-2 right-2"
      >
        {tax.activo ? 'Activo' : 'Inactivo'}
      </Badge>

      <h3 className="text-center font-semibold text-white mb-1 truncate">
        {tax.nombre}
      </h3>
      <p className="text-center text-sm text-slate-400 line-clamp-2">
        {tax.descripcion}
      </p>
    </div>
  );
};

export default TaxCard;