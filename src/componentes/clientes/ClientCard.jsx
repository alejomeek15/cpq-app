import React from 'react';

/**
 * Renderiza la tarjeta específica para un cliente.
 */
const ClientCard = ({ client }) => {
  // Obtiene la primera letra del nombre para el avatar.
  const initial = client.nombre ? client.nombre.charAt(0).toUpperCase() : '?';

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex gap-4 items-center hover:bg-gray-700 transition-colors cursor-pointer h-full">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-2xl font-bold">
        {initial}
      </div>
      <div className="overflow-hidden">
        <h3 className="font-bold text-lg text-white truncate">{client.nombre || 'Sin nombre'}</h3>
        <p className="text-sm text-gray-400 truncate">{client.email || 'Sin email'}</p>
      </div>
    </div>
  );
};

export default ClientCard;