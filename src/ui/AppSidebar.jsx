// --- AppSidebar.jsx ---
import React from 'react';
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
} from './sidebar.jsx';
import { useSidebar } from './sidebar.jsx';
import { ModeToggle } from '@/ui/mode-toggle.jsx'; // <-- ¡CAMBIO 1! Importar el Toggle

export const AppSidebar = ({ navigate, route }) => {
  const { state } = useSidebar();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'catalog', label: 'Catálogo', icon: BookOpen },
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
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarMenu>
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

      {/* --- ¡CAMBIO 2! Añadimos el ModeToggle al Footer --- */}
      <SidebarFooter>
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  );
};