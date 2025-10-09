import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper para combinar clases de Tailwind
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 1. Contexto para manejar el estado del Sidebar
const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = useCallback(() => setIsOpen(prev => !prev), []);
  
  const value = useMemo(() => ({ isOpen, toggleSidebar }), [isOpen, toggleSidebar]);

  return (
    <SidebarContext.Provider value={value}>
      <div className="flex h-screen overflow-hidden">{children}</div>
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// 2. Componente principal del Sidebar
export const Sidebar = ({ children }) => {
  const { isOpen } = useSidebar();
  return (
    <aside className={cn(
      "bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out flex flex-col",
      isOpen ? "w-64" : "w-16"
    )}>
      {children}
    </aside>
  );
};

// 3. Componentes estructurales (Header, Content, Footer)
export const SidebarHeader = ({ children }) => (
  <div className="p-4 border-b border-sidebar-border flex-shrink-0">{children}</div>
);

export const SidebarContent = ({ children, className }) => (
  <div className={cn("flex-grow overflow-y-auto", className)}>{children}</div>
);

export const SidebarFooter = ({ children }) => (
  <div className="p-4 border-t border-sidebar-border flex-shrink-0">{children}</div>
);

// 4. Componentes de Menú
export const SidebarGroup = ({ children }) => (
  <div className="py-4 px-3">{children}</div>
);

export const SidebarGroupLabel = ({ children }) => (
  <h3 className="text-xs font-semibold text-sidebar-accent-foreground mb-2 px-1">
    {children}
  </h3>
);

export const SidebarMenuItem = ({ icon: Icon, children, active, onClick }) => {
  const { isOpen } = useSidebar();
  return (
    <button onClick={onClick} className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
      active 
        ? "bg-sidebar-primary text-sidebar-primary-foreground" 
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    )}>
      {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
      <span className={cn("truncate transition-opacity duration-200", !isOpen && "opacity-0 w-0")}>
        {children}
      </span>
    </button>
  );
};

// 5. Contenedor del contenido principal de la página
export const MainContent = ({ children }) => (
  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
    {children}
  </main>
);