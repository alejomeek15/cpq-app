import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react'; // Importamos los íconos

const ClientCard = ({ client }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 h-full flex flex-col cursor-pointer transition-colors hover:bg-slate-700">
      {/* Sección principal con el nombre */}
      <div className="flex-grow">
        <h3 className="font-bold text-white truncate mb-3">{client.nombre}</h3>
        
        {/* Sección de detalles con íconos */}
        <div className="space-y-2 text-sm text-slate-400">
          {/* Email */}
          {client.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} className="flex-shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}

          {/* Teléfono */}
          {client.telefono && (
            <div className="flex items-center gap-2">
              <Phone size={14} className="flex-shrink-0" />
              <span>{client.telefono}</span>
            </div>
          )}

          {/* Ciudad */}
          {client.direccion?.ciudad && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="flex-shrink-0" />
              <span>{client.direccion.ciudad}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientCard;