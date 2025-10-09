import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// --- NUEVA ESTRUCTURA DE COMPONENTES ---
import { SidebarProvider, MainContent } from './componentes/ui/sidebar';
import { AppSidebar } from './componentes/AppSidebar';
import Dashboard from './componentes/dashboard';
import ClientesPage from './componentes/clientes/ClientesPage';
import CatalogoPage from './componentes/catalogo/CatalogoPage';
import QuotesPage from './componentes/cotizador/QuotesPage';
import Placeholder from './componentes/placeholder';

// Configuración de Firebase (sin cambios)
const firebaseConfig = window.firebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ... (imports)

export default function App() {
  const [route, setRoute] = useState('dashboard');
  const db = getFirestore(app);

  useEffect(() => { /* ... autenticación ... */ }, []);

  const renderRoute = () => {
    switch (route) {
      case 'dashboard':
        return <Dashboard navigate={setRoute} />;
      case 'clients':
        // --- CAMBIO AQUÍ ---
        return <ClientesPage db={db} navigate={setRoute} />; 
      case 'catalog':
        return <CatalogoPage db={db} navigate={setRoute} />;
      case 'quotes':
        // --- Y CAMBIO AQUÍ ---
        return <QuotesPage db={db} navigate={setRoute} />; 
      case 'settings':
        return <Placeholder title="Configuración" />;
      default:
        return <Dashboard navigate={setRoute} />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar navigate={setRoute} route={route} />
      <MainContent>
        {renderRoute()}
      </MainContent>
    </SidebarProvider>
  );
}