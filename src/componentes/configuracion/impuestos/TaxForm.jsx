import React, { useState, useEffect } from 'react';
import { collection, doc, addDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth'; // ¡NUEVO!
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { Textarea } from '@/ui/textarea.jsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card.jsx";

// ¡CAMBIO! Ya NO recibe 'user' como prop
const TaxForm = ({ onBack, db, tax, itemCount }) => {
  // ¡NUEVO! Obtener user del Context
  const { user } = useAuth();

  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tax) {
      setFormData({ nombre: tax.nombre, descripcion: tax.descripcion || '' });
    } else {
      setFormData({ nombre: '', descripcion: '' });
    }
  }, [tax]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ¡CAMBIO! handleSubmit ahora usa la ruta anidada
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ¡NUEVO! Validar que el usuario esté autenticado
    if (!user || !user.uid) {
      setError('Error: Usuario no autenticado.');
      return;
    }

    if (!formData.nombre) {
      setError('El nombre del impuesto es requerido.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (tax) {
        // ¡CAMBIO! Ruta anidada para actualizar
        const docRef = doc(db, 'usuarios', user.uid, 'impuestos', tax.id);
        await updateDoc(docRef, { 
          nombre: formData.nombre, 
          descripcion: formData.descripcion 
        });
      } else {
        // ¡CAMBIO! Ruta anidada para crear
        const collectionRef = collection(db, 'usuarios', user.uid, 'impuestos');
        await addDoc(collectionRef, {
          ...formData,
          posicion: itemCount,
          activo: true
        });
      }
      onBack(true);
    } catch (error) {
      console.error("Error al guardar el impuesto:", error);
      setError('Error al guardar el impuesto.');
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{tax ? 'Editar Impuesto' : 'Nuevo Impuesto'}</CardTitle>
        <CardDescription>
          {tax ? 'Modifica los detalles del impuesto.' : 'Añade un nuevo impuesto para usar en tus cotizaciones.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="nombre" className="text-sm font-medium leading-none text-foreground">
              Nombre
            </label>
            <Input 
              id="nombre" 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleChange} 
              placeholder="Ej: IVA 19%" 
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="descripcion" className="text-sm font-medium leading-none text-foreground">
              Descripción
            </label>
            <Textarea 
              id="descripcion" 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange} 
              placeholder="Ej: Impuesto al Valor Agregado"
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => onBack(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TaxForm;