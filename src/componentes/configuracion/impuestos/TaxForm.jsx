import React, { useState, useEffect } from 'react';
import { collection, doc, addDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { Textarea } from '@/ui/textarea.jsx'; // Assuming Textarea is theme-aware
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card.jsx";

const TaxForm = ({ onBack, db, tax, itemCount }) => {
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [loading, setLoading] = useState(false);

  // useEffect and handleChange (no changes needed)
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

  // handleSubmit logic (no changes needed)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre) return;
    setLoading(true);
    try {
      if (tax) {
        const docRef = doc(db, 'impuestos', tax.id);
        await updateDoc(docRef, { nombre: formData.nombre, descripcion: formData.descripcion });
      } else {
        const collectionRef = collection(db, 'impuestos');
        await addDoc(collectionRef, {
          ...formData,
          posicion: itemCount,
          activo: true // Default to active
        });
      }
      onBack(true); // Signal success
    } catch (error) {
      console.error("Error al guardar el impuesto:", error);
      // Consider adding a user-facing error notification
    } finally {
      setLoading(false);
    }
  };

  // Base UI components (Card, CardHeader, etc.) should be theme-aware
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{tax ? 'Editar Impuesto' : 'Nuevo Impuesto'}</CardTitle>
        <CardDescription>
          {tax ? 'Modifica los detalles del impuesto.' : 'Añade un nuevo impuesto para usar en tus cotizaciones.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        {/* CardContent should be theme-aware */}
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {/* --- FIX 1: Add text-foreground to label --- */}
            <label htmlFor="nombre" className="text-sm font-medium leading-none text-foreground">
              Nombre
            </label>
            {/* Input should be theme-aware */}
            <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: IVA 19%" required />
          </div>
          <div className="space-y-2">
            {/* --- FIX 2: Add text-foreground to label --- */}
            <label htmlFor="descripcion" className="text-sm font-medium leading-none text-foreground">
              Descripción
            </label>
            {/* Textarea should be theme-aware */}
            <Textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Ej: Impuesto al Valor Agregado" />
          </div>
        </CardContent>
        {/* CardFooter should be theme-aware */}
        <CardFooter className="flex justify-end gap-2">
           {/* Buttons use theme-aware variants */}
          <Button type="button" variant="ghost" onClick={() => onBack(false)}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TaxForm;