import React from 'react'; // <-- 1. Importar React para forwardRef
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// --- 2. Envolver el componente en React.forwardRef ---
// Añadimos { isDragging, ...props } y 'ref'
const QuoteCard = React.forwardRef(({ quote, isDragging, ...props }, ref) => {
  
  // Función de ayuda para los badges de estado (sin cambios)
  const getStatusBadge = (status = 'Borrador') => {
    const s = status.toLowerCase().replace(/\s/g, '-');
    const styles = {
        'borrador': 'bg-blue-500/10 text-blue-400', 'aprobada': 'bg-green-500/10 text-green-400',
        'rechazada': 'bg-red-500/10 text-red-400', 'enviada': 'bg-amber-500/10 text-amber-400',
        'en-negociacion': 'bg-purple-500/10 text-purple-400', 'vencida': 'bg-gray-500/10 text-gray-400'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[s] || 'bg-gray-500/10 text-gray-400'}`;
  };

  // Formateo de fecha (sin cambios)
  const formattedDate = quote.fechaCreacion 
    ? format(quote.fechaCreacion.toDate(), 'PPP', { locale: es }) 
    : 'Sin fecha';

  // --- 3. Aplicar estilo de opacidad si se está arrastrando ---
  const style = {
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
  };

  return (
    // --- 4. Pasar la ref, el style y las ...props al div raíz ---
    <div 
      ref={ref} 
      style={style} 
      {...props} 
      className="bg-slate-800 p-4 rounded-lg border border-slate-700 h-full flex flex-col justify-between transition-colors hover:bg-slate-700"
    >
      {/* Cabecera de la tarjeta (sin cambios) */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-white truncate">{quote.numero}</h3>
          <p className="text-sm text-slate-400 truncate">{quote.clienteNombre}</p>
        </div>
        <span className={getStatusBadge(quote.estado)}>{quote.estado}</span>
      </div>

      {/* Pie de la tarjeta (sin cambios) */}
      <div className="mt-4 flex justify-between items-end">
        <span className="text-xs text-slate-500">{formattedDate}</span>
        <span className="font-semibold text-white">
          ${(quote.total || 0).toFixed(2)}
        </span>
      </div>
    </div>
  );
});

export default QuoteCard;