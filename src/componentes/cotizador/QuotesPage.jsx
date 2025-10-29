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
// --- REMOVE SidebarTrigger import ---
// import { SidebarTrigger } from '@/ui/sidebar.jsx';

const QuotesPage = ({ db, navigate }) => {
    const [view, setView] = useState('list');
    const [currentQuoteId, setCurrentQuoteId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(true);

    // useEffect to fetch clients (no changes)
    useEffect(() => {
        const fetchClients = async () => {
            setLoadingClients(true); // Set loading true at the start
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

    // showListView function (no changes)
    const showListView = (message = null) => {
        setView('list');
        setCurrentQuoteId(null);
        if (message) {
            setNotification({ type: 'success', title: 'Éxito', message: message });
        }
    };

    // showFormView function (no changes)
    const showFormView = (quoteId = null) => {
        setCurrentQuoteId(quoteId);
        setView('form');
    };

    // renderBreadcrumb function (no changes)
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

            {/* --- REMOVE SidebarTrigger and adjust structure --- */}
            {/* Breadcrumb now sits directly here, mb-8 gives it space */}
            <div className="mb-8">
              {renderBreadcrumb()}
            </div>

            {/* Conditional rendering for List or Form (no changes) */}
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