import React, { useState } from 'react';
import QuoteList from './QuoteList';
import QuoteForm from './QuoteForm';
import Notification from '../comunes/Notification.jsx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/ui/breadcrumb.jsx';
import { SidebarTrigger } from '@/ui/sidebar.jsx';

// Componente principal que controla qué vista se muestra en el módulo de cotizaciones.
const QuotesPage = ({ db, navigate }) => {
    const [view, setView] = useState('list');
    const [currentQuoteId, setCurrentQuoteId] = useState(null);
    const [notification, setNotification] = useState(null);

    // Funciones para cambiar entre las vistas.
    const showListView = (message = null) => {
        setView('list');
        setCurrentQuoteId(null);
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
    // Se quita el margen de aquí para controlar el espaciado desde el layout principal.
    const renderBreadcrumb = () => (
      <Breadcrumb>
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
        <div className="w-full">
            <Notification notification={notification} onDismiss={() => setNotification(null)} />
            
            <div className="mb-8">
                {/* El botón del sidebar se renderiza primero en su propia línea */}
                <SidebarTrigger />

                {/* El Breadcrumb se renderiza debajo, con un pequeño margen superior para separarlo */}
                <div className="mt-4">
                  {renderBreadcrumb()}
                </div>
            </div>
            
            {/* Renderizado condicional basado en el estado 'view'. */}
            {view === 'list' ? (
                <QuoteList 
                    db={db} 
                    onAddNewQuote={() => showFormView(null)} 
                    onEditQuote={showFormView}
                    setNotification={setNotification}
                />
            ) : (
                <QuoteForm 
                    db={db} 
                    quoteId={currentQuoteId} 
                    onBack={(saved) => showListView(saved ? 'Cotización guardada correctamente.' : null)} 
                />
            )}
        </div>
    );
};

export default QuotesPage;