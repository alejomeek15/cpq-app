import React from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/ui/theme-provider.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu.jsx';
import { UserAvatar } from '@/ui/UserAvatar.jsx';
import { Button } from '@/ui/button.jsx';

export const UserDropdown = ({ user, onLogout }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Extraer nombre del email (parte antes del @)
  const displayName = user?.email?.split('@')[0] || 'Usuario';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-2 h-auto py-2 hover:bg-sidebar-accent"
        >
          <UserAvatar email={user?.email} className="h-8 w-8" />
          <div className="flex flex-col items-start flex-1 min-w-0">
            <span className="text-sm font-medium truncate w-full">
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground truncate w-full">
              {user?.email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Toggle de Tema */}
        <DropdownMenuItem onClick={toggleTheme}>
          {theme === 'dark' ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              <span>Modo claro</span>
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              <span>Modo oscuro</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={onLogout}
          className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};