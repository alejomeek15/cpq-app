import React from 'react';
import {
  AlertDialog as RadixAlertDialog, // Renombrado para evitar conflicto de nombres
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

/**
 * Un diálogo de confirmación genérico y controlado por estado.
 * @param {boolean} isOpen - Controla si el diálogo está visible.
 * @param {Function} onClose - Función que se llama al cancelar/cerrar.
 * @param {Function} onConfirm - Función que se llama al confirmar la acción.
 * @param {string} title - El título del diálogo.
 * @param {string} description - El mensaje de descripción/advertencia.
 */
const AlertDialog = ({ isOpen, onClose, onConfirm, title, description }) => {
  return (
    <RadixAlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            onConfirm();
            onClose();
          }}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </RadixAlertDialog>
  );
};

export default AlertDialog;