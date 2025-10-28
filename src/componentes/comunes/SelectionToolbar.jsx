import React from 'react';
import { Button } from '@/ui/button'; // <-- ¡CAMBIO 1! Importar Button

/**
 * Barra de herramientas que aparece cuando se seleccionan items en una lista.
 * @param {number} selectionCount - El número de items seleccionados.
 * @param {Function} onDelete - La función a ejecutar al hacer clic en Eliminar.
 * @param {Function} onExport - (Opcional) La función a ejecutar al hacer clic en Exportar.
 */
const SelectionToolbar = ({ selectionCount, onDelete, onExport }) => {
  return (
    // --- ¡CAMBIO 2! Refactor del contenedor ---
    // bg-gray-800 -> bg-secondary (o bg-muted si prefieres)
    <div className="flex items-center justify-between bg-secondary p-3 rounded-lg mb-4 animate-fade-in-down">
      
      {/* --- ¡CAMBIO 3! Refactor del texto del contador --- */}
      {/* text-indigo-400 -> text-primary (o text-foreground si quieres que sea más neutro) */}
      <span className="font-bold text-primary">{selectionCount} seleccionado(s)</span>
      
      <div className="flex items-center gap-4">
        {/* --- ¡CAMBIO 4! Refactor del botón Exportar --- */}
        {/* Usamos Button con variant="ghost" */}
        {onExport && (
             <Button variant="ghost" onClick={onExport} className="font-semibold px-2 py-1 h-auto">
               Exportar
             </Button>
        )}
        
        {/* --- ¡CAMBIO 5! Refactor del botón Eliminar --- */}
        {/* Usamos Button con variant="ghost" y color 'destructive' */}
        <Button 
          variant="ghost" 
          onClick={onDelete} 
          className="font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 px-2 py-1 h-auto"
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
};

export default SelectionToolbar;