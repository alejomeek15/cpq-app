import React, { useState } from 'react';
import QuoteList from './QuoteList';
import QuoteForm from './QuoteForm';
import Notification from '../comunes/Notification.jsx'; // Importa el componente de notificación
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/breadcrumb.jsx";

// Componente principal que controla qué vista se muestra en el módulo de cotizaciones.
const QuotesPage = ({ db, navigate }) => {
    // El estado 'view' puede ser 'list' o 'form'.
    const [view, setView] = useState('list');
    
    // 'currentQuoteId' almacena el ID de la cotización a editar.
    // Si es null, el formulario se abrirá en modo de creación.
    const [currentQuoteId, setCurrentQuoteId] = useState(null);

    // Estado para manejar la notificación.
    const [notification, setNotification] = useState(null);

    // Funciones para cambiar entre las vistas.
    const showListView = (message = null) => {
        setView('list');
        setCurrentQuoteId(null);
        // Si se pasa un mensaje, muestra la notificación de éxito.
        if (message) {
            setNotification({
                type: 'success',
                title: 'Éxito',
                message: message
            });
        }
    };

    const showFormView = (quoteId = null) => {
        setCurrentQuoteId(quoteId);
        setView('form');
    };

    // --- Renderizado del Breadcrumb ---
    const renderBreadcrumb = () => (
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('dashboard')} className="cursor-pointer">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {view === 'list' ? (
              <BreadcrumbPage>Cotizaciones</BreadcrumbPage>
            ) : (
              <BreadcrumbLink onClick={() => showListView()} className="cursor-pointer">
                Cotizaciones
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {view === 'form' && (
             <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {currentQuoteId ? 'Editar Cotización' : 'Nueva Cotización'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Notification notification={notification} onDismiss={() => setNotification(null)} />
            {renderBreadcrumb()}
            
            {/* Renderizado condicional basado en el estado 'view'. */}
            {view === 'list' ? (
                <QuoteList 
                    db={db} 
                    onAddNewQuote={() => showFormView(null)} 
                    onEditQuote={showFormView}
                    setNotification={setNotification} // Pasa la función para mostrar notificaciones
                />
            ) : (
                <QuoteForm 
                    db={db} 
                    quoteId={currentQuoteId} 
                    // --- ¡CAMBIO REALIZADO AQUÍ! ---
                    // Ahora onBack espera un parámetro 'saved'.
                    // El mensaje solo se muestra si 'saved' es true.
                    onBack={(saved) => showListView(saved ? 'Cotización guardada correctamente.' : null)} 
                />
            )}
        </div>
    );
};

export default QuotesPage;