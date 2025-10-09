import React from 'react';

/**
 * Barra de herramientas que aparece cuando se seleccionan items en una lista.
 * @param {number} selectionCount - El número de items seleccionados.
 * @param {Function} onDelete - La función a ejecutar al hacer clic en Eliminar.
 * @param {Function} onExport - La función a ejecutar al hacer clic en Exportar.
 */
const SelectionToolbar = ({ selectionCount, onDelete, onExport }) => {
  return (
    <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg mb-4 animate-fade-in-down">
      <span className="font-bold text-indigo-400">{selectionCount} seleccionado(s)</span>
      <div className="flex items-center gap-4">
        {onExport && (
             <button onClick={onExport} className="font-semibold text-gray-300 hover:text-white">Exportar</button>
        )}
        <button onClick={onDelete} className="font-semibold text-red-400 hover:text-red-300">Eliminar</button>
      </div>
    </div>
  );
};

export default SelectionToolbar;