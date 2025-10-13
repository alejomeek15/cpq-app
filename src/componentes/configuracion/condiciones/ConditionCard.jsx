import React from 'react';

const ConditionCard = ({ condition }) => {
  return (
    // --- ¡CAMBIO AQUÍ! ---
    // Añadimos 'cursor-pointer' para que el mouse cambie a una manito.
    // También añadimos un sutil efecto de transición para mejorar la respuesta visual.
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 h-full flex items-center justify-center cursor-pointer transition-colors hover:bg-slate-700">
      <h3 className="text-center font-medium text-white break-words">
        {condition.nombre}
      </h3>
    </div>
  );
};

export default ConditionCard;