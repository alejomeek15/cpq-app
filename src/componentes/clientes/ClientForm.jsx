import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, addDoc, deleteDoc, serverTimestamp, collection } from 'firebase/firestore';
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
// Importar icono de flecha si no lo tienes globalmente
import { ArrowLeft } from 'lucide-react'; 

const ClientForm = ({ db, clientId, onBack }) => {
    // --- Lógica de estado y datos (sin cambios) ---
    const [client, setClient] = useState({
        tipo: 'persona', nombre: '', email: '', telefono: '',
        direccion: { calle: '', ciudad: '', departamento: '', pais: '' },
        identificacionNumero: '', sitioWeb: '', nombreContacto: '', puestoTrabajo: ''
    });
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    
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
            } else { setStatus("Cliente no encontrado."); }
        } catch (error) { setStatus("Error al cargar el cliente.");
        } finally { setLoading(false); }
    }, [db, clientId]);

    useEffect(() => { fetchClientData(); }, [fetchClientData]);

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
        setClient(prev => ({
            ...prev, tipo: newType, nombre: '', nombreContacto: '',
            puestoTrabajo: '', sitioWeb: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Guardando...');
        try {
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
    
    // NOTA: handleDelete usa window.confirm. Considera reemplazarlo con tu AlertDialog.
    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro?')) {
            try {
                await deleteDoc(doc(db, "clientes", clientId));
                onBack(false);
            } catch (error) { setStatus('Error al eliminar.'); }
        }
    };

    if (loading) return <p className="text-center text-muted-foreground">Cargando formulario...</p>; // <-- Usar text-muted-foreground

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => onBack(false)} className="h-8 w-8">
                            <ArrowLeft className="h-5 w-5" /> 
                        </Button>
                        <div>
                            <CardTitle>{isEditMode ? client.nombre : 'Nuevo Cliente'}</CardTitle>
                            <CardDescription>
                                {isEditMode ? 'Actualiza la información del cliente.' : 'Rellena los campos para crear un nuevo cliente.'}
                            </CardDescription>
                        </div>
                    </div>
                    {isEditMode && (
                        <div>{/* Espacio para el menú de acciones si lo necesitas */}</div>
                    )}
                </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    <div>
                        <div className="flex items-center gap-6 mb-4">
                            {/* --- ¡CAMBIO 1! Labels con color de texto y radio buttons con 'accent-primary' --- */}
                            <label className="flex items-center gap-2 text-sm text-foreground">
                              <input type="radio" name="tipo" value="persona" checked={client.tipo === 'persona'} onChange={handleTypeChange} className="accent-primary" />
                              Persona
                            </label>
                            <label className="flex items-center gap-2 text-sm text-foreground">
                              <input type="radio" name="tipo" value="compañia" checked={client.tipo === 'compañia'} onChange={handleTypeChange} className="accent-primary"/>
                              Compañía
                            </label>
                        </div>
                        <Input 
                           type="text" 
                           name="nombre"
                           value={client.nombre} 
                           onChange={handleChange} 
                           placeholder={client.tipo === 'compañia' ? 'Nombre de la Compañía *' : 'Nombre Completo de la Persona *'} 
                           className="text-xl" required 
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Input type="email" name="email" value={client.email} onChange={handleChange} placeholder="Correo electrónico" />
                        <Input type="tel" name="telefono" value={client.telefono} onChange={handleChange} placeholder="Teléfono" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 pt-4">
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">Dirección</h2>
                            <Input type="text" name="direccion.calle" value={client.direccion.calle} onChange={handleChange} placeholder="Calle..." />
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input type="text" name="direccion.ciudad" value={client.direccion.ciudad} onChange={handleChange} placeholder="Ciudad" />
                                <Input type="text" name="direccion.departamento" value={client.direccion.departamento} onChange={handleChange} placeholder="Departamento" />
                            </div>
                            <Input type="text" name="direccion.pais" value={client.direccion.pais} onChange={handleChange} placeholder="País" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold">Detalles Adicionales</h2>
                            {client.tipo === 'compañia' && (
                                <>
                                    <Input type="text" name="nombreContacto" value={client.nombreContacto} onChange={handleChange} placeholder="Nombre del Contacto" />
                                    <Input type="text" name="puestoTrabajo" value={client.puestoTrabajo} onChange={handleChange} placeholder="Puesto del Contacto" />
                                </>
                            )}
                            <Input type="text" name="identificacionNumero" value={client.identificacionNumero} onChange={handleChange} placeholder={client.tipo === 'compañia' ? 'NIT' : 'Número de Identificación'} />
                            {client.tipo === 'compañia' && (
                               <Input type="text" name="sitioWeb" value={client.sitioWeb} onChange={handleChange} placeholder="Sitio web" />
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    {/* --- ¡CAMBIO 2! Mensaje de estado con 'text-muted-foreground' --- */}
                    <div className="text-sm font-medium text-muted-foreground flex-grow">{status}</div>
                    <Button type="button" variant="secondary" onClick={() => onBack(false)}>Cancelar</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Guardar')}</Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default ClientForm;