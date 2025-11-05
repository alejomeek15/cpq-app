import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
// format, subMonths, y es ya no son necesarios para getDashboardStats
// import { format, subMonths } from 'date-fns';
// import { es } from 'date-fns/locale';

/**
 * Calcula las métricas principales (KPIs) globales para el dashboard.
 * @param {Firestore} db - La instancia de la base de datos de Firestore.
 */
export async function getDashboardStats(db) {
  // --- Fechas eliminadas ---
  // const now = new Date();
  // const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // const startOfMonthTimestamp = Timestamp.fromDate(startOfMonth);

  // --- Consultas a Firestore (Ahora globales, sin filtro de fecha) ---
  const quotesQuery = query(collection(db, "cotizaciones"));
  const clientsQuery = query(collection(db, "clientes"));

  const [quotesSnapshot, clientsSnapshot] = await Promise.all([
    getDocs(quotesQuery),
    getDocs(clientsQuery)
  ]);

  // --- Procesamiento de los datos (Ahora "allQuotes" en lugar de "quotesThisMonth") ---
  const allQuotes = quotesSnapshot.docs.map(doc => doc.data());

  const totalAprobado = allQuotes
    .filter(q => q.estado === 'Aprobada')
    .reduce((sum, q) => sum + q.total, 0);

  const cotizacionesCreadas = allQuotes.length;
  // Ajustamos las definiciones para que sean globales
  const cotizacionesEnviadas = allQuotes.filter(q => q.estado === 'Enviada' || q.estado === 'Aprobada' || q.estado === 'Rechazada').length;
  const cotizacionesAprobadas = allQuotes.filter(q => q.estado === 'Aprobada').length;

  const tasaAprobacion = cotizacionesEnviadas > 0 ? (cotizacionesAprobadas / cotizacionesEnviadas) * 100 : 0;

  // nuevosClientes ahora contará TODOS los clientes
  const nuevosClientes = clientsSnapshot.size;

  return {
    totalAprobado,
    cotizacionesCreadas,
    tasaAprobacion,
    nuevosClientes,
  };
}

/**
 * Obtiene las 5 cotizaciones más recientes. (Sin cambios, ya era global)
 * @param {Firestore} db - La instancia de la base de datos de Firestore.
 */
export async function getRecentQuotes(db) {
  const q = query(collection(db, "cotizaciones"), orderBy("fechaCreacion", "desc"), limit(5));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Agrupa todas las cotizaciones por estado, en el orden del embudo.
 * @param {Firestore} db - La instancia de la base de datos de Firestore.
 */
export async function getQuotesByStatus(db) {
  // 1. Definimos el orden explícito del embudo
  const funnelOrder = [
    'Borrador',
    'Enviada',
    'En negociación',
    'Aprobada',
    'Rechazada',
    'Vencida',
  ];

  // 2. Usamos un Map para inicializar y preservar el orden
  const statusCounts = new Map(funnelOrder.map(status => [status, 0]));

  // 3. Obtenemos TODAS las cotizaciones
  const querySnapshot = await getDocs(collection(db, "cotizaciones"));

  // 4. Contamos cada cotización
  querySnapshot.forEach((doc) => {
    const quote = doc.data();
    if (quote.estado && statusCounts.has(quote.estado)) {
      // Incrementamos el contador en el Map
      statusCounts.set(quote.estado, statusCounts.get(quote.estado) + 1);
    }
  });

  // 5. Convertimos el Map al formato de Recharts, filtrando los que tienen 0
  // El orden se preservará gracias al Map.
  const dataForChart = Array.from(statusCounts.entries())
    .map(([name, value]) => ({
      name: name,
      value: value,
    }))
    .filter(item => item.value > 0); // Opcional: puedes quitar este filtro si quieres ver estados con 0

  return dataForChart;
}
