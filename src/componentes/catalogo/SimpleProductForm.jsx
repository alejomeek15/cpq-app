// El código correcto
import React, { useState, useEffect } from 'react';
// --- ¡NUEVAS IMPORTACIONES DE FIREBASE! ---
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'; 
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { Textarea } from '@/ui/textarea.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Dialog, DialogContent } from '@/ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select.jsx';
import ManageAttributes from './ManageAttributes.jsx';
import { X } from 'lucide-react';

const SimpleProductForm = ({ db, onBack, onSave }) => {
  const [product, setProduct] = useState({
    name: '', description: '', price: '0', cost: '0', imageUrl: '',
  });
  const [profit, setProfit] = useState(0);
  const [margin, setMargin] = useState(0);
  const [allAttributes, setAllAttributes] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [productAttributes, setProductAttributes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [isManageAttributesOpen, setIsManageAttributesOpen] = useState(false);
  const [isAddAttributeOpen, setIsAddAttributeOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Estado para el botón de guardado

  // Escucha en tiempo real los atributos y categorías
  useEffect(() => {
    const unsubAttributes = onSnapshot(collection(db, 'atributos_c'), (snapshot) => {
      setAllAttributes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubCategories = onSnapshot(collection(db, 'categorias_c'), (snapshot) => {
      setAllCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubAttributes(); unsubCategories(); };
  }, [db]);

  // Calcula profit y margin
  useEffect(() => {
    const price = parseFloat(product.price) || 0;
    const cost = parseFloat(product.cost) || 0;
    const calculatedProfit = price - cost;
    const calculatedMargin = price > 0 ? (calculatedProfit / price) * 100 : 0;
    setProfit(calculatedProfit);
    setMargin(calculatedMargin);
  }, [product.price, product.cost]);

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
      setProductAttributes([...productAttributes, { ...attribute, selectedValue: attribute.options[0] }]);
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
  
  // --- ¡FUNCIÓN DE GUARDADO IMPLEMENTADA! ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Formatea los atributos seleccionados para guardarlos en Firestore
    const attributesToSave = productAttributes.reduce((acc, attr) => {
      acc[attr.name] = attr.selectedValue; // Usamos el nombre del atributo como clave
      return acc;
    }, {});

    const productToSave = {
      ...product,
      type: 'simple',
      price: parseFloat(product.price) || 0,
      cost: parseFloat(product.cost) || 0,
      attributes: attributesToSave,
      categories: Array.from(selectedCategories),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "productos_c"), productToSave);
      onSave(); // Llama a la función onSave (que es handleBackToList) para volver a la lista
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const availableAttributes = allAttributes.filter(attr => !productAttributes.some(pa => pa.id === attr.id));

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Crear Producto Simple</h2>
          <Button type="button" variant="ghost" onClick={onBack}>
            ← Volver a la lista
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Información del Producto</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium">Nombre</label>
                  <Input id="name" name="name" value={product.name} onChange={handleChange} required />
                </div>
                <div>
                  <label htmlFor="description" className="text-sm font-medium">Descripción</label>
                  <Textarea id="description" name="description" value={product.description} onChange={handleChange} rows={6} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Precios</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div><label htmlFor="price">Precio</label><Input id="price" name="price" type="number" value={product.price} onChange={handleChange} /></div>
                <div><label htmlFor="cost">Costo</label><Input id="cost" name="cost" type="number" value={product.cost} onChange={handleChange} /></div>
                <div><label>Ganancia</label><Input value={profit.toFixed(2)} readOnly className="bg-slate-800" /></div>
                <div><label>Margen (%)</label><Input value={margin.toFixed(2)} readOnly className="bg-slate-800" /></div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Imagen del Producto</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label htmlFor="imageUrl">URL de la Imagen</label><Input id="imageUrl" name="imageUrl" value={product.imageUrl} onChange={handleChange} placeholder="https://..." /></div>
                <img src={product.imageUrl || 'https://placehold.co/300x200/1e293b/94a3b8?text=Imagen'} alt="Vista previa" className="w-full h-auto object-cover rounded-md"/>
              </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Categorías</CardTitle></CardHeader>
                <CardContent>
                    <div className="max-h-32 overflow-y-auto space-y-2 p-2 border rounded-md">
                        {allCategories.map(cat => (
                            <div key={cat.id} className="flex items-center space-x-2">
                                <input type="checkbox" id={`cat-${cat.id}`} checked={selectedCategories.has(cat.id)} onChange={() => handleCategoryChange(cat.id)} />
                                <label htmlFor={`cat-${cat.id}`} className="text-sm">{cat.name}</label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Atributos</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productAttributes.map(attr => (
                    <div key={attr.id} className="grid grid-cols-[1fr_2fr_auto] items-center gap-2">
                      <label className="text-sm font-medium truncate">{attr.name}</label>
                      <Select value={attr.selectedValue} onValueChange={(value) => handleAttributeValueChange(attr.id, value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {attr.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveProductAttribute(attr.id)} className="text-red-500 h-8 w-8"><X size={16} /></Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAddAttributeOpen(true)} disabled={availableAttributes.length === 0}>+ Añadir Atributo</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsManageAttributesOpen(true)}>Gestionar</Button>
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
      
      <Dialog open={isAddAttributeOpen} onOpenChange={setIsAddAttributeOpen}>
        <DialogContent>
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Añadir un Atributo</h3>
            <Select onValueChange={handleAddProductAttribute}>
              <SelectTrigger><SelectValue placeholder="Selecciona un atributo..." /></SelectTrigger>
              <SelectContent>
                {availableAttributes.map(attr => (<SelectItem key={attr.id} value={attr.id}>{attr.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SimpleProductForm;