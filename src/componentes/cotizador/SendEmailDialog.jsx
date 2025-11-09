import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Alert, AlertDescription } from "@/ui/alert";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export const SendEmailDialog = ({ 
  open, 
  onOpenChange, 
  client, 
  quote,
  onSend,
  sending 
}) => {
  const [email, setEmail] = useState(client?.email || '');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!email) {
      setError('Por favor ingresa un email');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    try {
      setError(null);
      await onSend(email);
      setSent(true);
      
      // Cerrar después de 2 segundos
      setTimeout(() => {
        onOpenChange(false);
        setSent(false);
        setEmail(client?.email || '');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al enviar email');
    }
  };

  // Reset al cerrar
  const handleClose = () => {
    if (!sending && !sent) {
      onOpenChange(false);
      setError(null);
      setEmail(client?.email || '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Cotización por Email
          </DialogTitle>
          <DialogDescription>
            Se enviará la cotización <strong>{quote?.numero}</strong> a <strong>{client?.nombre}</strong>
          </DialogDescription>
        </DialogHeader>

        {!sent ? (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email del Cliente *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@empresa.com"
                  disabled={sending}
                  autoFocus
                />
                {!client?.email && (
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Este cliente no tiene email registrado. Por favor ingrésalo manualmente.
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p><strong>Cotización:</strong> {quote?.numero}</p>
                <p><strong>Cliente:</strong> {client?.nombre}</p>
                <p><strong>Total:</strong> ${quote?.total?.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</p>
                <p><strong>Vencimiento:</strong> {quote?.vencimiento ? new Date(quote.vencimiento).toLocaleDateString('es-CO') : 'No especificado'}</p>
                <p className="text-primary font-medium mt-3">✓ Se incluirá PDF adjunto</p>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={sending}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSend}
                disabled={sending || !email}
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto animate-pulse" />
            <div>
              <h3 className="text-lg font-semibold">¡Email Enviado!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                La cotización fue enviada exitosamente a
              </p>
              <p className="text-sm font-medium text-foreground">{email}</p>
              <p className="text-xs text-muted-foreground mt-4">
                El estado de la cotización se actualizó a "Enviada"
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};