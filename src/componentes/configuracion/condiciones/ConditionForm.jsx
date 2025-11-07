import React, { useState, useEffect } from 'react';
import { collection, doc, addDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth'; // ¡NUEVO!
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

// ¡CAMBIO! Ya NO recibe 'user' como prop
const ConditionForm = ({ onBack, db, condition, itemCount }) => {
  // ¡NUEVO! Obtener user del Context
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (condition) {
      setName(condition.nombre);
    } else {
      setName('');
    }
  }, [condition]);

  // ¡CAMBIO! handleSubmit ahora usa la ruta anidada
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ¡NUEVO! Validar que el usuario esté autenticado
    if (!user || !user.uid) {
      setError('Error: Usuario no autenticado.');
      return;
    }

    if (!name) {
      setError('El nombre de la condición es requerido.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (condition) {
        // ¡CAMBIO! Ruta anidada para actualizar
        const docRef = doc(db, 'usuarios', user.uid, 'condicionesPago', condition.id);
        await updateDoc(docRef, { nombre: name });
      } else {
        // ¡CAMBIO! Ruta anidada para crear
        const collectionRef = collection(db, 'usuarios', user.uid, 'condicionesPago');
        await addDoc(collectionRef, {
          nombre: name,
          posicion: itemCount,
          activo: true,
        });
      }
      onBack(true);
    } catch (error) {
      console.error("Error al guardar la condición:", error);
      setError('Error al guardar la condición.');
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
          {error && (
            <div className="p-3 mb-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none text-foreground">
              Nombre
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: 50% al inicio, 50% a la entrega"
              required
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => onBack()}
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

export default ConditionForm;