import React, { useState, useEffect } from 'react';
import { collection, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';

const ProductoForm = ({ db, product, onClose }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precioBase: '',
        sku: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const isEditMode = product && product.id;

    useEffect(() => {
        if (product) {
            setFormData({
                nombre: product.nombre || '',
                descripcion: product.descripcion || '',
                precioBase: product.precioBase || '',
                sku: product.sku || '',
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const dataToSave = {
                ...formData,
                precioBase: parseFloat(formData.precioBase) || 0,
                fechaActualizacion: serverTimestamp(),
            };

            if (isEditMode) {
                await setDoc(doc(db, "productos", product.id), dataToSave, { merge: true });
                onClose(); // En modo edición, solo cerramos.
            } else {
                dataToSave.fechaCreacion = serverTimestamp();
                const newDocRef = await addDoc(collection(db, "productos"), dataToSave);
                // ¡LA MAGIA ESTÁ AQUÍ! Devolvemos el producto recién creado al padre.
                onClose({ id: newDocRef.id, ...dataToSave });
            }
        } catch (error) {
            console.error("Error al guardar producto:", error);
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full">
                <h1 className="text-3xl font-bold text-indigo-400 mb-6">{isEditMode ? 'Editar Producto' : 'Crear Nuevo Producto'}</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ... (el resto del formulario no cambia) ... */}
                    <div>
                        <label htmlFor="nombre" className="block mb-2 text-sm font-medium text-gray-400">Nombre del Producto</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" required />
                    </div>
                    <div>
                        <label htmlFor="descripcion" className="block mb-2 text-sm font-medium text-gray-400">Descripción</label>
                        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="precioBase" className="block mb-2 text-sm font-medium text-gray-400">Precio Base (USD)</label>
                            <input type="number" name="precioBase" value={formData.precioBase} onChange={handleChange} step="0.01" className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" placeholder="0.00" />
                        </div>
                        <div>
                            <label htmlFor="sku" className="block mb-2 text-sm font-medium text-gray-400">SKU</label>
                            <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                        </div>
                    </div>
                     <div className="flex items-center justify-end space-x-4 pt-4">
                        <button type="button" onClick={() => onClose()} className="px-6 py-3 font-semibold bg-gray-600 rounded-lg hover:bg-gray-700">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-3 font-semibold bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isSaving ? 'Guardando...' : 'Guardar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductoForm;

