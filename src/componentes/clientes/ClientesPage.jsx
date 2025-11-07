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
} from "@/ui/breadcrumb.jsx";

// ¡CAMBIO! Ya NO recibe 'user' ni 'auth' como props
const ClientesPage = ({ db, navigate }) => {
    const [view, setView] = useState('list');
    const [currentClientId, setCurrentClientId] = useState(null);
    const [notification, setNotification] = useState(null);

    const showListView = (message = null) => {
        setView('list');
        setCurrentClientId(null);
        if (message) {
            setNotification({ type: 'success', title: 'Éxito', message: message });
        }
    };

    const showFormView = (clientId = null) => {
        setCurrentClientId(clientId);
        setView('form');
    };

    const showImportView = () => {
        setView('import');
    };

    const renderBreadcrumb = () => (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('dashboard')} className="cursor-pointer">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {view === 'list' ? (
              <BreadcrumbPage>Clientes</BreadcrumbPage>
            ) : (
              <BreadcrumbLink onClick={() => showListView()} className="cursor-pointer">Clientes</BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {view === 'import' && (
            <><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Importar</BreadcrumbPage></BreadcrumbItem></>
          )}
          {view === 'form' && (
             <><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>{currentClientId ? 'Editar Cliente' : 'Nuevo Cliente'}</BreadcrumbPage></BreadcrumbItem></>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );

    // ¡CAMBIO! Simplificado - solo pasamos 'db'
    const renderContent = () => {
        const props = {
            db,
            onBack: (saved) => showListView(saved ? 'Cliente guardado correctamente.' : null)
        };

        switch (view) {
            case 'form':
                return <ClientForm 
                          {...props} 
                          clientId={currentClientId} 
                       />;
            case 'import':
                return <ClientImport {...props} />;
            case 'list':
            default:
                return <ClientList 
                          db={db}
                          onEditClient={showFormView} 
                          onAddNewClient={() => showFormView(null)} 
                          onImportClients={showImportView} 
                          setNotification={setNotification} 
                       />;
        }
    };

    return (
        <div className="w-full">
            <Notification notification={notification} onDismiss={() => setNotification(null)} />

            <div className="mb-8">
              {renderBreadcrumb()}
            </div>

            {renderContent()}
        </div>
    );
};

export default ClientesPage;