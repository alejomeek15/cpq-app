import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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
// (SidebarTrigger ya no se importa aquí)

// --- ¡CAMBIO 1! Aceptar nuevas props ---
const QuotesPage = ({ db, navigate, initialQuoteId, onClearTargetQuote }) => {
    
    // --- ¡CAMBIO 2! Estado inicial inteligente ---
    // Si recibimos un initialQuoteId, empezamos en la vista 'form'
    const [view, setView] = useState(initialQuoteId ? 'form' : 'list');
    // Si recibimos un initialQuoteId, lo usamos como el ID actual
    const [currentQuoteId, setCurrentQuoteId] = useState(initialQuoteId || null);
    
    const [notification, setNotification] = useState(null);
    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(true);

    // useEffect para cargar clientes (sin cambios)
    useEffect(() => {
        const fetchClients = async () => {
            setLoadingClients(true);
            try {
                const querySnapshot = await getDocs(collection(db, "clientes"));
                const clientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setClients(clientsData);
            } catch (error) {
                console.error("Error fetching clients:", error);
                setNotification({
                    type: 'error',
                    title: 'Error de Carga',
                    message: 'No se pudieron cargar los datos de los clientes.'
                });
            } finally {
                setLoadingClients(false);
            }
        };
        fetchClients();
    }, [db]);

    // --- ¡CAMBIO 3! useEffect para limpiar el ID en App.jsx ---
    useEffect(() => {
        // Si cargamos esta página con un ID específico,
        // le decimos a App.jsx que "ya lo usamos".
        if (initialQuoteId) {
            onClearTargetQuote();
        }
        // Lo ejecutamos solo si las props (que vienen de App.jsx) cambian
    }, [initialQuoteId, onClearTargetQuote]);

    // showListView (sin cambios)
    const showListView = (message = null) => {
        setView('list');
        setCurrentQuoteId(null);
        if (message) {
            setNotification({ type: 'success', title: 'Éxito', message: message });
        }
    };

    // showFormView (sin cambios)
    const showFormView = (quoteId = null) => {
        setCurrentQuoteId(quoteId);
        setView('form');
    };

    // renderBreadcrumb (sin cambios, ya reacciona a 'view' y 'currentQuoteId')
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
                  {/* Esto funcionará automáticamente gracias al estado inicial */
                  currentQuoteId ? 'Editar Cotización' : 'Nueva Cotización'}
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
              {/* SidebarTrigger ya no está aquí (está en App.jsx) */}
              {renderBreadcrumb()}
            </div>
            
            {view === 'list' ? (
                <QuoteList 
                    db={db} 
                    onAddNewQuote={() => showFormView(null)} 
                    onEditQuote={showFormView}
                    setNotification={setNotification}
                    clients={clients}
                    loadingClients={loadingClients}
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