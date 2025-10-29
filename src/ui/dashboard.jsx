import React, { useState, useEffect } from 'react';
import { getDashboardStats, getRecentQuotes, getQuotesByStatus } from '@/utils/dashboardUtils.js'; // Assuming these are OK
import StatCard from '@/componentes/dashboard/StatCard.jsx'; // Already refactored
import { RecentQuotesTable } from '@/componentes/dashboard/RecentQuotesTable.jsx'; // Already refactored
import { QuotesStatusChart } from '@/componentes/dashboard/QuotesStatusChart.jsx'; // Assuming this uses a theme-aware charting library or needs review
import { DollarSign, Users, FileText, Percent } from 'lucide-react';
// --- REMOVE SidebarTrigger import ---
// import { SidebarTrigger } from '@/ui/sidebar.jsx';

const Dashboard = ({ db, navigate }) => {
  const [stats, setStats] = useState(null);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect for data fetching (no changes needed)
  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true); // Set loading at the start
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
        // Consider adding a user-facing error state/notification
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [db]);

  // handleQuoteClick (no changes needed)
  const handleQuoteClick = (quoteId) => {
    // Navigate to the specific quote requires more info,
    // for now, just navigate to the quotes list page
    navigate('quotes');
    // To navigate to the specific quote, you'd need something like:
    // navigate('quotes', { quoteId }); // And adjust QuotesPage to handle this
  };

  // Loading state (removed SidebarTrigger)
  if (loading) {
    return (
      // --- REMOVE SidebarTrigger ---
      // Removed the div and SidebarTrigger that were here
      // Added text-muted-foreground to loading text
      <p className="mt-4 text-center text-muted-foreground">Cargando métricas...</p>
    );
  }

  // formatCurrency helper (no changes needed)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value || 0);
  };

  return (
    <div className="space-y-8">
      {/* --- REMOVE SidebarTrigger --- */}
      {/* Title now sits directly at the top, adjusted spacing */}
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* StatCard icons use text-muted-foreground for theme consistency */}
        <StatCard
          title="Monto Aprobado (Mes)"
          value={formatCurrency(stats?.totalAprobado)}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Cotizaciones Creadas (Mes)"
          value={stats?.cotizacionesCreadas || 0}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Tasa de Aprobación"
          value={`${(stats?.tasaAprobacion || 0).toFixed(1)}%`}
          icon={<Percent className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Nuevos Clientes (Mes)"
          value={stats?.nuevosClientes || 0}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Chart and Recent Quotes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Chart Container uses bg-card, border */}
        <div className="lg:col-span-3 bg-card rounded-lg border p-4">
          {/* Heading uses text-foreground */}
          <h3 className="font-bold mb-4 text-foreground">Cotizaciones por Estado</h3>
          {chartData.length > 0 ? (
            <QuotesStatusChart data={chartData} /> // Ensure this component is theme-aware
          ) : (
            // Empty state uses text-muted-foreground
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay datos de cotizaciones para mostrar.
            </div>
          )}
        </div>

        {/* Recent Quotes Container */}
        <div className="lg:col-span-2">
          {/* Heading uses text-foreground */}
          <h3 className="font-bold mb-4 text-foreground">Cotizaciones Recientes</h3>
          {/* RecentQuotesTable was already refactored */}
          <RecentQuotesTable quotes={recentQuotes} onRowClick={handleQuoteClick} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;