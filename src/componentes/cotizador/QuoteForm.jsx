import React, { useState, useEffect, useRef, useCallback } from 'react';
import { collection, getDocs, doc, getDoc, setDoc, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import ProductoForm from '../catalogo/ProductoForm.jsx';
import { obtenerSiguienteNumeroCotizacion } from '../../utils/firestoreUtils.js';

// --- NUEVAS IMPORTACIONES ---
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card.jsx';
import { Separator } from '@/ui/separator.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select.jsx";
import { Trash2 } from 'lucide-react';
import { DatePicker } from '@/ui/DatePicker.jsx';

// --- Sub-componente para el Pop-up de Notificación (SOLO PARA ERRORES) ---
const NotificationModal = ({ message, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70]">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-lg animate-fade-in-up">
                <div className="text-red-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">{message}</h2>
                <button
                    onClick={onClose}
                    className="w-full text-white px-6 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700">
                    Aceptar
                </button>
            </div>
        </div>
    );
};

// --- Sub-componente para el Modal del Catálogo (Estilo E-commerce) ---
const ProductCatalogModal = ({ products, onAddToCart, onClose, initialCart }) => {
    const [cart, setCart] = useState(initialCart);

    const handleQuantityChange = (productId, quantity) => {
        const newQuantity = Math.max(0, quantity);
        const newCart = { ...cart };
        if (newQuantity === 0) {
            delete newCart[productId];
        } else {
            newCart[productId] = newQuantity;
        }
        setCart(newCart);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Catálogo de Productos</h2>
                    <button onClick={onClose} className="text-3xl leading-none">&times;</button>
                </div>
                <div className="flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 pr-4">
                    {products.map(product => (
                        <div key={product.id} className="bg-gray-900 p-4 rounded-lg flex flex-col justify-between shadow-lg">
                            <div className="flex-grow">
                                <h3 className="font-bold text-white">{product.nombre}</h3>
                                <p className="text-sm text-gray-400 mt-1">SKU: {product.sku || 'N/A'}</p>
                                <p className="text-xl font-semibold text-indigo-400 mt-2">${(product.precioBase || 0).toFixed(2)}</p>
                            </div>
                            <div className="mt-4">
                                {cart[product.id] > 0 ? (
                                    <div className="flex items-center justify-between">
                                        <button onClick={() => handleQuantityChange(product.id, (cart[product.id] || 0) - 1)} className="bg-gray-700 w-10 h-10 rounded-md font-bold text-lg">-</button>
                                        <span className="font-bold text-lg">{cart[product.id]}</span>
                                        <button onClick={() => handleQuantityChange(product.id, (cart[product.id] || 0) + 1)} className="bg-indigo-600 w-10 h-10 rounded-md font-bold text-lg">+</button>
                                    </div>
                                ) : (
                                    <button onClick={() => handleQuantityChange(product.id, 1)} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2">
                                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path></svg>
                                        Añadir
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pt-6 border-t border-gray-700">
                    <button onClick={() => onAddToCart(cart)} className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700">
                        Volver a la cotización
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Sub-componente para la Búsqueda de Productos DENTRO de la tabla ---
const InlineProductSearch = ({ products, onProductSelect, onCancel, onCreateNew, index }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const inputRef = useRef(null);
    const searchRef = useRef(null);

    const updatePosition = useCallback(() => {
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setPosition({ top: rect.bottom, left: rect.left, width: rect.width });
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                onCancel(index);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchRef, onCancel, index]);


    useEffect(() => {
        if (results.length > 0 || (query.length > 0 && results.length === 0)) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [results.length, query, updatePosition]);

    const handleQueryChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        if (newQuery.length > 0) {
            setResults(products.filter(p =>
                p.nombre.toLowerCase().includes(newQuery.toLowerCase()) ||
                (p.sku && p.sku.toLowerCase().includes(newQuery.toLowerCase()))
            ));
        } else {
            setResults([]);
        }
    };

    const selectProduct = (product) => {
        onProductSelect(index, product);
    };

    return (
        <div ref={searchRef}>
            <Input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Buscar producto..."
                autoFocus
            />
            {(results.length > 0 || query.length > 0) && (
                <div
                    className="fixed z-20 bg-gray-900 border border-gray-600 rounded-lg max-h-60 overflow-y-auto shadow-lg"
                    style={{ top: `${position.top}px`, left: `${position.left}px`, width: `${position.width}px` }}
                >
                    {results.map(product => (
                        <div key={product.id} onClick={() => selectProduct(product)} className="p-3 cursor-pointer hover:bg-gray-700 border-b border-gray-700">
                            <p className="font-semibold">{product.nombre}</p>
                            <p className="text-xs text-gray-400">SKU: {product.sku || 'N/A'}</p>
                        </div>
                    ))}
                    <div onClick={() => onCreateNew(query)} className="p-3 cursor-pointer text-indigo-400 hover:bg-gray-700">
                        <p className="font-semibold">+ Crear "{query}"</p>
                    </div>
                </div>
            )}
        </div>
    );
};


const QuoteForm = ({ db, quoteId, onBack }) => {
    const [quote, setQuote] = useState({
        numero: '',
        estado: 'Borrador',
        clienteId: '',
        vencimiento: null, // <-- CAMBIO 1
        condicionesPago: '',
        lineas: [],
    });
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [paymentTerms, setPaymentTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [isProductFormOpen, setIsProductFormOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);
    const [errorNotification, setErrorNotification] = useState(null);

    const fetchProducts = useCallback(async () => {
        const productsSnap = await getDocs(collection(db, "productos"));
        setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, [db]);

    useEffect(() => {
        async function loadInitialData() {
            setLoading(true);
            try {
                const [clientsSnap, termsSnap] = await Promise.all([
                    getDocs(collection(db, "clientes")),
                    getDocs(collection(db, "condicionesPago"))
                ]);
                setClients(clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setPaymentTerms(termsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                await fetchProducts();

                if (quoteId) {
                    const quoteRef = doc(db, "cotizaciones", quoteId);
                    const quoteSnap = await getDoc(quoteRef);
                    if (quoteSnap.exists()) {
                        const data = quoteSnap.data();
                        setQuote({
                            ...data,
                            // --- CAMBIO 2 ---
                            vencimiento: data.vencimiento ? data.vencimiento.toDate() : null,
                            lineas: data.lineas || []
                        });
                    }
                } else {
                    const formattedNumber = await obtenerSiguienteNumeroCotizacion(db);
                    if (formattedNumber) {
                        setQuote(prev => ({ ...prev, numero: formattedNumber }));
                    } else {
                        setErrorNotification({ message: "No se pudo generar un número de cotización." });
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
                setErrorNotification({ message: "Error al cargar los datos iniciales." });
            } finally {
                setLoading(false);
            }
        }
        loadInitialData();
    }, [db, quoteId, fetchProducts]);

    const handleOpenProductForm = (productData) => {
        if (typeof productData === 'string') { setProductToEdit({ nombre: productData });
        } else { setProductToEdit(productData); }
        setIsProductFormOpen(true);
    };

    const handleCloseProductForm = (newProduct) => {
        setIsProductFormOpen(false);
        setProductToEdit(null);
        if (newProduct) {
            fetchProducts().then(() => {
                if (newProduct && newProduct.id) {
                    const newLine = { productId: newProduct.id, productName: newProduct.nombre, quantity: 1, price: newProduct.precioBase || 0, };
                    setQuote(prevQuote => {
                        const searchLineIndex = prevQuote.lineas.findIndex(line => line.productId === null);
                        const newLines = [...prevQuote.lineas];
                        if (searchLineIndex > -1) { newLines[searchLineIndex] = newLine;
                        } else { newLines.push(newLine); }
                        return { ...prevQuote, lineas: newLines };
                    });
                }
            });
        }
    };

    const handleInputChange = (e) => setQuote(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleLineChange = (index, field, value) => {
        const updatedLines = [...quote.lineas];
        const numericValue = parseFloat(value);
        updatedLines[index][field] = isNaN(numericValue) ? value : numericValue;
        setQuote(prev => ({ ...prev, lineas: updatedLines }));
    };
    const handleInlineProductSelect = (index, product) => {
        const updatedLines = [...quote.lineas];
        updatedLines[index] = { productId: product.id, productName: product.nombre, quantity: 1, price: product.precioBase || 0 };
        setQuote(prev => ({ ...prev, lineas: updatedLines }));
    };
    const addEmptyLine = () => {
        if (!quote.lineas.some(line => line.productId === null)) {
            setQuote(prev => ({ ...prev, lineas: [...prev.lineas, { productId: null, productName: '', quantity: 1, price: 0 }] }));
        }
    };
    const cancelSearchLine = (index) => setQuote(prev => ({ ...prev, lineas: prev.lineas.filter((_, i) => i !== index) }));
    const removeLine = (index) => setQuote(prev => ({ ...prev, lineas: prev.lineas.filter((_, i) => i !== index) }));

    const handleSave = async () => {
        if (!quote.clienteId) {
            setErrorNotification({ message: "Por favor, selecciona un cliente." });
            return;
        }
        const { subtotal, tax, total } = calculateTotals();
        const selectedClient = clients.find(c => c.id === quote.clienteId);
        const quoteData = {
            numero: quote.numero,
            estado: quote.estado,
            clienteId: quote.clienteId,
            clienteNombre: selectedClient?.nombre || 'N/A',
            condicionesPago: quote.condicionesPago,
            // --- CAMBIO 3 ---
            vencimiento: quote.vencimiento ? Timestamp.fromDate(quote.vencimiento) : null,
            subtotal,
            impuestos: tax,
            total,
            lineas: quote.lineas.filter(line => line.productId),
            fechaActualizacion: serverTimestamp()
        };
        try {
            if (quoteId) {
                const quoteRef = doc(db, "cotizaciones", quoteId);
                await setDoc(quoteRef, quoteData, { merge: true });
            } else {
                quoteData.fechaCreacion = serverTimestamp();
                await addDoc(collection(db, "cotizaciones"), quoteData);
            }
            onBack(true);
        } catch (error) {
            console.error("Error al guardar la cotización: ", error);
            setErrorNotification({ message: "Error al guardar. Revisa la consola." });
        }
    };

    const calculateTotals = () => {
        const subtotal = quote.lineas.reduce((acc, line) => acc + (parseFloat(line.quantity || 0) * parseFloat(line.price || 0)), 0);
        const tax = subtotal * 0.19;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };
    const { subtotal, tax, total } = calculateTotals();
    const statusOptions = ["Borrador", "Enviada", "En negociación", "Aprobada", "Rechazada", "Vencida"];
    const handleAddToCart = (cart) => {
        const newLines = Object.entries(cart).map(([productId, quantity]) => {
            const product = products.find(p => p.id === productId);
            return { productId, productName: product.nombre, quantity, price: product.precioBase || 0 };
        });
        setQuote(prev => ({ ...prev, lineas: newLines }));
        setIsCatalogOpen(false);
    };

    if (loading) return <p className="text-center">Cargando cotización...</p>;

    return (
        <div className="space-y-8">
            {errorNotification && ( <NotificationModal message={errorNotification.message} onClose={() => setErrorNotification(null)} /> )}
            {isCatalogOpen && ( <ProductCatalogModal products={products} onClose={() => setIsCatalogOpen(false)} onAddToCart={handleAddToCart} initialCart={quote.lineas.reduce((acc, line) => { if(line.productId) acc[line.productId] = line.quantity; return acc; }, {})} /> )}
            {isProductFormOpen && ( <ProductoForm db={db} product={productToEdit} onClose={handleCloseProductForm} /> )}

            <div>
                <Button variant="link" onClick={() => onBack(false)} className="p-0 h-auto mb-2 text-indigo-400">&larr; Volver a la lista</Button>
                <div className="flex justify-between items-center">
                    <input type="text" name="numero" value={quote.numero} readOnly className="text-4xl font-bold bg-transparent border-none focus:ring-0 p-0 h-auto" />
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => onBack(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar Cotización</Button>
                    </div>
                </div>
            </div>

            <div className="flex items-center border border-slate-700 rounded-lg p-1 max-w-max flex-wrap">
                {statusOptions.map(status => (
                    <Button key={status} variant={quote.estado === status ? "default" : "ghost"} size="sm" onClick={() => setQuote(prev => ({ ...prev, estado: status }))}> {status} </Button>
                ))}
            </div>

            <Card className="bg-transparent border-none">
                 <CardHeader className="p-0 mb-4">
                    <CardTitle>Información Principal</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 bg-card rounded-lg border border-border">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Cliente</label>
                            <Select name="clienteId" value={quote.clienteId} onValueChange={(value) => handleInputChange({ target: { name: 'clienteId', value } })}>
                                <SelectTrigger><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
                                <SelectContent>
                                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* --- CAMBIO 4 --- */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Vencimiento</label>
                            <DatePicker
                                date={quote.vencimiento}
                                setDate={(date) => setQuote(prev => ({ ...prev, vencimiento: date }))}
                                placeholder="dd/mm/aaaa"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Condiciones de pago</label>
                            <Select name="condicionesPago" value={quote.condicionesPago} onValueChange={(value) => handleInputChange({ target: { name: 'condicionesPago', value } })}>
                                <SelectTrigger><SelectValue placeholder="Selecciona una condición" /></SelectTrigger>
                                <SelectContent>
                                    {paymentTerms.map(pt => <SelectItem key={pt.id} value={pt.nombre}>{pt.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                 </CardContent>
            </Card>

            <div>
                <h2 className="text-xl font-bold mb-4">Líneas de Cotización</h2>
                <div className="overflow-x-auto bg-card rounded-lg border border-border shadow">
                     <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-slate-800">
                            <tr>
                                <th className="px-6 py-3">Producto</th>
                                <th className="px-6 py-3 w-24">Cantidad</th>
                                <th className="px-6 py-3 w-40">Precio Unitario</th>
                                <th className="px-6 py-3 w-32">Impuestos</th>
                                <th className="px-6 py-3 w-40 text-right">Importe</th>
                                <th className="px-2 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {quote.lineas.map((line, index) => (
                                <tr key={index} className="border-b border-slate-700">
                                    <td className="px-6 py-2">
                                        {line.productId === null ? (
                                            <InlineProductSearch products={products} index={index} onProductSelect={handleInlineProductSelect} onCancel={cancelSearchLine} onCreateNew={handleOpenProductForm} />
                                        ) : ( line.productName )}
                                    </td>
                                    <td className="px-6 py-2"><Input type="number" value={line.quantity} onChange={e => handleLineChange(index, 'quantity', e.target.value)} className="text-center"/></td>
                                    <td className="px-6 py-2"><Input type="number" value={line.price} onChange={e => handleLineChange(index, 'price', e.target.value)} className="text-right"/></td>
                                    <td className="px-6 py-2 text-center">19% IVA</td>
                                    <td className="px-6 py-2 text-right font-semibold">${((line.quantity || 0) * (line.price || 0)).toFixed(2)}</td>
                                    <td className="px-2 py-2"><Button variant="ghost" size="icon" onClick={() => removeLine(index)} className="h-8 w-8 text-red-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex items-center gap-4">
                     <Button variant="link" className="p-0 h-auto" onClick={addEmptyLine}>+ Añadir un producto</Button>
                     <Button variant="link" className="p-0 h-auto" onClick={() => setIsCatalogOpen(true)}>Abrir Catálogo</Button>
                </div>
            </div>

            <div className="flex justify-end">
                <Card className="w-full max-w-sm bg-transparent border-none">
                    <CardContent className="p-6 bg-card rounded-lg border border-border space-y-4">
                        <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>IVA 19%:</span><span>${tax.toFixed(2)}</span></div>
                        <Separator />
                        <div className="flex justify-between text-xl"><span className="font-bold">Total:</span><span className="font-bold text-indigo-400">${total.toFixed(2)}</span></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default QuoteForm;