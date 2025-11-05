// --- src/App.jsx (Actualizado para manejar Autenticación) ---
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// --- ¡CAMBIOS EN IMPORTACIONES DE AUTH! ---
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'; // Ya no importamos signInAnonymously

import { ThemeProvider } from '@/ui/theme-provider.jsx';
import { ModeToggle } from '@/ui/mode-toggle.jsx';
import { SidebarTrigger } from '@/ui/sidebar.jsx';

// Importa los componentes principales del layout y las páginas
import { SidebarProvider } from '@/ui/sidebar.jsx';
import { AppSidebar } from '@/ui/AppSidebar.jsx'; // Asumo que AppSidebar ahora recibirá 'auth' y 'user'
import Dashboard from '@/ui/dashboard.jsx';
import ClientesPage from '@/componentes/clientes/ClientesPage.jsx';
import CatalogoPage from '@/componentes/catalogo/CatalogoPage.jsx';
import QuotesPage from '@/componentes/cotizador/QuotesPage.jsx';
import SettingsPage from '@/componentes/configuracion/SettingsPage.jsx';

// --- ¡NUEVO! Importar la página de Login ---
import LoginPage from '@/componentes/login/LoginPage.jsx';

// Configuración de Firebase (sin cambios)
const firebaseConfig = window.firebaseConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ¡NUEVO! Un componente de carga simple ---
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

export default function App() {
  const [route, setRoute] = useState('dashboard');
  const [targetQuoteId, setTargetQuoteId] = useState(null);

  // --- ¡NUEVO! Estado de Autenticación ---
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // --- ¡NUEVO! useEffect para escuchar el estado de Auth ---
  useEffect(() => {
    // onAuthStateChanged devuelve una función "unsubscribe"
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuario está logueado
        setUser(user);
      } else {
        // Usuario está deslogueado
        setUser(null);
      }
      // Terminamos de comprobar la autenticación
      setLoadingAuth(false);
    });

    // Limpiamos el "listener" al desmontar el componente
    return () => unsubscribe();
  }, []); // El array vacío asegura que esto solo se ejecute una vez

  // --- (Función de navegación y limpieza sin cambios) ---
  const handleNavigate = (newRoute, payload = null) => {
    setRoute(newRoute);
    setTargetQuoteId(payload);
  };
  const clearTargetQuote = () => {
    setTargetQuoteId(null);
  };

  // --- ¡CAMBIO! renderRoute ahora pasa 'db', 'auth', y 'user' ---
  const renderRoute = () => {
    const props = { db, auth, user, navigate: handleNavigate };
    switch (route) {
      case 'dashboard': 
        return <Dashboard {...props} />;
      case 'clients': 
        return <ClientesPage {...props} />;
      case 'catalog': 
        return <CatalogoPage {...props} />;
      case 'quotes': 
        return (
          <QuotesPage
            {...props}
            initialQuoteId={targetQuoteId}
            onClearTargetQuote={clearTargetQuote}
          />
        );
      case 'settings': 
        return <SettingsPage {...props} />;
      default: 
        return <Dashboard {...props} />;
    }
  };

  // --- ¡NUEVO! Lógica de renderizado principal ---
  
  // 1. Mostrar pantalla de carga mientras se comprueba el usuario
  if (loadingAuth) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="cpq-app-theme">
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  // 2. Si no hay usuario, mostrar la página de Login
  if (!user) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="cpq-app-theme">
        <LoginPage auth={auth} />
      </ThemeProvider>
    );
  }

  // 3. Si hay usuario, mostrar la aplicación principal
  return (
    <ThemeProvider defaultTheme="dark" storageKey="cpq-app-theme">
      <SidebarProvider className="min-h-screen bg-background text-foreground">
        {/* Pasamos 'auth' y 'user' por si el sidebar necesita un botón de "Cerrar Sesión" */}
        <AppSidebar navigate={handleNavigate} route={route} auth={auth} user={user} />

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="flex justify-between items-center mb-8">
            <SidebarTrigger />
            <ModeToggle />
          </div>
          
          {renderRoute()}
        </main>
      </SidebarProvider>
    </ThemeProvider>
  );
}