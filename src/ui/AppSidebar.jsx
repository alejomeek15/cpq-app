import React from 'react';
import { LayoutDashboard, Users, FileText, Settings } from 'lucide-react';
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
  SidebarTrigger, // Importamos el trigger para el botón
} from './sidebar.jsx';

export const AppSidebar = ({ navigate, route }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText },
    { id: 'clients', label: 'Clientes', icon: Users },
  ];

  return (
    // La prop collapsible="icon" es la clave
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-2">
        <h2 className="font-bold text-lg">CPQ</h2>
        {/* Usamos SidebarTrigger, el botón oficial para colapsar */}
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          {/* El SidebarMenu es el contenedor de los items */}
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => navigate(item.id)}
                  isActive={route === item.id}
                >
                  <item.icon className="size-4" />
                  {/* El span es manejado automáticamente por SidebarMenuButton */}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate('settings')}
              isActive={route === 'settings'}
            >
              <Settings className="size-4" />
              <span>Configuración</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};