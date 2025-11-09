import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/useAuth';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/ui/button';
import OpenAI from 'openai';

const InsightsPanelPro = ({ db }) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null); // Info sobre el caché

  // Clave para localStorage (específica por usuario)
  const CACHE_KEY = `insights_cache_${user?.uid}`;
  const CACHE_TIMESTAMP_KEY = `insights_timestamp_${user?.uid}`;
  const CACHE_QUOTE_COUNT_KEY = `insights_quote_count_${user?.uid}`;

  // Verificar si el caché es válido
  const isCacheValid = async () => {
    try {
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      const cachedQuoteCount = localStorage.getItem(CACHE_QUOTE_COUNT_KEY);
      
      if (!cachedTimestamp || !cachedQuoteCount) {
        return false;
      }

      // 1. Verificar si han pasado más de 24 horas
      const now = Date.now();
      const cacheAge = now - parseInt(cachedTimestamp);
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      
      if (cacheAge > TWENTY_FOUR_HOURS) {
        console.log('⏰ Caché expirado (más de 24 horas)');
        return false;
      }

      // 2. Verificar si hay nuevas cotizaciones
      const quotesRef = collection(db, "usuarios", user.uid, "cotizaciones");
      const quotesSnapshot = await getDocs(quotesRef);
      const currentQuoteCount = quotesSnapshot.size;
      const cachedCount = parseInt(cachedQuoteCount);

      console.log(`🔍 Verificando cotizaciones: Caché=${cachedCount}, Actual=${currentQuoteCount}`);

      if (currentQuoteCount !== cachedCount) {
        console.log(`📝 Nuevas cotizaciones detectadas (${cachedCount} → ${currentQuoteCount})`);
        return false;
      }

      console.log('✅ Caché válido - usando insights guardados');
      return true;
    } catch (error) {
      console.error('Error verificando caché:', error);
      return false;
    }
  };

  // Cargar insights desde caché
  const loadFromCache = () => {
    try {
      const cachedInsights = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cachedInsights && cachedTimestamp) {
        const insights = JSON.parse(cachedInsights);
        const timestamp = parseInt(cachedTimestamp);
        const age = Date.now() - timestamp;
        const hoursAgo = Math.floor(age / (1000 * 60 * 60));
        const minutesAgo = Math.floor((age % (1000 * 60 * 60)) / (1000 * 60));
        
        setInsights(insights);
        setCacheInfo({
          fromCache: true,
          timestamp,
          age: hoursAgo > 0 ? `${hoursAgo}h` : `${minutesAgo}m`
        });
        
        console.log(`💾 Insights cargados desde caché (${hoursAgo > 0 ? hoursAgo + 'h' : minutesAgo + 'm'} atrás)`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error cargando caché:', error);
      return false;
    }
  };

  // Guardar insights en caché
  const saveToCache = (insightsData, quoteCount) => {
    try {
      const now = Date.now();
      localStorage.setItem(CACHE_KEY, JSON.stringify(insightsData));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
      localStorage.setItem(CACHE_QUOTE_COUNT_KEY, quoteCount.toString());
      
      setCacheInfo({
        fromCache: false,
        timestamp: now,
        age: 'recién generado'
      });
      
      console.log(`💾 Insights guardados en caché con ${quoteCount} cotizaciones`);
    } catch (error) {
      console.error('Error guardando caché:', error);
    }
  };

  // Limpiar caché
  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      localStorage.removeItem(CACHE_QUOTE_COUNT_KEY);
      setCacheInfo(null);
      console.log('🗑️ Caché limpiado');
    } catch (error) {
      console.error('Error limpiando caché:', error);
    }
  };

  // Función para obtener TODOS los datos completos
  const fetchCompleteData = async () => {
    if (!user || !user.uid) return null;

    try {
      // 1. Obtener TODAS las cotizaciones con detalles completos
      const quotesRef = collection(db, "usuarios", user.uid, "cotizaciones");
      const quotesQuery = query(quotesRef, orderBy("fechaCreacion", "desc"));
      const quotesSnapshot = await getDocs(quotesQuery);
      
      const todasLasCotizaciones = quotesSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Convertir fechas de Firestore a formato legible
        let fechaCreacion = null;
        let vencimiento = null;
        
        if (data.fechaCreacion?.toDate) {
          fechaCreacion = data.fechaCreacion.toDate();
        } else if (data.fechaCreacion instanceof Date) {
          fechaCreacion = data.fechaCreacion;
        }
        
        if (data.vencimiento?.toDate) {
          vencimiento = data.vencimiento.toDate();
        } else if (data.vencimiento instanceof Date) {
          vencimiento = data.vencimiento;
        }

        return {
          numero: data.numero,
          cliente: data.clienteNombre,
          clienteId: data.clienteId,
          estado: data.estado,
          total: data.total,
          subtotal: data.subtotal,
          impuestos: data.impuestos,
          fechaCreacion: fechaCreacion ? fechaCreacion.toISOString().split('T')[0] : null,
          vencimiento: vencimiento ? vencimiento.toISOString().split('T')[0] : null,
          condicionesPago: data.condicionesPago,
          productos: data.lineas?.map(linea => ({
            nombre: linea.productName,
            cantidad: linea.quantity,
            precio: linea.price,
            subtotal: linea.subtotal
          })) || []
        };
      });

      // IMPORTANTE: Guardar el total real
      const totalCotizaciones = todasLasCotizaciones.length;
      
      // Limitar a 50 solo para enviar a la IA (no afecta el count)
      const cotizaciones = todasLasCotizaciones.slice(0, 50);

      // 2. Obtener TODOS los clientes con detalles
      const clientsRef = collection(db, "usuarios", user.uid, "clientes");
      const clientsSnapshot = await getDocs(clientsRef);
      
      const clientes = clientsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre,
          email: data.email,
          telefono: data.telefono,
          ciudad: data.direccion?.ciudad,
          // Calcular estadísticas del cliente
          cotizaciones: cotizaciones.filter(q => q.clienteId === doc.id)
        };
      }).map(cliente => ({
        nombre: cliente.nombre,
        totalCotizaciones: cliente.cotizaciones.length,
        totalAprobadas: cliente.cotizaciones.filter(q => q.estado === 'Aprobada').length,
        totalRechazadas: cliente.cotizaciones.filter(q => q.estado === 'Rechazada').length,
        montoTotal: cliente.cotizaciones
          .filter(q => q.estado === 'Aprobada')
          .reduce((sum, q) => sum + (q.total || 0), 0),
        tasaConversion: cliente.cotizaciones.length > 0 
          ? (cliente.cotizaciones.filter(q => q.estado === 'Aprobada').length / cliente.cotizaciones.length * 100).toFixed(1)
          : 0,
        ultimaCotizacion: cliente.cotizaciones[0]?.fechaCreacion || null
      }));

      // 3. Obtener TODOS los productos con performance
      const productosMap = new Map();
      
      cotizaciones.forEach(cotizacion => {
        cotizacion.productos.forEach(prod => {
          if (!productosMap.has(prod.nombre)) {
            productosMap.set(prod.nombre, {
              nombre: prod.nombre,
              vecesCotizado: 0,
              vecesAprobado: 0,
              cantidadTotal: 0,
              montoTotal: 0
            });
          }
          
          const producto = productosMap.get(prod.nombre);
          producto.vecesCotizado++;
          producto.cantidadTotal += prod.cantidad;
          producto.montoTotal += prod.subtotal;
          
          if (cotizacion.estado === 'Aprobada') {
            producto.vecesAprobado++;
          }
        });
      });

      const productos = Array.from(productosMap.values()).map(p => ({
        ...p,
        tasaConversion: p.vecesCotizado > 0 
          ? (p.vecesAprobado / p.vecesCotizado * 100).toFixed(1)
          : 0
      }));

      // 4. Calcular tendencias temporales
      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const cotizacionesEsteMes = cotizaciones.filter(q => {
        const fecha = new Date(q.fechaCreacion);
        return fecha >= firstDayThisMonth;
      });

      const cotizacionesMesAnterior = cotizaciones.filter(q => {
        const fecha = new Date(q.fechaCreacion);
        return fecha >= firstDayLastMonth && fecha <= lastDayLastMonth;
      });

      // Tendencias por día de la semana
      const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const cotizacionesPorDia = {};
      const aprobadasPorDia = {};
      
      diasSemana.forEach(dia => {
        cotizacionesPorDia[dia] = 0;
        aprobadasPorDia[dia] = 0;
      });

      cotizaciones.forEach(q => {
        if (q.fechaCreacion) {
          const fecha = new Date(q.fechaCreacion);
          const dia = diasSemana[fecha.getDay()];
          cotizacionesPorDia[dia]++;
          if (q.estado === 'Aprobada') {
            aprobadasPorDia[dia]++;
          }
        }
      });

      // 5. Cotizaciones urgentes
      const urgentes = cotizaciones.filter(q => {
        if (!['Enviada', 'En negociación'].includes(q.estado)) return false;
        if (!q.vencimiento) return false;
        
        const venc = new Date(q.vencimiento);
        const diffDays = Math.ceil((venc - now) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 2;
      });

      // 6. Borradores antiguos
      const borradoresAntiguos = cotizaciones.filter(q => {
        if (q.estado !== 'Borrador') return false;
        if (!q.fechaCreacion) return false;
        
        const fecha = new Date(q.fechaCreacion);
        const diffDays = Math.ceil((now - fecha) / (1000 * 60 * 60 * 24));
        return diffDays > 7;
      });

      return {
        cotizaciones: cotizaciones.slice(0, 50), // Últimas 50 para no saturar
        totalCotizaciones, // NUEVO: número real total
        clientes,
        productos,
        tendencias: {
          esteMes: {
            total: cotizacionesEsteMes.length,
            aprobadas: cotizacionesEsteMes.filter(q => q.estado === 'Aprobada').length,
            monto: cotizacionesEsteMes.filter(q => q.estado === 'Aprobada').reduce((sum, q) => sum + q.total, 0),
            tasaConversion: cotizacionesEsteMes.length > 0
              ? (cotizacionesEsteMes.filter(q => q.estado === 'Aprobada').length / cotizacionesEsteMes.length * 100).toFixed(1)
              : 0
          },
          mesAnterior: {
            total: cotizacionesMesAnterior.length,
            aprobadas: cotizacionesMesAnterior.filter(q => q.estado === 'Aprobada').length,
            monto: cotizacionesMesAnterior.filter(q => q.estado === 'Aprobada').reduce((sum, q) => sum + q.total, 0),
            tasaConversion: cotizacionesMesAnterior.length > 0
              ? (cotizacionesMesAnterior.filter(q => q.estado === 'Aprobada').length / cotizacionesMesAnterior.length * 100).toFixed(1)
              : 0
          },
          porDiaSemana: Object.entries(cotizacionesPorDia).map(([dia, total]) => ({
            dia,
            total,
            aprobadas: aprobadasPorDia[dia],
            tasaConversion: total > 0 ? (aprobadasPorDia[dia] / total * 100).toFixed(1) : 0
          }))
        },
        alertas: {
          urgentes: urgentes.length,
          urgentesDetalle: urgentes.map(q => ({
            numero: q.numero,
            cliente: q.cliente,
            monto: q.total,
            vencimiento: q.vencimiento
          })),
          borradoresAntiguos: borradoresAntiguos.length,
          borradoresMontoEstimado: borradoresAntiguos.reduce((sum, q) => sum + q.total, 0)
        }
      };
    } catch (error) {
      console.error('Error obteniendo datos completos:', error);
      return null;
    }
  };

  const generateInsights = async (forceRegenerate = false) => {
    if (!user || !user.uid) return;

    // Si no es regeneración forzada, intentar usar caché
    if (!forceRegenerate) {
      const cacheValid = await isCacheValid();
      if (cacheValid) {
        const loaded = loadFromCache();
        if (loaded) return; // Salir si cargó exitosamente desde caché
      }
    } else {
      // Si es regeneración forzada, limpiar caché primero
      clearCache();
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Obtener datos completos
      const completeData = await fetchCompleteData();
      
      if (!completeData) {
        throw new Error('No se pudieron obtener los datos');
      }

      console.log('🤖 Generando insights con IA...');

      // 2. Llamar a OpenAI con TODOS los datos
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Eres un analista de negocios experto en CPQ y ventas B2B. 
Analiza los datos proporcionados y genera insights ESPECÍFICOS, ACCIONABLES y PROFUNDOS.
No hagas afirmaciones genéricas. Usa números concretos y nombres específicos.
Identifica patrones ocultos, tendencias y oportunidades que el usuario podría no haber notado.
Sé directo y enfócate en insights que generen valor real.
Responde en español y en formato JSON válido.`
          },
          {
            role: "user",
            content: `Analiza profundamente estos datos de mi negocio CPQ y genera insights valiosos:

${JSON.stringify(completeData, null, 2)}

Genera un JSON con insights específicos y accionables:
{
  "resumenEjecutivo": "Un párrafo con los hallazgos MÁS importantes y específicos",
  "insightsDescriptivos": [
    "Insight específico con números y nombres (ej: TechCorp rechazó 3 de 5 cotizaciones...)",
    "Otro insight específico..."
  ],
  "insightsPredictivos": [
    "Predicción específica basada en datos históricos",
    "Otra predicción..."
  ],
  "insightsPrescriptivos": [
    "Acción específica y concreta que el usuario debe tomar",
    "Otra acción específica..."
  ],
  "alertasCriticas": [
    "Alerta urgente con datos específicos",
    "Otra alerta..."
  ],
  "oportunidadesOcultas": [
    "Oportunidad que el usuario podría no haber visto",
    "Otra oportunidad..."
  ]
}`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      });

      const responseText = completion.choices[0].message.content.trim();
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const parsedInsights = JSON.parse(jsonText);
      
      setInsights(parsedInsights);
      
      // Guardar en caché con el número REAL total de cotizaciones
      saveToCache(parsedInsights, completeData.totalCotizaciones);
      
      console.log('✅ Insights generados y guardados en caché');

    } catch (err) {
      console.error('Error generando insights:', err);
      setError('Error al generar insights. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Sparkles className="h-12 w-12 text-primary animate-pulse" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Analizando Datos Completos...</h3>
          <p className="text-sm text-muted-foreground">Esto puede tomar unos segundos</p>
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

  if (!insights) return null;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Insights Profundos con IA</h2>
            {cacheInfo && (
              <p className="text-xs text-muted-foreground mt-1">
                {cacheInfo.fromCache ? (
                  <>💾 Desde caché • Generado hace {cacheInfo.age}</>
                ) : (
                  <>✨ Recién generado</>
                )}
              </p>
            )}
          </div>
        </div>
        <Button 
          onClick={() => generateInsights(true)} 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Generando...' : 'Regenerar'}
        </Button>
      </div>

      {/* Resumen Ejecutivo */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2 text-foreground">📊 Resumen Ejecutivo</h3>
            <p className="text-foreground/90 leading-relaxed text-base">{insights.resumenEjecutivo}</p>
          </div>
        </div>
      </div>

      {/* Insights Descriptivos */}
      <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-bold text-lg text-foreground">📈 ¿Qué está pasando?</h3>
        </div>
        <ul className="space-y-3">
          {insights.insightsDescriptivos.map((insight, i) => (
            <li key={i} className="flex items-start gap-3 text-foreground/80">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-sm font-semibold text-purple-600 dark:text-purple-400">
                {i + 1}
              </span>
              <span className="flex-1">{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Grid de 2 columnas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Insights Predictivos */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-xl border border-cyan-200 dark:border-cyan-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔮</span>
            <h3 className="font-bold text-lg text-foreground">¿Qué puede pasar?</h3>
          </div>
          <ul className="space-y-2">
            {insights.insightsPredictivos.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-foreground/80">
                <span className="text-cyan-600 dark:text-cyan-400 mt-1">→</span>
                <span className="flex-1">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Alertas Críticas */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h3 className="font-bold text-lg text-foreground">⚠️ Alertas Críticas</h3>
          </div>
          <ul className="space-y-2">
            {insights.alertasCriticas.map((alerta, i) => (
              <li key={i} className="flex items-start gap-2 text-foreground/80">
                <span className="text-red-600 dark:text-red-400 mt-1">!</span>
                <span className="flex-1">{alerta}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Insights Prescriptivos */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="font-bold text-lg text-foreground">🎯 Acciones Recomendadas</h3>
        </div>
        <ul className="space-y-3">
          {insights.insightsPrescriptivos.map((accion, i) => (
            <li key={i} className="flex items-start gap-3 text-foreground/80">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-sm font-semibold text-green-600 dark:text-green-400">
                ✓
              </span>
              <span className="flex-1">{accion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Oportunidades Ocultas */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💎</span>
          <h3 className="font-bold text-lg text-foreground">Oportunidades Ocultas</h3>
        </div>
        <ul className="space-y-2">
          {insights.oportunidadesOcultas.map((oportunidad, i) => (
            <li key={i} className="flex items-start gap-2 text-foreground/80">
              <span className="text-amber-600 dark:text-amber-400 mt-1">★</span>
              <span className="flex-1">{oportunidad}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-xs text-muted-foreground">
          💡 Análisis profundo generado por IA • {insights.insightsDescriptivos.length + insights.insightsPredictivos.length + insights.insightsPrescriptivos.length} insights
        </div>
        {cacheInfo && cacheInfo.fromCache && (
          <button
            onClick={() => generateInsights(true)}
            className="text-xs text-primary hover:underline"
          >
            Forzar actualización
          </button>
        )}
      </div>
    </div>
  );
};

export default InsightsPanelPro;