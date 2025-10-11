import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// --- Tus importaciones (sin cambios) ---
import { SidebarProvider, SidebarTrigger } from '@/ui/sidebar.jsx';
import { AppSidebar } from '@/ui/AppSidebar.jsx';
import Dashboard from '@/ui/dashboard.jsx';
import Placeholder from '@/ui/placeholder.jsx';
import ClientesPage from '@/componentes/clientes/ClientesPage.jsx';
import CatalogoPage from '@/componentes/catalogo/CatalogoPage.jsx';
import QuotesPage from '@/componentes/cotizador/QuotesPage.jsx';

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

  const renderRoute = () => {
    switch (route) {
      case 'dashboard': return <Dashboard navigate={setRoute} />;
      case 'clients': return <ClientesPage db={db} navigate={setRoute} />;
      case 'catalog': return <CatalogoPage db={db} navigate={setRoute} />;
      case 'quotes': return <QuotesPage db={db} navigate={setRoute} />;
      case 'settings': return <Placeholder title="Configuración" />;
      default: return <Dashboard navigate={setRoute} />;
    }
  };

  return (
    // --- ¡CAMBIO CLAVE AQUÍ! ---
    // 1. SidebarProvider es ahora el elemento principal.
    // 2. Le pasamos las clases de estilo directamente a él.
    <SidebarProvider className="min-h-screen bg-gray-900 text-white">
      <AppSidebar navigate={setRoute} route={route} />
      
      <main className="flex-1 flex flex-col">
        <header className="p-4 md:hidden">
          <SidebarTrigger />
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderRoute()}
        </div>
      </main>
    </SidebarProvider>
  );
}