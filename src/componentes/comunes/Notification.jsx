import React, { useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';

/**
 * Muestra una notificación 'toast' en la esquina superior derecha.
 * @param {object} notification - El objeto de notificación con { type, title, message }.
 * @param {Function} onDismiss - La función para descartar la notificación.
 */
const Notification = ({ notification, onDismiss }) => {
  useEffect(() => {
    // Establece un temporizador para cerrar la notificación automáticamente después de 4 segundos.
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);

    // Limpia el temporizador si el componente se desmonta.
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!notification) return null;

  const isSuccess = notification.type === 'success';

  return (
    <div className="fixed top-8 right-8 z-50 w-full max-w-sm animate-fade-in-down">
      <Alert variant={isSuccess ? 'default' : 'destructive'} className="shadow-lg">
        {isSuccess ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        <AlertTitle>{notification.title}</AlertTitle>
        <AlertDescription>{notification.message}</AlertDescription>
      </Alert>
    </div>
  );
};

export default Notification;