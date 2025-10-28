// --- /Users/alejomeek/Documents/cpq-app/src/ui/alert-dialog.jsx (Refactorizado) ---
import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Button } from '@/ui/button.jsx' // <-- ¡CAMBIO 1! Importar Button

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
    ref={ref}
  />
))

const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-glow rounded-large duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))

const AlertDialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
)

const AlertDialogFooter = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
)

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title 
    ref={ref} 
    // --- ¡CAMBIO 2! 'text-text-primary' -> 'text-foreground' ---
    className={cn('text-lg font-semibold text-foreground', className)} 
    {...props} 
  />
))

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description 
    ref={ref} 
    // --- ¡CAMBIO 3! 'text-text-secondary' -> 'text-muted-foreground' ---
    className={cn('text-sm text-muted-foreground', className)} 
    {...props} 
  />
))

// --- ¡CAMBIO 4! Eliminada la función 'buttonVariants' ---

// --- ¡CAMBIO 5! AlertDialogAction usa Button ---
const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action ref={ref} asChild>
    <Button variant="destructive" className={className} {...props} />
  </AlertDialogPrimitive.Action>
))

// --- ¡CAMBIO 6! AlertDialogCancel usa Button ---
const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel ref={ref} asChild>
    <Button variant="outline" className={cn('mt-2 sm:mt-0', className)} {...props} />
  </AlertDialogPrimitive.Cancel>
))

export {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogFooter, AlertDialogTitle, AlertDialogDescription,
  AlertDialogAction, AlertDialogCancel
}