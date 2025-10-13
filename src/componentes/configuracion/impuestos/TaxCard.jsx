import React from 'react';

const TaxCard = ({ tax }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 h-full flex flex-col justify-center cursor-pointer transition-colors hover:bg-slate-700">
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