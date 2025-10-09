// En /src/utils/firestoreUtils.js
import { doc, runTransaction } from 'firebase/firestore';

/**
 * Obtiene el siguiente número de secuencia para una cotización de forma atómica.
 * @param {Firestore} db - La instancia de la base de datos de Firestore.
 * @returns {Promise<string>} - El número de cotización formateado (ej. "COT-0009").
 */
export async function obtenerSiguienteNumeroCotizacion(db) {
  // 1. Referencia al documento que almacena nuestro contador.
  const contadorRef = doc(db, 'contadores', 'cotizacion');

  try {
    // 2. Ejecutar una transacción para garantizar una operación atómica.
    const nuevoNumero = await runTransaction(db, async (transaction) => {
      const contadorDoc = await transaction.get(contadorRef);

      if (!contadorDoc.exists()) {
        throw new Error("¡El documento del contador de cotizaciones no existe!");
      }

      // 3. Obtener el número actual y calcular el nuevo.
      const numeroAnterior = contadorDoc.data().numeroActual;
      const numeroNuevo = numeroAnterior + 1;

      // 4. Actualizar el contador en la base de datos con el nuevo número.
      transaction.update(contadorRef, { numeroActual: numeroNuevo });

      // 5. Devolver el nuevo número para usarlo.
      return numeroNuevo;
    });

    // 6. Formatear el número como lo hacías antes.
    return `COT-${String(nuevoNumero).padStart(4, '0')}`;

  } catch (error) {
    console.error("Error al obtener el siguiente número de cotización:", error);
    // Devuelve null o maneja el error como prefieras.
    return null;
  }
}