import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';

/**
 * Calcula las métricas principales (KPIs) para el dashboard DEL USUARIO.
 * @param {Firestore} db - La instancia de la base de datos de Firestore.
 * @param {string} userId - El ID del usuario autenticado (user.uid).
 */
export async function getDashboardStats(db, userId) {
  // ¡NUEVO! Validar que userId esté presente
  if (!userId) {
    console.error("Error: userId es requerido para obtener las estadísticas del dashboard.");
    return {
      totalAprobado: 0,
      cotizacionesCreadas: 0,
      tasaAprobacion: 0,
      nuevosClientes: 0,
    };
  }

  // ¡CAMBIO! Rutas anidadas con userId
  const quotesQuery = query(collection(db, "usuarios", userId, "cotizaciones"));
  const clientsQuery = query(collection(db, "usuarios", userId, "clientes"));

  try {
    const [quotesSnapshot, clientsSnapshot] = await Promise.all([
      getDocs(quotesQuery),
      getDocs(clientsQuery)
    ]);

    const allQuotes = quotesSnapshot.docs.map(doc => doc.data());

    const totalAprobado = allQuotes
      .filter(q => q.estado === 'Aprobada')
      .reduce((sum, q) => sum + q.total, 0);

    const cotizacionesCreadas = allQuotes.length;
    const cotizacionesEnviadas = allQuotes.filter(q => q.estado === 'Enviada' || q.estado === 'Aprobada' || q.estado === 'Rechazada').length;
    const cotizacionesAprobadas = allQuotes.filter(q => q.estado === 'Aprobada').length;

    const tasaAprobacion = cotizacionesEnviadas > 0 ? (cotizacionesAprobadas / cotizacionesEnviadas) * 100 : 0;

    const nuevosClientes = clientsSnapshot.size;

    return {
      totalAprobado,
      cotizacionesCreadas,
      tasaAprobacion,
      nuevosClientes,
    };
  } catch (error) {
    console.error("Error al calcular las estadísticas del dashboard:", error);
    return {
      totalAprobado: 0,
      cotizacionesCreadas: 0,
      tasaAprobacion: 0,
      nuevosClientes: 0,
    };
  }
}

/**
 * Obtiene las 5 cotizaciones más recientes DEL USUARIO.
 * @param {Firestore} db - La instancia de la base de datos de Firestore.
 * @param {string} userId - El ID del usuario autenticado (user.uid).
 */
export async function getRecentQuotes(db, userId) {
  // ¡NUEVO! Validar que userId esté presente
  if (!userId) {
    console.error("Error: userId es requerido para obtener las cotizaciones recientes.");
    return [];
  }

  try {
    // ¡CAMBIO! Ruta anidada con userId
    const q = query(
      collection(db, "usuarios", userId, "cotizaciones"),
      orderBy("fechaCreacion", "desc"),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error al obtener las cotizaciones recientes:", error);
    return [];
  }
}

/**
 * Agrupa todas las cotizaciones DEL USUARIO por estado, en el orden del embudo.
 * @param {Firestore} db - La instancia de la base de datos de Firestore.
 * @param {string} userId - El ID del usuario autenticado (user.uid).
 */
export async function getQuotesByStatus(db, userId) {
  // ¡NUEVO! Validar que userId esté presente
  if (!userId) {
    console.error("Error: userId es requerido para obtener las cotizaciones por estado.");
    return [];
  }

  const funnelOrder = [
    'Borrador',
    'Enviada',
    'En negociación',
    'Aprobada',
    'Rechazada',
    'Vencida',
  ];

  const statusCounts = new Map(funnelOrder.map(status => [status, 0]));

  try {
    // ¡CAMBIO! Ruta anidada con userId
    const querySnapshot = await getDocs(collection(db, "usuarios", userId, "cotizaciones"));

    querySnapshot.forEach((doc) => {
      const quote = doc.data();
      if (quote.estado && statusCounts.has(quote.estado)) {
        statusCounts.set(quote.estado, statusCounts.get(quote.estado) + 1);
      }
    });

    const dataForChart = Array.from(statusCounts.entries())
      .map(([name, value]) => ({
        name: name,
        value: value,
      }))
      .filter(item => item.value > 0);

    return dataForChart;
  } catch (error) {
    console.error("Error al obtener las cotizaciones por estado:", error);
    return [];
  }
}