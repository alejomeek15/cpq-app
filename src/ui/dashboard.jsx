import React from 'react';
import { SidebarTrigger } from '@/ui/sidebar.jsx';

// --- Iconos (Sin cambios) ---
const BookOpen = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const Users = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const FileText = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

const Settings = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

// --- Componente de tarjeta ---
const Card = ({ title, description, icon, route, navigate }) => (
  <button
    onClick={() => navigate(route)}
    className="card bg-slate-800 p-6 rounded-xl border border-slate-700 text-center transition-all transform hover:-translate-y-1 hover:bg-slate-700 w-full"
  >
    <div className="mx-auto text-indigo-400 mb-4">
      {React.cloneElement(icon, { className: "w-10 h-10 mx-auto" })}
    </div>
    <h2 className="text-2xl font-bold text-indigo-400">{title}</h2>
    <p className="mt-2 text-slate-400">{description}</p>
  </button>
);

// --- Componente principal Dashboard ---
const Dashboard = ({ navigate }) => {
  return (
    <div className="w-full">
      {/* El botón del sidebar se renderiza primero en su propia línea */}
      <div className="mb-8">
        <SidebarTrigger />
      </div>

      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-400">Panel de Control Principal</h1>
        <p className="text-lg mt-2 text-gray-400">Selecciona un módulo para comenzar a trabajar.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Catálogo" description="Administra tus productos" icon={<BookOpen />} route="catalog" navigate={navigate} />
        <Card title="Clientes" description="Gestiona tu base de clientes" icon={<Users />} route="clients" navigate={navigate} />
        <Card title="Cotizador" description="Crea y envía cotizaciones" icon={<FileText />} route="quotes" navigate={navigate} />
        <Card title="Configuración" description="Ajusta los parámetros" icon={<Settings />} route="settings" navigate={navigate} />
      </div>
    </div>
  );
};

export default Dashboard;
