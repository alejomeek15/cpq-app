// En /src/utils/firestoreUtils.js
import { doc, runTransaction } from 'firebase/firestore';

/**
 * Obtiene el siguiente número de secuencia para una cotización de forma atómica.
 * @param {Firestore} db - La instancia de la base de datos de Firestore.
 * @param {string} userId - El ID del usuario autenticado (UID de Firebase Auth).
 * @returns {Promise<string>} - El número de cotización formateado (ej. "COT-0009").
 */
export async function obtenerSiguienteNumeroCotizacion(db, userId) {
  // ¡CAMBIO! Validar que el userId esté presente
  if (!userId) {
    console.error("Error: userId es requerido para obtener el número de cotización.");
    return null;
  }

  // ¡CAMBIO! Ruta anidada: usuarios/{userId}/contadores/cotizacion
  const contadorRef = doc(db, 'usuarios', userId, 'contadores', 'cotizacion');

  try {
    // Ejecutar una transacción para garantizar una operación atómica.
    const nuevoNumero = await runTransaction(db, async (transaction) => {
      const contadorDoc = await transaction.get(contadorRef);

      if (!contadorDoc.exists()) {
        // ¡CAMBIO! Si no existe, inicializar con 1
        console.warn(`[obtenerSiguienteNumeroCotizacion] Contador no encontrado para usuario ${userId}. Inicializando...`);
        transaction.set(contadorRef, { numeroActual: 1 });
        return 1;
      }

      // Obtener el número actual y calcular el nuevo.
      const numeroAnterior = contadorDoc.data().numeroActual;
      const numeroNuevo = numeroAnterior + 1;

      // Actualizar el contador en la base de datos con el nuevo número.
      transaction.update(contadorRef, { numeroActual: numeroNuevo });

      // Devolver el nuevo número para usarlo.
      return numeroNuevo;
    });

    // Formatear el número como lo hacías antes.
    return `COT-${String(nuevoNumero).padStart(4, '0')}`;

  } catch (error) {
    console.error("Error al obtener el siguiente número de cotización:", error);
    return null;
  }
}