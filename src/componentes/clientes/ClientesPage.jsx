import React, { useState } from 'react';
import ClientList from './ClientList.jsx';
import ClientForm from './ClientForm.jsx';
import ClientImport from './ClientImport.jsx';
import Notification from '../comunes/Notification.jsx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';

// Este componente actúa como un controlador o "router" para el módulo de clientes.
// Decide qué vista mostrar: la lista, el formulario o la pantalla de importación.
const ClientesPage = ({ db, navigate }) => {
    // 'view' puede ser 'list', 'form', o 'import'
    const [view, setView] = useState('list');
    
    // 'currentClientId' se usa para pasar el ID del cliente al formulario cuando se va a editar.
    // Si es null, el formulario estará en modo "crear".
    const [currentClientId, setCurrentClientId] = useState(null);
    
    // Estado para manejar la notificación.
    const [notification, setNotification] = useState(null);

    // --- Funciones para navegar entre vistas ---

    const showListView = (message = null) => {
        setView('list');
        setCurrentClientId(null);
        if (message) {
            setNotification({
                type: 'success',
                title: 'Éxito',
                message: message
            });
        }
    };

    const showFormView = (clientId = null) => {
        setCurrentClientId(clientId);
        setView('form');
    };

    const showImportView = () => {
        setView('import');
    };

    // --- Renderizado del Breadcrumb ---
    // Construye las "migas de pan" según la vista actual.
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
              <BreadcrumbPage>Clientes</BreadcrumbPage>
            ) : (
              <BreadcrumbLink onClick={() => showListView()} className="cursor-pointer">
                Clientes
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {view === 'import' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Importar</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          {view === 'form' && (
             <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {currentClientId ? 'Editar Cliente' : 'Nuevo Cliente'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );

    // --- Renderizado Condicional ---
    // Basado en el estado 'view', se renderiza el componente correspondiente.
    const renderContent = () => {
        switch (view) {
            case 'form':
                return <ClientForm db={db} clientId={currentClientId} onBack={() => showListView('Cliente guardado correctamente.')} />;
            case 'import':
                return <ClientImport db={db} onBack={showListView} />;
            case 'list':
            default:
                return <ClientList db={db} onEditClient={showFormView} onAddNewClient={() => showFormView(null)} onImportClients={showImportView} setNotification={setNotification} />;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Notification notification={notification} onDismiss={() => setNotification(null)} />
            {renderBreadcrumb()}
            {renderContent()}
        </div>
    );
};

export default ClientesPage;