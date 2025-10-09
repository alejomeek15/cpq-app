import React from 'react';
import { LayoutDashboard, Users, FileText, Settings } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuItem,
  useSidebar,
} from './ui/sidebar';

export const AppSidebar = ({ navigate, route }) => {
  const { toggleSidebar } = useSidebar();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText },
    { id: 'clients', label: 'Clientes', icon: Users },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-sidebar-accent">
                {/* Aquí podrías poner un ícono para colapsar */}
            </button>
            <h2 className="font-bold text-lg">CPQ</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          {menuItems.map((item) => (
            <SidebarMenuItem
              key={item.id}
              icon={item.icon}
              active={route === item.id}
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </SidebarMenuItem>
          ))}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
         <SidebarMenuItem
            icon={Settings}
            active={route === 'settings'}
            onClick={() => navigate('settings')}
         >
            Configuración
         </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
};