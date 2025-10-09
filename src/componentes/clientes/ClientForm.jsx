import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, addDoc, deleteDoc, serverTimestamp, collection } from 'firebase/firestore';

const ClientForm = ({ db, clientId, onBack }) => {
    const [client, setClient] = useState({
        tipo: 'compañia',
        nombre: '',
        email: '',
        telefono: '',
        direccion: { calle: '', ciudad: '', departamento: '', pais: '' },
        identificacionNumero: '',
        sitioWeb: '',
        nombreCompania: '',
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
                // Rellenar el estado con los datos del cliente, asegurando que todos los campos existan
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
        setClient(prev => ({ ...prev, tipo: newType, nombreCompania: '', puestoTrabajo: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Guardando...');
        try {
            const dataToSave = { ...client, fechaActualizacion: serverTimestamp() };
            if (isEditMode) {
                await setDoc(doc(db, "clientes", clientId), dataToSave, { merge: true });
                setStatus('¡Cliente actualizado!');
            } else {
                dataToSave.fechaCreacion = serverTimestamp();
                await addDoc(collection(db, "clientes"), dataToSave);
                // Idealmente, aquí se mostraría un modal de éxito y luego se volvería.
                alert('¡Cliente creado con éxito!');
                onBack(); 
            }
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            setStatus('Error al guardar.');
        }
    };
    
    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
            try {
                await deleteDoc(doc(db, "clientes", clientId));
                onBack();
            } catch (error) {
                setStatus('Error al eliminar.');
            }
        }
    };

    const handleDuplicate = async () => {
        const newDocData = {
            ...client,
            nombre: `${client.nombre} (Copia)`,
            fechaCreacion: serverTimestamp(),
            fechaActualizacion: serverTimestamp(),
        };
        try {
            const newDocRef = await addDoc(collection(db, "clientes"), newDocData);
            // Navegar al nuevo cliente duplicado. Esto requeriría modificar el router principal
            // Por ahora, solo mostramos un mensaje y volvemos a la lista.
            alert(`Cliente duplicado. Nuevo ID: ${newDocRef.id}`);
            onBack();
        } catch (error) {
            setStatus('Error al duplicar.');
        }
    };


    if (loading) return <p className="text-center text-gray-500">Cargando formulario...</p>;

    return (
        <div className="w-full max-w-4xl p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-400 hover:text-indigo-400">← Volver</button>
                    <h1 className="text-3xl font-bold text-indigo-400">{isEditMode ? client.nombre : 'Nuevo Cliente'}</h1>
                </div>
                 {isEditMode && (
                    <div className="relative">
                        <button onClick={() => setActionsMenuOpen(!actionsMenuOpen)} className="text-gray-400 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </button>
                         {actionsMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-xl z-20 border border-gray-700">
                                <button onClick={handleDuplicate} className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Duplicar</button>
                                <button onClick={handleDelete} className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-900">Eliminar</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <div className="flex items-center gap-6 mb-4">
                        <label className="flex items-center gap-2"><input type="radio" name="tipo" value="individuo" checked={client.tipo === 'individuo'} onChange={handleTypeChange} /> Individuo</label>
                        <label className="flex items-center gap-2"><input type="radio" name="tipo" value="compañia" checked={client.tipo === 'compañia'} onChange={handleTypeChange} /> Compañía</label>
                    </div>
                    <input type="text" name="nombre" value={client.nombre} onChange={handleChange} placeholder={client.tipo === 'compañia' ? 'ej. Jabones SAS' : 'ej. Luis Mojica'} className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg text-xl" required />
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
                         {client.tipo === 'individuo' && (
                            <>
                                <input type="text" name="nombreCompania" value={client.nombreCompania} onChange={handleChange} placeholder="Nombre de la empresa" className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                                <input type="text" name="puestoTrabajo" value={client.puestoTrabajo} onChange={handleChange} placeholder="Puesto de trabajo" className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                            </>
                        )}
                        <input type="text" name="identificacionNumero" value={client.identificacionNumero} onChange={handleChange} placeholder={client.tipo === 'compañia' ? 'NIT' : 'Número de Identificación'} className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                        <input type="url" name="sitioWeb" value={client.sitioWeb} onChange={handleChange} placeholder="Sitio web (https://...)" className="w-full px-4 py-3 bg-gray-700 border-gray-600 rounded-lg" />
                    </div>
                </div>
                <div className="pt-6 flex items-center justify-end gap-4">
                    <div className="text-sm font-medium text-gray-400 flex-grow">{status}</div>
                    <button type="button" onClick={onBack} className="px-6 py-3 font-semibold bg-gray-600 rounded-lg hover:bg-gray-700">Cancelar</button>
                    <button type="submit" className="px-6 py-3 font-semibold bg-indigo-600 rounded-lg hover:bg-indigo-700">{isEditMode ? 'Actualizar' : 'Guardar'}</button>
                </div>
            </form>
        </div>
    );
};

export default ClientForm;
