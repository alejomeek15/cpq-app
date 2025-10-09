import { useState, useCallback, useMemo } from 'react';

/**
 * Hook personalizado para gestionar la lógica de selección de una lista de items.
 * @param {Array} items - La lista completa de items disponibles para seleccionar (ej. clients, quotes).
 * @returns Un objeto con el estado y los manejadores de la selección.
 */
export const useSelection = (items = []) => {
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Función para seleccionar/deseleccionar un único item por su ID
  const handleSelect = useCallback((itemId) => {
    setSelectedItems(prevSelected => {
      const newSelection = new Set(prevSelected);
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        newSelection.add(itemId);
      }
      return newSelection;
    });
  }, []);

  // Función para el checkbox "Seleccionar Todo"
  const handleSelectAll = useCallback((e) => {
    if (e.target.checked) {
      const allItemIds = new Set(items.map(item => item.id));
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems(new Set());
    }
  }, [items]);
  
  // Memoizamos valores derivados para optimizar el rendimiento
  const hasSelection = useMemo(() => selectedItems.size > 0, [selectedItems]);
  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedItems.size === items.length;
  }, [selectedItems, items]);

  return {
    selectedItems,
    handleSelect,
    handleSelectAll,
    hasSelection,
    isAllSelected,
  };
};