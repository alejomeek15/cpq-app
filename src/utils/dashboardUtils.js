import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Calcula las métricas principales (KPIs) para la fila superior del dashboard.
 * @param {Firestore} db - La instancia de la base de datos de Firestore.
 */
export async function getDashboardStats(db) {
  // --- Fechas para filtrar por el mes actual ---
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfMonthTimestamp = Timestamp.fromDate(startOfMonth);

  // --- Consultas a Firestore ---
  const quotesQuery = query(collection(db, "cotizaciones"), where("fechaCreacion", ">=", startOfMonthTimestamp));
  const clientsQuery = query(collection(db, "clientes"), where("fechaCreacion", ">=", startOfMonthTimestamp));

  const [quotesSnapshot, clientsSnapshot] = await Promise.all([
    getDocs(quotesQuery),
    getDocs(clientsQuery)
  ]);

  // --- Procesamiento de los datos ---
  const quotesThisMonth = quotesSnapshot.docs.map(doc => doc.data());

  const totalAprobado = quotesThisMonth
    .filter(q => q.estado === 'Aprobada')
    .reduce((sum, q) => sum + q.total, 0);

  const cotizacionesCreadas = quotesThisMonth.length;
  const cotizacionesEnviadas = quotesThisMonth.filter(q => q.estado === 'Enviada' || q.estado === 'Aprobada' || q.estado === 'Rechazada').length;
  const cotizacionesAprobadas = quotesThisMonth.filter(q => q.estado === 'Aprobada').length;
  
  const tasaAprobacion = cotizacionesEnviadas > 0 ? (cotizacionesAprobadas / cotizacionesEnviadas) * 100 : 0;

  const nuevosClientes = clientsSnapshot.size;

  return {
    totalAprobado,
    cotizacionesCreadas,
    tasaAprobacion,
    nuevosClientes,
  };
}

/**
 * Obtiene las 5 cotizaciones más recientes.
 * @param {Firestore} db - La instancia de la base de datos de Firestore.
 */
export async function getRecentQuotes(db) {
  const q = query(collection(db, "cotizaciones"), orderBy("fechaCreacion", "desc"), limit(5));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Agrupa todas las cotizaciones por su estado y cuenta cuántas hay en cada uno.
 * @param {Firestore} db - La instancia de la base de datos de Firestore.
 */
export async function getQuotesByStatus(db) {
  // 1. Preparamos un objeto para contar los estados.
  const statusCounts = {
    'Borrador': 0,
    'Enviada': 0,
    'En negociación': 0,
    'Aprobada': 0,
    'Rechazada': 0,
    'Vencida': 0,
  };

  // 2. Obtenemos TODAS las cotizaciones de la colección.
  const querySnapshot = await getDocs(collection(db, "cotizaciones"));

  // 3. Recorremos cada cotización y aumentamos el contador de su estado.
  querySnapshot.forEach((doc) => {
    const quote = doc.data();
    if (quote.estado && statusCounts.hasOwnProperty(quote.estado)) {
      statusCounts[quote.estado]++;
    }
  });

  // 4. Convertimos el objeto de conteo al formato que Recharts necesita: [{ name: 'Estado', value: conteo }]
  //    También filtramos los estados que no tienen ninguna cotización para no saturar el gráfico.
  const dataForChart = Object.keys(statusCounts)
    .map(status => ({
      name: status,
      value: statusCounts[status],
    }))
    .filter(item => item.value > 0);

  return dataForChart;
}