import React, { useState, useEffect } from 'react';
import { collection, doc, addDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { Textarea } from '@/ui/textarea.jsx'; // <-- Importamos Textarea
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card.jsx";

const TaxForm = ({ onBack, db, tax, itemCount }) => {
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tax) {
      setFormData({ nombre: tax.nombre, descripcion: tax.descripcion });
    }
  }, [tax]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
        await addDoc(collectionRef, { ...formData, posicion: itemCount });
      }
      onBack(true);
    } catch (error) {
      console.error("Error al guardar el impuesto:", error);
    } finally {
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
          <div className="space-y-2">
            <label htmlFor="nombre">Nombre</label>
            <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: IVA 19%" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="descripcion">Descripción</label>
            <Textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Ej: Impuesto al Valor Agregado" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onBack(false)}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TaxForm;