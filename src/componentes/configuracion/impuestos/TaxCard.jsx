import React from 'react';
import { Badge } from '@/ui/badge.jsx'; // Uses variants, OK

const TaxCard = ({ tax }) => {
  return (
    // --- FIX 1: Refactor container styles ---
    <div className="relative bg-card p-4 rounded-lg border h-full flex flex-col justify-center cursor-pointer transition-colors hover:bg-accent">

      {/* Badge uses variants, should adapt automatically */}
      <Badge
        variant={tax.activo ? "default" : "secondary"}
        className="absolute top-2 right-2"
      >
        {tax.activo ? 'Activo' : 'Inactivo'}
      </Badge>

      {/* --- FIX 2: Refactor title color --- */}
      <h3 className="text-center font-semibold text-card-foreground mb-1 truncate">
        {tax.nombre}
      </h3>
      {/* --- FIX 3: Refactor description color --- */}
      <p className="text-center text-sm text-muted-foreground line-clamp-2">
        {tax.descripcion}
      </p>
    </div>
  );
};

export default TaxCard;