import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react'; // Icons are fine

const ClientCard = ({ client }) => {
  return (
    // --- FIX 1: Refactor container styles ---
    <div className="bg-card p-4 rounded-lg border h-full flex flex-col cursor-pointer transition-colors hover:bg-accent">
      
      <div className="flex-grow">
        {/* --- FIX 2: Refactor title color --- */}
        <h3 className="font-bold text-card-foreground truncate mb-3">{client.nombre}</h3>

        {/* --- FIX 3: Refactor detail text color --- */}
        <div className="space-y-2 text-sm text-muted-foreground">
          {/* Email */}
          {client.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} className="flex-shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}

          {/* Phone */}
          {client.telefono && (
            <div className="flex items-center gap-2">
              <Phone size={14} className="flex-shrink-0" />
              <span>{client.telefono}</span>
            </div>
          )}

          {/* City */}
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