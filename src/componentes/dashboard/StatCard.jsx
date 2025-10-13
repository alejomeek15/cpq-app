import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card.jsx";

const StatCard = ({ title, value, icon, description }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {/* Renderizamos el ícono que nos pasen */}
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-slate-400">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;