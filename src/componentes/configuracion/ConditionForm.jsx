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

  useEffect(() => {
    if (condition) {
      setName(condition.nombre);
    } else {
      setName('');
    }
  }, [condition]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      if (condition) {
        const docRef = doc(db, 'condicionesPago', condition.id);
        await updateDoc(docRef, { nombre: name });
      } else {
        const collectionRef = collection(db, 'condicionesPago');
        await addDoc(collectionRef, {
          nombre: name,
          posicion: itemCount,
        });
      }
      onBack(true); // Se guardó, envía 'true'
    } catch (error) {
      console.error("Error al guardar la condición:", error);
      setLoading(false);
    }
  };

  return (
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
          {/* --- ¡AQUÍ ESTÁ LA CORRECCIÓN DEFINITIVA! --- */}
          {/* Envolvemos onBack en una función de flecha para que se llame SIN argumentos. */}
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