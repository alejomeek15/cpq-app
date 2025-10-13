import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// 1. Define a consistent color mapping for each status.
const COLORS = {
  'Aprobada': '#22c55e',       // Green
  'Enviada': '#f59e0b',        // Amber
  'En negociación': '#8b5cf6', // Violet
  'Borrador': '#3b82f6',       // Blue
  'Rechazada': '#ef4444',      // Red
  'Vencida': '#6b7280',        // Gray
};

// 2. Create a custom tooltip for a better hover experience.
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-800 p-2 border border-slate-700 rounded-md shadow-lg">
        <p className="font-bold">{`${data.name}: ${data.value}`}</p>
      </div>
    );
  }
  return null;
};

export const QuotesStatusChart = ({ data }) => {
  // 3. Calculate the total number of quotes to display in the center.
  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        {/* The Tooltip component enables the hover effect. */}
        <Tooltip content={<CustomTooltip />} />

        {/* The Legend component shows the colored labels below the chart. */}
        <Legend wrapperStyle={{ fontSize: '12px' }} />

        {/* The Pie component is what draws the chart. */}
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60} // This creates the "donut" hole.
          outerRadius={80} // The outer edge of the chart.
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          nameKey="name"
          labelLine={false}
        >
          {/* We map over the data to assign a specific color to each slice. */}
          {data.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name] || '#A0A0A0'} />
          ))}
        </Pie>

        {/* 4. Add the text label in the center of the donut chart. */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="text-2xl font-bold fill-white"
        >
          {totalValue}
        </text>
        <text
          x="50%"
          y="50%"
          dy={20}
          textAnchor="middle"
          className="text-xs fill-slate-400"
        >
          Total
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
};