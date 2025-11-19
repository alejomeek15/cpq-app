import React from 'react';
import { Avatar, AvatarFallback } from '@/ui/avatar.jsx';

export const UserAvatar = ({ email, className = '' }) => {
  // Obtener la primera letra del email
  const initial = email ? email.charAt(0).toUpperCase() : '?';
  
  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-primary text-primary-foreground">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
};