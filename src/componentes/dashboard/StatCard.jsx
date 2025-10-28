import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.jsx";

const StatCard = ({ title, value, icon, description }) => {
  return (
    // El componente <Card> de tu UI ya debería ser theme-aware
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {/* CardTitle de tu UI ya debería ser theme-aware */}
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {/* El icono se pasa como prop, no necesita cambios aquí */}
        {icon}
      </CardHeader>
      <CardContent>
        {/* El texto del valor no tiene color fijo, usará el 'foreground' por defecto */}
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          // --- ¡CAMBIO AQUÍ! ---
          // Reemplazamos 'text-slate-400' por 'text-muted-foreground'
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;