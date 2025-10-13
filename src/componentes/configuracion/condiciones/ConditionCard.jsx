import React from 'react';
import { Badge } from '@/ui/badge.jsx';

const ConditionCard = ({ condition }) => {
  return (
    // 1. Aplicamos la misma estructura flex que en TaxCard
    <div 
      className="relative bg-slate-800 p-4 rounded-lg border border-slate-700 h-full flex flex-col justify-center cursor-pointer transition-colors hover:bg-slate-700"
    >
      <Badge 
        variant={condition.activo ? "default" : "secondary"}
        className="absolute top-2 right-2"
      >
        {condition.activo ? 'Activo' : 'Inactivo'}
      </Badge>

      {/* 2. Usamos los mismos estilos para el título que en TaxCard */}
      <h3 className="text-center font-semibold text-white mb-1 truncate">
        {condition.nombre}
      </h3>
      
      {/* 3. ¡EL TRUCO CLAVE! Añadimos un párrafo invisible que ocupa el mismo espacio que la descripción en TaxCard. */}
      <p className="text-center text-sm text-slate-400">
        &nbsp;
      </p>
    </div>
  );
};

export default ConditionCard;