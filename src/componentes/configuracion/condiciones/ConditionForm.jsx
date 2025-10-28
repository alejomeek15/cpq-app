import React, { useState, useEffect } from 'react';
import { collection, doc, addDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card.jsx";

const ConditionForm = ({ onBack, db, condition, itemCount }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // useEffect to fill form (no changes needed)
  useEffect(() => {
    if (condition) {
      setName(condition.nombre);
    } else {
      setName('');
    }
  }, [condition]);

  // handleSubmit logic (no changes needed)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      if (condition) {
        // Edit existing condition
        const docRef = doc(db, 'condicionesPago', condition.id);
        await updateDoc(docRef, { nombre: name });
      } else {
        // Create new condition
        const collectionRef = collection(db, 'condicionesPago');
        await addDoc(collectionRef, {
          nombre: name,
          posicion: itemCount,
          activo: true, // Default to active
        });
      }
      onBack(true); // Signal success
    } catch (error) {
      console.error("Error al guardar la condición:", error);
      // Consider adding a user-facing error notification here
      setLoading(false);
    }
    // No need for finally setLoading(false) if onBack navigates away
  };

  // Base UI components (Card, CardHeader, CardTitle, CardDescription)
  // should already be theme-aware.
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{condition ? 'Editar Condición' : 'Nueva Condición de Pago'}</CardTitle>
        <CardDescription>
          {condition ? 'Modifica el nombre de la condición.' : 'Añade una nueva condición que podrás usar en tus cotizaciones.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        {/* CardContent should be theme-aware */}
        <CardContent>
          <div className="space-y-2">
            {/* --- FIX: Add text-foreground to the label --- */}
            <label htmlFor="name" className="text-sm font-medium leading-none text-foreground">
              Nombre
            </label>
            {/* Input should be theme-aware */}
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: 50% al inicio, 50% a la entrega"
              required
            />
          </div>
        </CardContent>
        {/* CardFooter should be theme-aware */}
        <CardFooter className="flex justify-end gap-2">
          {/* Buttons use theme-aware variants */}
          <Button type="button" variant="ghost" onClick={() => onBack()}>
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

export default ConditionForm;