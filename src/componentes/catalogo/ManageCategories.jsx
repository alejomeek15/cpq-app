import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { ScrollArea } from '@/ui/scroll-area.jsx';
import { Badge } from '@/ui/badge.jsx';
import { X, Plus } from 'lucide-react';

const ManageCategories = ({ db, onDone }) => {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(
          collection(db, 'usuarios', user.uid, 'categorias')
        );
        const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
      } catch (err) {
        console.error("Error al obtener categorías:", err);
        setError("Error al cargar categorías");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [db, user]);

  const handleAddCategory = async () => {
    if (!user?.uid || !newCategoryName.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      await addDoc(collection(db, 'usuarios', user.uid, 'categorias'), {
        nombre: newCategoryName.trim(),
        fechaCreacion: new Date()
      });

      // Recargar categorías
      const querySnapshot = await getDocs(
        collection(db, 'usuarios', user.uid, 'categorias')
      );
      setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setNewCategoryName('');
    } catch (err) {
      console.error("Error al agregar categoría:", err);
      setError("Error al guardar la categoría");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!user?.uid) return;
    
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await deleteDoc(doc(db, 'usuarios', user.uid, 'categorias', categoryId));
      setCategories(categories.filter(cat => cat.id !== categoryId));
    } catch (err) {
      console.error("Error al eliminar categoría:", err);
      setError("Error al eliminar la categoría");
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-destructive mb-4">{error}</div>
        <Button onClick={onDone}>Cerrar</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Gestionar Categorías</h2>
        <Button variant="ghost" onClick={onDone}>Cerrar</Button>
      </div>

      <div className="space-y-6">
        {/* Agregar nueva categoría */}
        <div className="flex gap-2">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nombre de la nueva categoría..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            disabled={isSaving}
          />
          <Button
            onClick={handleAddCategory}
            disabled={isSaving || !newCategoryName.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        </div>

        {/* Lista de categorías */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Categorías existentes ({categories.length})
          </h3>
          <ScrollArea className="h-[300px] border rounded-lg p-4">
            {isLoading ? (
              <p className="text-muted-foreground text-center">Cargando...</p>
            ) : categories.length === 0 ? (
              <p className="text-muted-foreground text-center">No hay categorías</p>
            ) : (
              <div className="space-y-2">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <Badge variant="secondary" className="text-sm">
                      {cat.nombre}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;