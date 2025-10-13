import React, { useState, useEffect } from 'react';
import { getDashboardStats, getRecentQuotes, getQuotesByStatus } from '@/utils/dashboardUtils.js';
import StatCard from '@/componentes/dashboard/StatCard.jsx';
import { RecentQuotesTable } from '@/componentes/dashboard/RecentQuotesTable.jsx';
import { QuotesStatusChart } from '@/componentes/dashboard/QuotesStatusChart.jsx';
import { DollarSign, Users, FileText, Percent } from 'lucide-react';
import { SidebarTrigger } from '@/ui/sidebar.jsx'; // <-- 1. Importa el Trigger

const Dashboard = ({ db, navigate }) => {
  const [stats, setStats] = useState(null);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
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

  const handleQuoteClick = (quoteId) => {
    navigate('quotes');
  };

  if (loading) {
    return (
      <div>
        <SidebarTrigger />
        <p className="mt-4">Cargando métricas...</p>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-8">
      <div>
        {/* --- ¡CÓDIGO AÑADIDO AQUÍ! --- */}
        {/* 2. Añade el SidebarTrigger al principio de la página. */}
        <SidebarTrigger />
        {/* 3. Añade un margen superior al título para separarlo. */}
        <h1 className="text-3xl font-bold mt-4">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Monto Aprobado (Mes)"
          value={formatCurrency(stats?.totalAprobado || 0)}
          icon={<DollarSign className="h-4 w-4 text-slate-400" />}
        />
        <StatCard 
          title="Cotizaciones Creadas (Mes)"
          value={stats?.cotizacionesCreadas || 0}
          icon={<FileText className="h-4 w-4 text-slate-400" />}
        />
        <StatCard 
          title="Tasa de Aprobación"
          value={`${(stats?.tasaAprobacion || 0).toFixed(1)}%`}
          icon={<Percent className="h-4 w-4 text-slate-400" />}
        />
        <StatCard 
          title="Nuevos Clientes (Mes)"
          value={stats?.nuevosClientes || 0}
          icon={<Users className="h-4 w-4 text-slate-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-card rounded-lg border border-border p-4">
          <h3 className="font-bold mb-4">Cotizaciones por Estado</h3>
          {chartData.length > 0 ? (
            <QuotesStatusChart data={chartData} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              No hay datos de cotizaciones para mostrar.
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-bold mb-4">Cotizaciones Recientes</h3>
          <RecentQuotesTable quotes={recentQuotes} onRowClick={handleQuoteClick} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;