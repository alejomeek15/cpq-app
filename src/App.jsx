import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Importa los componentes principales del layout y las páginas
import { SidebarProvider } from '@/ui/sidebar.jsx';
import { AppSidebar } from '@/ui/AppSidebar.jsx';
import Dashboard from '@/ui/dashboard.jsx';
import ClientesPage from '@/componentes/clientes/ClientesPage.jsx';
import CatalogoPage from '@/componentes/catalogo/CatalogoPage.jsx';
import QuotesPage from '@/componentes/cotizador/QuotesPage.jsx';
import SettingsPage from '@/componentes/configuracion/SettingsPage.jsx';

// Configuración de Firebase (sin cambios)
const firebaseConfig = window.firebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [route, setRoute] = useState('dashboard');

  useEffect(() => {
    signInAnonymously(auth).catch((error) => console.error("Error de autenticación anónima", error));
  }, []);

  // Función para renderizar la página actual según la ruta
  const renderRoute = () => {
    switch (route) {
      // --- ¡CAMBIO AQUÍ! ---
      // 1. Se añade la prop 'db' al Dashboard.
      case 'dashboard': return <Dashboard db={db} navigate={setRoute} />;
      
      case 'clients': return <ClientesPage db={db} navigate={setRoute} />;
      case 'catalog': return <CatalogoPage db={db} navigate={setRoute} />;
      case 'quotes': return <QuotesPage db={db} navigate={setRoute} />;
      case 'settings': return <SettingsPage db={db} navigate={setRoute} />;
      
      // 2. También se añade 'db' al caso por defecto.
      default: return <Dashboard db={db} navigate={setRoute} />;
    }
  };

  return (
    <SidebarProvider className="min-h-screen bg-gray-900 text-white">
      <AppSidebar navigate={setRoute} route={route} />
      
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
        {renderRoute()}
      </main>
    </SidebarProvider>
  );
}