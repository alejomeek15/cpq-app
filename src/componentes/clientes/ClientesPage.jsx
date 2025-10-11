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
import { SidebarTrigger } from '@/ui/sidebar.jsx';

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

    // Quitamos el margen de aquí para controlar el espaciado desde el layout principal.
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

            {renderContent()}
        </div>
    );
};

export default ClientesPage;