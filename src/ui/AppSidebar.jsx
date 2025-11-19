// --- AppSidebar.jsx (Updated) ---
import React from 'react';
import { LayoutDashboard, Users, FileText, Settings, BookOpen } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './sidebar.jsx';
import { useSidebar } from './sidebar.jsx';
import { UserDropdown } from './UserDropdown.jsx';
import { useAuth } from '@/context/useAuth';
import { getAuth, signOut } from 'firebase/auth';

export const AppSidebar = ({ navigate, route }) => {
  const { state } = useSidebar();
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'catalog', label: 'Catálogo', icon: BookOpen },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      // El AuthContext manejará la actualización del estado
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-between p-2">
        <div className="relative h-7 w-full flex items-center justify-center">
          <span
            className={`font-bold text-xl whitespace-nowrap transition-opacity duration-300 ${
              state === 'expanded' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            CePeQu
          </span>
          <span
            className={`font-bold text-xl absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${
              state === 'collapsed' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            CPQ
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => navigate(item.id)}
                  isActive={route === item.id}
                  className="text-base"
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <UserDropdown user={user} onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  );
};