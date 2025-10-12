import React, { useState, useEffect } from 'react';
import { collection, doc, addDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';

// --- ¡NUEVAS IMPORTACIONES! ---
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

  useEffect(() => {
    if (condition) {
      setName(condition.nombre);
    }
  }, [condition]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      if (condition) {
        // Editar condición existente
        const docRef = doc(db, 'condicionesPago', condition.id);
        await updateDoc(docRef, { nombre: name });
      } else {
        // Crear nueva condición
        const collectionRef = collection(db, 'condicionesPago');
        await addDoc(collectionRef, {
          nombre: name,
          posicion: itemCount, // Asigna la siguiente posición disponible
        });
      }
      onBack(); // Vuelve a la lista
    } catch (error) {
      console.error("Error al guardar la condición:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // --- ¡CAMBIO CLAVE! Reemplazamos el div por el componente Card ---
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{condition ? 'Editar Condición' : 'Nueva Condición de Pago'}</CardTitle>
        <CardDescription>
          {condition ? 'Modifica el nombre de la condición.' : 'Añade una nueva condición que podrás usar en tus cotizaciones.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none">
              Nombre
            </label>
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
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onBack}>
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