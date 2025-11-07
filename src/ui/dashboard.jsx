import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/useAuth'; // ¡NUEVO!
import { getDashboardStats, getRecentQuotes, getQuotesByStatus } from '@/utils/dashboardUtils.js';
import StatCard from '@/componentes/dashboard/StatCard.jsx';
import { RecentQuotesTable } from '@/componentes/dashboard/RecentQuotesTable.jsx';
import { QuotesFunnelChart } from '@/componentes/dashboard/QuotesFunnelChart.jsx';
import { DollarSign, Users, FileText, Percent } from 'lucide-react';

// ¡CAMBIO! Ya NO recibe 'user' ni 'auth' como props
const Dashboard = ({ db, navigate }) => {
  // ¡NUEVO! Obtener user del Context
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ¡CAMBIO! useEffect ahora pasa user.uid a las funciones utilitarias
  useEffect(() => {
    async function loadDashboardData() {
      // ¡NUEVO! Validar que el usuario esté autenticado
      if (!user || !user.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // ¡CAMBIO! Pasar user.uid a las funciones utilitarias
        const [dashboardStats, recentQuotesData, quotesByStatusData] = await Promise.all([
          getDashboardStats(db, user.uid),
          getRecentQuotes(db, user.uid),
          getQuotesByStatus(db, user.uid)
        ]);
        setStats(dashboardStats);
        setRecentQuotes(recentQuotesData);
        setChartData(quotesByStatusData);
      } catch (err) {
        console.error("Error al cargar los datos del dashboard:", err);
        setError("Error al cargar los datos del dashboard.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [db, user]); // ¡CAMBIO! Añadir 'user' a las dependencias

  const handleQuoteClick = (quoteId) => {
    navigate('quotes', quoteId);
  };

  if (loading) {
    return (
      <p className="mt-4 text-center text-muted-foreground">Cargando métricas...</p>
    );
  }

  if (error) {
    return (
      <p className="mt-4 text-center text-destructive">{error}</p>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value || 0);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

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
          <RecentQuotesTable quotes={recentQuotes} onRowClick={handleQuoteClick} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;