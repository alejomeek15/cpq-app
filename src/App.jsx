// --- src/App.jsx (Updated with SidebarTrigger) ---
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

import { ThemeProvider } from '@/ui/theme-provider.jsx';
import { ModeToggle } from '@/ui/mode-toggle.jsx';
// --- ADD THIS IMPORT ---
import { SidebarTrigger } from '@/ui/sidebar.jsx';

// Import layout and page components
import { SidebarProvider } from '@/ui/sidebar.jsx';
import { AppSidebar } from '@/ui/AppSidebar.jsx'; // Make sure path is correct
import Dashboard from '@/ui/dashboard.jsx'; // Make sure path is correct
import ClientesPage from '@/componentes/clientes/ClientesPage.jsx';
import CatalogoPage from '@/componentes/catalogo/CatalogoPage.jsx';
import QuotesPage from '@/componentes/cotizador/QuotesPage.jsx';
import SettingsPage from '@/componentes/configuracion/SettingsPage.jsx';

// Firebase config (no changes)
const firebaseConfig = window.firebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [route, setRoute] = useState('dashboard');

  useEffect(() => {
    signInAnonymously(auth).catch((error) => console.error("Error de autenticación anónima", error));
  }, []);

  // Function to render the current page based on the route (no changes)
  const renderRoute = () => {
    switch (route) {
      case 'dashboard': return <Dashboard db={db} navigate={setRoute} />;
      case 'clients': return <ClientesPage db={db} navigate={setRoute} />;
      case 'catalog': return <CatalogoPage db={db} navigate={setRoute} />; // Assuming Catalog page exists and is theme-aware
      case 'quotes': return <QuotesPage db={db} navigate={setRoute} />;
      case 'settings': return <SettingsPage db={db} navigate={setRoute} />;
      default: return <Dashboard db={db} navigate={setRoute} />;
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="cpq-app-theme">

      <SidebarProvider className="min-h-screen bg-background text-foreground">
        {/* AppSidebar component (no ModeToggle inside anymore) */}
        <AppSidebar navigate={setRoute} route={route} />

        {/* Main content area */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-w-0">

          {/* --- MODIFIED DIV FOR BOTH TRIGGERS --- */}
          {/* Uses flex, justify-between, and items-center */}
          <div className="flex justify-between items-center mb-8"> {/* Increased bottom margin */}
            <SidebarTrigger /> {/* Sidebar toggle on the left */}
            <ModeToggle />   {/* Theme toggle on the right */}
          </div>
          {/* --- END MODIFICATION --- */}

          {/* Page content rendered below */}
          {renderRoute()}

        </main>
      </SidebarProvider>
    </ThemeProvider>
  );
}