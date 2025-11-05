import React, { useState, useEffect } from 'react';
import { getDashboardStats, getRecentQuotes, getQuotesByStatus } from '@/utils/dashboardUtils.js';
import StatCard from '@/componentes/dashboard/StatCard.jsx';
import { RecentQuotesTable } from '@/componentes/dashboard/RecentQuotesTable.jsx';
// Importamos el gráfico de embudo (BarChart horizontal)
import { QuotesFunnelChart } from '@/componentes/dashboard/QuotesFunnelChart.jsx';
import { DollarSign, Users, FileText, Percent } from 'lucide-react';

const Dashboard = ({ db, navigate }) => {
  const [stats, setStats] = useState(null);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lógica de fetching de datos (sin cambios)
  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [dashboardStats, recentQuotesData, quotesByStatusData] = await Promise.all([
          getDashboardStats(db),
          getRecentQuotes(db),
          getQuotesByStatus(db)
        ]);
        setStats(dashboardStats);
        setRecentQuotes(recentQuotesData);
        setChartData(quotesByStatusData);
      } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [db]);

  // --- ¡CAMBIO AQUÍ! ---
  // Ahora pasamos el quoteId como segundo argumento a la función navigate
  const handleQuoteClick = (quoteId) => {
    navigate('quotes', quoteId); // 'quotes' es la ruta, quoteId es el payload
  };
  // --- FIN DEL CAMBIO ---

  // Loading state (sin cambios)
  if (loading) {
    return (
      <p className="mt-4 text-center text-muted-foreground">Cargando métricas...</p>
    );
  }

  // formatCurrency helper (sin cambios)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value || 0);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

      {/* Stat Cards Grid (sin cambios) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monto Aprobado"
          value={formatCurrency(stats?.totalAprobado)}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Cotizaciones Creadas"
          value={stats?.cotizacionesCreadas || 0}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Tasa de Aprobación"
          value={`${(stats?.tasaAprobacion || 0).toFixed(1)}%`}
          icon={<Percent className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Número Clientes"
          value={stats?.nuevosClientes || 0}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Chart and Recent Quotes Grid (sin cambios) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-bold mb-4 text-foreground">Estado de Cotizaciones</h3>
          {chartData.length > 0 ? (
            <QuotesFunnelChart data={chartData} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay datos de cotizaciones para mostrar.
            </div>
          )}
        </div>

        <div>
          <h3 className="font-bold mb-4 text-foreground">Cotizaciones Recientes</h3>
          {/* RecentQuotesTable pasa el quoteId a nuestro handleQuoteClick actualizado */}
          <RecentQuotesTable quotes={recentQuotes} onRowClick={handleQuoteClick} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;