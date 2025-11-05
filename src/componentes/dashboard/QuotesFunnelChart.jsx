import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LabelList, 
  CartesianGrid 
} from 'recharts';
import { useTheme } from '@/ui/theme-provider';

// --- ¡CAMBIO AQUÍ! Función de color actualizada ---
// Asigna un color único a cada estado usando las variables del tema
const getFillColor = (name) => {
  switch (name) {
    // Colores de estado fijos para éxito y fallo
    case 'Aprobada':
      return 'hsl(142 76% 36%)'; // Verde
    case 'Rechazada':
      return 'hsl(var(--destructive))'; // Rojo
    
    // Colores de gráfico del tema para el embudo
    case 'En negociación':
      return 'hsl(var(--chart-1))'; // ej. Púrpura/Azul
    case 'Enviada':
      return 'hsl(var(--chart-2))'; // ej. Cian
    case 'Borrador':
      return 'hsl(var(--chart-3))'; // ej. Azul claro
    case 'Vencida':
      return 'hsl(var(--chart-5))'; // ej. Naranja
      
    default:
      return 'hsl(var(--muted))'; // Gris como fallback
  }
};

export const QuotesFunnelChart = ({ data }) => {
  const { theme } = useTheme();

  const tickColor = theme === 'dark' 
    ? 'hsl(var(--muted-foreground))' 
    : 'hsl(var(--foreground))';
  
  // Mapea los datos para añadir el color de relleno
  const chartData = data.map((entry) => ({
    ...entry,
    fill: getFillColor(entry.name),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(var(--border))" 
          horizontal={false}
        />
        
        <XAxis
          type="number"
          stroke={tickColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        
        <YAxis
          type="category"
          dataKey="name"
          stroke={tickColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          width={110}
        />
        
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--popover))',
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--popover-foreground))',
            borderRadius: 'var(--radius)',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          cursor={{ fill: 'hsl(var(--muted))' }}
        />
        
        <Bar
          dataKey="value"
          radius={[0, 4, 4, 0]}
        >
          <LabelList
            dataKey="value"
            position="right"
            offset={8}
            fill={tickColor}
            fontSize={12}
            fontWeight="bold"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};