import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth'; // ¡NUEVO!
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

// ¡CAMBIO! Ya NO recibe 'user' ni 'auth' como props
const QuotesPage = ({ db, navigate, initialQuoteId, onClearTargetQuote }) => {
    // ¡NUEVO! Obtener user del Context
    const { user } = useAuth();
    
    const [view, setView] = useState(initialQuoteId ? 'form' : 'list');
    const [currentQuoteId, setCurrentQuoteId] = useState(initialQuoteId || null);
    
    const [notification, setNotification] = useState(null);
    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(true);

    // ¡CAMBIO! useEffect para cargar clientes DEL USUARIO
    useEffect(() => {
        const fetchClients = async () => {
            // ¡NUEVO! Validar que el usuario esté autenticado
            if (!user || !user.uid) {
                setLoadingClients(false);
                return;
            }

            setLoadingClients(true);
            try {
                // ¡CAMBIO! Ruta anidada con user.uid
                const querySnapshot = await getDocs(
                    collection(db, "usuarios", user.uid, "clientes")
                );
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
    }, [db, user]); // ¡CAMBIO! Añadir 'user' a las dependencias

    useEffect(() => {
        if (initialQuoteId) {
            onClearTargetQuote();
        }
    }, [initialQuoteId, onClearTargetQuote]);

    const showListView = (message = null) => {
        setView('list');
        setCurrentQuoteId(null);
        if (message) {
            setNotification({ type: 'success', title: 'Éxito', message: message });
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