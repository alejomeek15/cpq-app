import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { Textarea } from '@/ui/textarea.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Dialog, DialogContent } from '@/ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select.jsx';
import ManageAttributes from './ManageAttributes.jsx';
import { X } from 'lucide-react';
import ManageCategories from './ManageCategories.jsx';

const SimpleProductForm = ({ db, onBack, onSave }) => {
  const { user } = useAuth();

  const [product, setProduct] = useState({
    nombre: '', descripcion: '', precioBase: '0', costo: '0', imagenUrl: '',
  });
  const [profit, setProfit] = useState(0);
  const [margin, setMargin] = useState(0);
  const [allAttributes, setAllAttributes] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [productAttributes, setProductAttributes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [isManageAttributesOpen, setIsManageAttributesOpen] = useState(false);
  const [isAddAttributeOpen, setIsAddAttributeOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  useEffect(() => {
    if (!user || !user.uid) {
      return;
    }

    try {
      const unsubAttributes = onSnapshot(
        collection(db, 'usuarios', user.uid, 'atributos'),
        (snapshot) => {
          setAllAttributes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        },
        (err) => {
          console.error("Error al obtener atributos:", err);
          setError("Error al cargar atributos");
        }
      );

      const unsubCategories = onSnapshot(
        collection(db, 'usuarios', user.uid, 'categorias'),
        (snapshot) => {
          setAllCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        },
        (err) => {
          console.error("Error al obtener categorías:", err);
          setError("Error al cargar categorías");
        }
      );

      return () => {
        unsubAttributes();
        unsubCategories();
      };
    } catch (err) {
      console.error("Error setting up listeners:", err);
      setError("Error al configurar los listeners");
    }
  }, [db, user]);

  useEffect(() => {
    const precioBase = parseFloat(product.precioBase) || 0;
    const costo = parseFloat(product.costo) || 0;
    const calculatedProfit = precioBase - costo;
    const calculatedMargin = precioBase > 0 ? (calculatedProfit / precioBase) * 100 : 0;
    setProfit(calculatedProfit);
    setMargin(calculatedMargin);
  }, [product.precioBase, product.costo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId) => {
    const newSelection = new Set(selectedCategories);
    if (newSelection.has(categoryId)) {
      newSelection.delete(categoryId);
    } else {
      newSelection.add(categoryId);
    }
    setSelectedCategories(newSelection);
  };

  const handleAddProductAttribute = (attributeId) => {
    const attribute = allAttributes.find(attr => attr.id === attributeId);
    if (attribute && !productAttributes.some(pa => pa.id === attributeId)) {
      setProductAttributes([...productAttributes, { ...attribute, selectedValue: attribute.opciones[0] }]);
    }
    setIsAddAttributeOpen(false);
  };

  const handleRemoveProductAttribute = (attributeId) => {
    setProductAttributes(productAttributes.filter(attr => attr.id !== attributeId));
  };

  const handleAttributeValueChange = (attributeId, value) => {
    setProductAttributes(productAttributes.map(attr =>
      attr.id === attributeId ? { ...attr, selectedValue: value } : attr
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.uid) {
      setError('Error: Usuario no autenticado.');
      return;
    }

    if (!product.nombre.trim()) {
      setError('El nombre del producto es requerido.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const attributesToSave = productAttributes.reduce((acc, attr) => {
      acc[attr.nombre] = attr.selectedValue;
      return acc;
    }, {});

    const productToSave = {
      ...product,
      tipo: 'simple',
      precioBase: parseFloat(product.precioBase) || 0,
      costo: parseFloat(product.costo) || 0,
      atributos: attributesToSave,
      categorias: Array.from(selectedCategories),
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "usuarios", user.uid, "productos"), productToSave);
      onSave();
    } catch (err) {
      console.error("Error al guardar el producto:", err);
      setError('Error al guardar el producto.');
      setIsSaving(false);
    }
  };

  const availableAttributes = allAttributes.filter(attr => !productAttributes.some(pa => pa.id === attr.id));

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Crear Producto Simple</h2>
          <Button type="button" variant="ghost" onClick={onBack}>
            ← Volver a la lista
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Información del Producto</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="text-sm font-medium text-foreground">Nombre</label>
                  <Input id="nombre" name="nombre" value={product.nombre} onChange={handleChange} required disabled={isSaving} />
                </div>
                <div>
                  <label htmlFor="descripcion" className="text-sm font-medium text-foreground">Descripción</label>
                  <Textarea id="descripcion" name="descripcion" value={product.descripcion} onChange={handleChange} rows={6} disabled={isSaving} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Precios</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="precioBase" className="text-sm font-medium text-foreground">Precio</label>
                  <Input id="precioBase" name="precioBase" type="number" value={product.precioBase} onChange={handleChange} disabled={isSaving} />
                </div>
                <div>
                  <label htmlFor="costo" className="text-sm font-medium text-foreground">Costo</label>
                  <Input id="costo" name="costo" type="number" value={product.costo} onChange={handleChange} disabled={isSaving} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Ganancia</label>
                  <Input value={profit.toFixed(2)} readOnly className="bg-muted" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Margen (%)</label>
                  <Input value={margin.toFixed(2)} readOnly className="bg-muted" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Imagen del Producto</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="imagenUrl" className="text-sm font-medium text-foreground">URL de la Imagen</label>
                  <Input id="imagenUrl" name="imagenUrl" value={product.imagenUrl} onChange={handleChange} placeholder="https://..." disabled={isSaving} />
                </div>
                <img src={product.imagenUrl || 'https://placehold.co/300x200/1e293b/94a3b8?text=Imagen'} alt="Vista previa" className="w-full h-auto object-cover rounded-md" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Categorías</CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsManageCategoriesOpen(true)} 
                    disabled={isSaving}
                  >
                    Gestionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-32 overflow-y-auto space-y-2 p-2 border rounded-md">
                  {allCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No hay categorías. Click en "Gestionar" para crear.
                    </p>
                  ) : (
                    allCategories.map(cat => (
                      <div key={cat.id} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`cat-${cat.id}`} 
                          checked={selectedCategories.has(cat.id)} 
                          onChange={() => handleCategoryChange(cat.id)} 
                          disabled={isSaving} 
                        />
                        <label htmlFor={`cat-${cat.id}`} className="text-sm text-foreground">
                          {cat.nombre}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Atributos</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productAttributes.map(attr => (
                    <div key={attr.id} className="grid grid-cols-[1fr_2fr_auto] items-center gap-2">
                      <label className="text-sm font-medium truncate text-foreground">{attr.nombre}</label>
                      <Select value={attr.selectedValue} onValueChange={(value) => handleAttributeValueChange(attr.id, value)} disabled={isSaving}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {attr.opciones.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveProductAttribute(attr.id)} disabled={isSaving} className="text-destructive h-8 w-8"><X size={16} /></Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAddAttributeOpen(true)} disabled={availableAttributes.length === 0 || isSaving}>+ Añadir Atributo</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsManageAttributesOpen(true)} disabled={isSaving}>Gestionar</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Producto'}
          </Button>
        </div>
      </form>

      <Dialog open={isManageAttributesOpen} onOpenChange={setIsManageAttributesOpen}>
        <DialogContent className="max-w-4xl"><ManageAttributes db={db} onDone={() => setIsManageAttributesOpen(false)} /></DialogContent>
      </Dialog>

      <Dialog open={isManageCategoriesOpen} onOpenChange={setIsManageCategoriesOpen}>
        <DialogContent className="max-w-2xl">
          <ManageCategories 
            db={db} 
            onDone={() => setIsManageCategoriesOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddAttributeOpen} onOpenChange={setIsAddAttributeOpen}>
        <DialogContent>
          <div className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Añadir un Atributo</h3>
            <Select onValueChange={handleAddProductAttribute} disabled={isSaving}>
              <SelectTrigger><SelectValue placeholder="Selecciona un atributo..." /></SelectTrigger>
              <SelectContent>
                {availableAttributes.map(attr => (<SelectItem key={attr.id} value={attr.id}>{attr.nombre}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SimpleProductForm;