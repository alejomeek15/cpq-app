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
// --- REMOVE SidebarTrigger import ---
// import { SidebarTrigger } from '@/ui/sidebar.jsx';

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

    const renderContent = () => {
        switch (view) {
            case 'form':
                return <ClientForm db={db} clientId={currentClientId} onBack={(saved) => showListView(saved ? 'Cliente guardado correctamente.' : null)} />;
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

            {/* --- REMOVE SidebarTrigger and adjust structure --- */}
            {/* The Breadcrumb now sits directly here, mb-8 gives it space */}
            <div className="mb-8">
              {renderBreadcrumb()}
            </div>

            {renderContent()}
        </div>
    );
};

export default ClientesPage;