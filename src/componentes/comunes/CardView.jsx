import React from 'react';

/**
 * Un componente genérico que renderiza un array de items en una cuadrícula de tarjetas.
 * No sabe cómo es una tarjeta, solo cómo ordenarlas en una cuadrícula.
 *
 * @param {Array} items - El array de datos a mostrar.
 * @param {Function} renderCard - La función que recibe un item y devuelve el JSX para la tarjeta específica.
 * @param {Function} onCardClick - (Opcional) Función que se ejecuta al hacer clic en una tarjeta.
 */
const CardView = ({ items, renderCard, onCardClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        // La lógica de renderizado de la tarjeta se delega completamente al prop `renderCard`
        <div key={item.id} onClick={() => onCardClick && onCardClick(item.id)}>
             {renderCard(item)}
        </div>
      ))}
    </div>
  );
};

export default CardView;