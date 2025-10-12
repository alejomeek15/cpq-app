import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, addDoc, deleteDoc, serverTimestamp, collection } from 'firebase/firestore';
import { Button } from '@/ui/button.jsx';

const ClientForm = ({ db, clientId, onBack }) => {
    // --- ¡CAMBIO 1! ---
    // Actualizamos el estado para usar 'nombreContacto' y eliminar 'nombreCompania'.
    const [client, setClient] = useState({
        tipo: 'persona',
        nombre: '', // Este es ahora el campo principal
        email: '',
        telefono: '',
        direccion: { calle: '', ciudad: '', departamento: '', pais: '' },
        identificacionNumero: '',
        sitioWeb: '',
        nombreContacto: '', // Nuevo campo para el contacto
        puestoTrabajo: ''
    });
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

    const fetchClientData = useCallback(async () => {
        if (!clientId) {
            setIsEditMode(false);
            setLoading(false);
            return;
        }
        setIsEditMode(true);
        try {
            const docRef = doc(db, "clientes", clientId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setClient({
                    ...data,
                    direccion: data.direccion || { calle: '', ciudad: '', departamento: '', pais: '' }
                });
            } else {
                setStatus("Cliente no encontrado.");
            }
        } catch (error) {
            setStatus("Error al cargar el cliente.");
        } finally {
            setLoading(false);
        }
    }, [db, clientId]);

    useEffect(() => {
        fetchClientData();
    }, [fetchClientData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('direccion.')) {
            const field = name.split('.')[1];
            setClient(prev => ({ ...prev, direccion: { ...prev.direccion, [field]: value } }));
        } else {
            setClient(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        // Limpiamos los campos al cambiar de tipo para evitar datos inconsistentes
        setClient(prev => ({
            ...prev,
            tipo: newType,
            nombre: '',
            nombreContacto: '',
            puestoTrabajo: '',
            sitioWeb: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Guardando...');
        try {
            // Aseguramos que los campos no relevantes estén vacíos antes de guardar
            const dataToSave = { ...client };
            if (dataToSave.tipo === 'persona') {
                dataToSave.nombreContacto = '';
                dataToSave.puestoTrabajo = '';
                dataToSave.sitioWeb = '';
            }
            dataToSave.fechaActualizacion = serverTimestamp();

            if (isEditMode) {
                await setDoc(doc(db, "clientes", clientId), dataToSave, { merge: true });
            } else {
                dataToSave.fechaCreacion = serverTimestamp();
                await addDoc(collection(db, "clientes"), dataToSave);
            }
            onBack(true);
        } catch (error) {
            setStatus('Error al guardar.');
            console.error("Error al guardar cliente:", error);
        }
    };
    
    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
            try {
                await deleteDoc(doc(db, "clientes", clientId));
                onBack(false);
            } catch (error) {
                setStatus('Error al eliminar.');
            }
        }
    };

    if (loading) return <p className="text-center text-gray-500">Cargando formulario...</p>;

    return (
        <div className="w-full max-w-4xl p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => onBack(false)} className="text-gray-400 hover:text-indigo-400">← Volver</button>
                    {/* El título ahora siempre muestra el campo 'nombre' */}
                    <h1 className="text-3xl font-bold text-indigo-400">{isEditMode ? client.nombre : 'Nuevo Cliente'}</h1>
                </div>
                 {isEditMode && (
                    <div className="relative">
                        {/* Menú de acciones sin cambios */}
                    </div>
                )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <div className="flex items-center gap-6 mb-4">
                        <label className="flex items-center gap-2"><input type="radio" name="tipo" value="persona" checked={client.tipo === 'persona'} onChange={handleTypeChange} /> Persona</label>
                        <label className="flex items-center gap-2"><input type="radio" name="tipo" value="compañia" checked={client.tipo === 'compañia'} onChange={handleTypeChange} /> Compañía</label>
                    </div>
                    {/* --- ¡CAMBIO 2! --- */}
                    {/* Este es ahora el campo de entrada principal para 'nombre'. */}
                    <input type="text" 
                           name="nombre"
                           value={client.nombre} 
                           onChange={handleChange} 
                           placeholder={client.tipo === 'compañia' ? 'Nombre de la Compañía *' : 'Nombre Completo de la Persona *'} 
                           className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg text-xl" required />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <input type="email" name="email" value={client.email} onChange={handleChange} placeholder="Correo electrónico" className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                    <input type="tel" name="telefono" value={client.telefono} onChange={handleChange} placeholder="Teléfono" className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                </div>
                 <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 pt-4">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-400">Dirección</h2>
                        <input type="text" name="direccion.calle" value={client.direccion.calle} onChange={handleChange} placeholder="Calle..." className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                        <div className="grid sm:grid-cols-2 gap-4">
                            <input type="text" name="direccion.ciudad" value={client.direccion.ciudad} onChange={handleChange} placeholder="Ciudad" className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                            <input type="text" name="direccion.departamento" value={client.direccion.departamento} onChange={handleChange} placeholder="Departamento" className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                        </div>
                        <input type="text" name="direccion.pais" value={client.direccion.pais} onChange={handleChange} placeholder="País" className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-400">Detalles Adicionales</h2>
                         {/* --- ¡CAMBIO 3! --- */}
                         {/* Ahora los campos adicionales son 'nombreContacto' y 'puestoTrabajo' */}
                         {client.tipo === 'compañia' && (
                            <>
                                <input type="text" name="nombreContacto" value={client.nombreContacto} onChange={handleChange} placeholder="Nombre del Contacto" className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                                <input type="text" name="puestoTrabajo" value={client.puestoTrabajo} onChange={handleChange} placeholder="Puesto del Contacto" className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                            </>
                        )}
                        <input type="text" name="identificacionNumero" value={client.identificacionNumero} onChange={handleChange} placeholder={client.tipo === 'compañia' ? 'NIT' : 'Número de Identificación'} className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                        {client.tipo === 'compañia' && (
                           <input type="url" name="sitioWeb" value={client.sitioWeb} onChange={handleChange} placeholder="Sitio web (https://...)" className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                        )}
                    </div>
                </div>
                <div className="pt-6 flex items-center justify-end gap-4">
                    <div className="text-sm font-medium text-gray-400 flex-grow">{status}</div>
                    <Button type="button" variant="secondary" onClick={() => onBack(false)}>Cancelar</Button>
                    <Button type="submit">{isEditMode ? 'Actualizar' : 'Guardar'}</Button>
                </div>
            </form>
        </div>
    );
};

export default ClientForm;