import React from 'react';

/**
 * Componente que renderiza la tarjeta específica para una cotización.
 */
const QuoteCard = ({ quote }) => {
  // Función para obtener el color del badge de estado
  const getStatusStyle = (status = 'Borrador') => {
    const s = status.toLowerCase().replace(/\s/g, '-');
    const styles = {
        'borrador': 'bg-blue-500 text-blue-100',
        'enviada': 'bg-amber-500 text-amber-100',
        'en-negociación': 'bg-purple-500 text-purple-100',
        'aprobada': 'bg-green-500 text-green-100',
        'rechazada': 'bg-red-500 text-red-100',
        'vencida': 'bg-gray-600 text-gray-300',
    };
    return styles[s] || styles.borrador;
  };

  // Formateador de moneda para un estilo consistente
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2 }).format(amount || 0);
  };
  
  // Formateador de fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Sin fecha';
    return timestamp.toDate().toLocaleDateString('es-CO', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 transition-colors cursor-pointer h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-white truncate">{quote.clienteNombre || 'Sin Cliente'}</h3>
          <span className="font-semibold text-white">{formatCurrency(quote.total)}</span>
        </div>
        <p className="text-sm text-gray-400">{quote.numero || 'S00000'}</p>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          {formatDate(quote.fechaCreacion)}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </p>
      </div>
      <div className="text-right mt-4">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(quote.estado)}`}>
          {quote.estado || 'Borrador'}
        </span>
      </div>
    </div>
  );
};

export default QuoteCard;