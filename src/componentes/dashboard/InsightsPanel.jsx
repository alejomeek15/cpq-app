import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/useAuth';
import { getDashboardStats, getTopClientes, getQuotesByStatus } from '@/utils/dashboardUtils';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/ui/button';
import OpenAI from 'openai';

const InsightsPanel = ({ db }) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateInsights = async () => {
    if (!user || !user.uid) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Obtener datos del usuario
      const [stats, topClientes, quotesByStatus] = await Promise.all([
        getDashboardStats(db, user.uid),
        getTopClientes(db, user.uid, 5),
        getQuotesByStatus(db, user.uid)
      ]);

      // 2. Preparar el contexto para OpenAI
      const context = {
        stats: {
          totalAprobado: stats.totalAprobado,
          cotizacionesCreadas: stats.cotizacionesCreadas,
          cotizacionesAprobadas: stats.cotizacionesAprobadas,
          cotizacionesEnviadas: stats.cotizacionesEnviadas,
          tasaAprobacion: stats.tasaAprobacion
        },
        topClientes: topClientes.map(c => ({
          nombre: c.nombre,
          monto: c.montoTotal,
          cantidad: c.cantidadCotizaciones
        })),
        distribucionEstados: quotesByStatus
      };

      // 3. Llamar a OpenAI
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Solo para desarrollo
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Modelo más económico
        messages: [
          {
            role: "system",
            content: `Eres un analista de negocios experto en CPQ (Configure, Price, Quote). 
Tu trabajo es analizar datos de cotizaciones y generar insights accionables en español.
Sé conciso, directo y enfócate en lo que el usuario puede hacer para mejorar sus ventas.
Responde SOLO en formato JSON válido, sin markdown ni explicaciones adicionales.`
          },
          {
            role: "user",
            content: `Analiza estos datos de mi negocio y genera insights:

${JSON.stringify(context, null, 2)}

Genera un JSON con esta estructura exacta:
{
  "resumen": "Un párrafo resumiendo el estado general del negocio",
  "puntosFuertes": ["punto1", "punto2"],
  "areasDeAtencion": ["area1", "area2"],
  "recomendaciones": ["recomendacion1", "recomendacion2", "recomendacion3"],
  "topCliente": {
    "nombre": "nombre del mejor cliente",
    "insight": "insight específico sobre este cliente"
  }
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const responseText = completion.choices[0].message.content.trim();
      
      // Limpiar el texto en caso de que venga con markdown
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const parsedInsights = JSON.parse(jsonText);
      setInsights(parsedInsights);

    } catch (err) {
      console.error('Error generando insights:', err);
      setError('Error al generar insights. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Generar insights automáticamente al cargar
  useEffect(() => {
    generateInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Sparkles className="h-12 w-12 text-primary animate-pulse" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Generando Insights con IA...</h3>
          <p className="text-sm text-muted-foreground">Analizando tus datos de negocio</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={generateInsights} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Sparkles className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay insights generados</h3>
          <Button onClick={generateInsights}>
            Generar Insights
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header con botón de regenerar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Insights con IA</h2>
        </div>
        <Button onClick={generateInsights} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerar
        </Button>
      </div>

      {/* Resumen General */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2 text-foreground">Resumen del Negocio</h3>
            <p className="text-foreground/80 leading-relaxed">{insights.resumen}</p>
          </div>
        </div>
      </div>

      {/* Grid de 2 columnas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Puntos Fuertes */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="font-bold text-lg text-foreground">Puntos Fuertes</h3>
          </div>
          <ul className="space-y-2">
            {insights.puntosFuertes.map((punto, i) => (
              <li key={i} className="flex items-start gap-2 text-foreground/80">
                <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                <span className="flex-1">{punto}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Áreas de Atención */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl border border-orange-200 dark:border-orange-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-bold text-lg text-foreground">Requiere Atención</h3>
          </div>
          <ul className="space-y-2">
            {insights.areasDeAtencion.map((area, i) => (
              <li key={i} className="flex items-start gap-2 text-foreground/80">
                <span className="text-orange-600 dark:text-orange-400 mt-1">⚠</span>
                <span className="flex-1">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Top Cliente */}
      {insights.topCliente && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2 text-foreground">
                Cliente Destacado: {insights.topCliente.nombre}
              </h3>
              <p className="text-foreground/80 leading-relaxed">{insights.topCliente.insight}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-bold text-lg text-foreground">Recomendaciones</h3>
        </div>
        <ul className="space-y-3">
          {insights.recomendaciones.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-foreground/80">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-sm font-semibold text-purple-600 dark:text-purple-400">
                {i + 1}
              </span>
              <span className="flex-1">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer con disclaimer */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        💡 Insights generados por IA • Los resultados son sugerencias basadas en tus datos
      </div>
    </div>
  );
};

export default InsightsPanel;