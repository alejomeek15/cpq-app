import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth'; // ¡NUEVO!
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { ScrollArea } from '@/ui/scroll-area.jsx';
import { X } from 'lucide-react';

// ¡CAMBIO! Ya NO recibe 'user' como prop
const ManageAttributes = ({ db, onDone }) => {
  // ¡NUEVO! Obtener user del Context
  const { user } = useAuth();

  const [allAttributes, setAllAttributes] = useState([]);
  const [currentAttribute, setCurrentAttribute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ¡CAMBIO! Fetch attributes DEL USUARIO
  useEffect(() => {
    const fetchAttributes = async () => {
      // ¡NUEVO! Validar que el usuario esté autenticado
      if (!user || !user.uid) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // ¡CAMBIO! Ruta anidada con user.uid
        const querySnapshot = await getDocs(
          collection(db, 'usuarios', user.uid, 'atributos')
        );
        const attributes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllAttributes(attributes);
      } catch (err) {
        console.error("Error al obtener atributos:", err);
        setError("Error al cargar atributos");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttributes();
  }, [db, user]); // ¡CAMBIO! Añadir 'user' a las dependencias

  const handleSelectAttribute = (attribute) => {
    setCurrentAttribute({ ...attribute, opciones: [...attribute.opciones] });
  };

  const handleCreateNew = () => {
    setCurrentAttribute({ nombre: '', opciones: [] });
  };

  // ¡CAMBIO! handleRefresh ahora usa la ruta anidada
  const handleRefresh = async () => {
    // ¡NUEVO! Validar que el usuario esté autenticado
    if (!user || !user.uid) {
      return;
    }

    try {
      // ¡CAMBIO! Ruta anidada con user.uid
      const querySnapshot = await getDocs(
        collection(db, 'usuarios', user.uid, 'atributos')
      );
      setAllAttributes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCurrentAttribute(null);
    } catch (err) {
      console.error("Error al refrescar atributos:", err);
      setError("Error al actualizar la lista");
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-destructive">{error}</div>
        <Button onClick={onDone} className="mt-4">Cerrar</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Gestionar Atributos</h2>
        <Button variant="ghost" onClick={onDone}>Cerrar</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[60vh]">
        {/* Left Column: List of attributes */}
        <div className="md:col-span-1 flex flex-col border rounded-lg p-4">
          <Button onClick={handleCreateNew} className="mb-4">
            + Crear Nuevo Atributo
          </Button>
          <ScrollArea className="flex-grow">
            {isLoading ? (
              <p className="text-muted-foreground">Cargando...</p>
            ) : allAttributes.length === 0 ? (
              <p className="text-muted-foreground">No hay atributos</p>
            ) : (
              allAttributes.map(attr => (
                <div
                  key={attr.id}
                  onClick={() => handleSelectAttribute(attr)}
                  className={`p-3 rounded-md cursor-pointer text-sm ${
                    currentAttribute?.id === attr.id
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'hover:bg-muted'
                  }`}
                >
                  {attr.nombre}
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Right Column: Editor */}
        <div className="md:col-span-2 border rounded-lg p-4">
          {currentAttribute ? (
            <AttributeEditor
              key={currentAttribute.id || 'new'}
              db={db}
              attribute={currentAttribute}
              onSave={handleRefresh}
              onDelete={handleRefresh}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Selecciona un atributo para editar o crea uno nuevo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component for the editor form
// ¡CAMBIO! Ya NO recibe 'user' como prop
const AttributeEditor = ({ db, attribute, onSave, onDelete }) => {
  // ¡NUEVO! Obtener user del Context
  const { user } = useAuth();

  const [nombre, setNombre] = useState(attribute.nombre);
  const [opciones, setOpciones] = useState(attribute.opciones);
  const [newOption, setNewOption] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleAddOption = () => {
    if (newOption && !opciones.includes(newOption)) {
      setOpciones([...opciones, newOption]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (indexToRemove) => {
    setOpciones(opciones.filter((_, index) => index !== indexToRemove));
  };

  // ¡CAMBIO! handleSave ahora usa la ruta anidada
  const handleSave = async () => {
    // ¡NUEVO! Validar que el usuario esté autenticado
    if (!user || !user.uid) {
      setError('Error: Usuario no autenticado.');
      return;
    }

    if (!nombre || opciones.length === 0) {
      setError("El nombre y al menos una opción son requeridos.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const data = { nombre, opciones, tipo: 'select' };
    try {
      if (attribute.id) {
        // ¡CAMBIO! Ruta anidada para actualizar
        await updateDoc(
          doc(db, 'usuarios', user.uid, 'atributos', attribute.id),
          data
        );
      } else {
        // ¡CAMBIO! Ruta anidada para crear
        await addDoc(
          collection(db, 'usuarios', user.uid, 'atributos'),
          data
        );
      }
      onSave();
    } catch (err) {
      console.error("Error al guardar atributo:", err);
      setError('Error al guardar el atributo.');
      setIsSaving(false);
    }
  };

  // ¡CAMBIO! handleDelete ahora usa la ruta anidada
  const handleDelete = async () => {
    // ¡NUEVO! Validar que el usuario esté autenticado
    if (!user || !user.uid) {
      setError('Error: Usuario no autenticado.');
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres eliminar "${attribute.nombre}"?`)) {
      setIsSaving(true);
      setError(null);
      try {
        // ¡CAMBIO! Ruta anidada para eliminar
        await deleteDoc(
          doc(db, 'usuarios', user.uid, 'atributos', attribute.id)
        );
        onDelete();
      } catch (err) {
        console.error("Error al eliminar atributo:", err);
        setError('Error al eliminar el atributo.');
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="attr-nombre" className="text-sm font-medium text-foreground">
            Nombre del Atributo
          </label>
          <Input
            id="attr-nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Color"
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Opciones</label>
          <div className="p-2 border rounded-md min-h-[80px] space-x-2 space-y-2">
            {opciones.map((opt, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-muted rounded-full px-3 py-1 text-sm text-foreground"
              >
                {opt}
                <button
                  onClick={() => handleRemoveOption(index)}
                  disabled={isSaving}
                  className="ml-2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Añadir nueva opción"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
            disabled={isSaving}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddOption}
            disabled={isSaving}
          >
            Añadir
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        {attribute.id && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSaving}
          >
            Eliminar
          </Button>
        )}
        <div /> {/* Spacer */}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Guardando...' : (attribute.id ? 'Guardar Cambios' : 'Crear Atributo')}
        </Button>
      </div>
    </div>
  );
};

export default ManageAttributes;