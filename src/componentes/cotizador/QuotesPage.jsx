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
import { SidebarTrigger } from '@/ui/sidebar.jsx';

const QuotesPage = ({ db, navigate }) => {
    // **CORRECCIÓN AQUÍ: Se eliminó el '=' extra**
    const [view, setView] = useState('list');
    const [currentQuoteId, setCurrentQuoteId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
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
                <SidebarTrigger />
                <div className="mt-4">
                  {renderBreadcrumb()}
                </div>
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