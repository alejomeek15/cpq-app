import React from 'react';
import { Badge } from '@/ui/badge.jsx'; // Uses variants, OK

const ConditionCard = ({ condition }) => {
  return (
    // --- FIX 1: Refactor container styles ---
    <div
      className="relative bg-card p-4 rounded-lg border h-full flex flex-col justify-center cursor-pointer transition-colors hover:bg-accent"
    >
      {/* Badge uses variants, should adapt automatically */}
      <Badge
        variant={condition.activo ? "default" : "secondary"}
        className="absolute top-2 right-2"
      >
        {condition.activo ? 'Activo' : 'Inactivo'}
      </Badge>

      {/* --- FIX 2: Refactor title color --- */}
      <h3 className="text-center font-semibold text-card-foreground mb-1 truncate">
        {condition.nombre}
      </h3>

      {/* --- FIX 3: Refactor placeholder text color (although it's invisible) --- */}
      {/* Keeping the structure, but using muted-foreground */}
      <p className="text-center text-sm text-muted-foreground">
        &nbsp; {/* Invisible space */}
      </p>
    </div>
  );
};

export default ConditionCard;