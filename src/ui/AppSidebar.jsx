import React from 'react';
// --- ¡CAMBIO 1! --- Importamos el ícono para el Catálogo
import { LayoutDashboard, Users, FileText, Settings, BookOpen } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from './sidebar.jsx';
import { useSidebar } from './sidebar.jsx';

export const AppSidebar = ({ navigate, route }) => {
  const { state } = useSidebar();

  // --- ¡CAMBIO 2! --- Añadimos "Catálogo" a la lista de items del menú
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'catalog', label: 'Catálogo', icon: BookOpen }, // <-- NUEVO ITEM
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-2">
        <div className="relative h-7 w-full flex items-center justify-center">
          <span
            className={`font-bold text-lg whitespace-nowrap transition-opacity duration-300 ${
              state === 'expanded' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Cepequ
          </span>
          <span
            className={`font-bold text-lg absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${
              state === 'collapsed' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            CPQ
          </span>
        </div>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarMenu>
            {/* El .map() renderizará automáticamente el nuevo item sin cambios aquí */}
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => navigate(item.id)}
                  isActive={route === item.id}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
};