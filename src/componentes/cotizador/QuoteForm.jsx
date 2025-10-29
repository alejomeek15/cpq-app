import React, { useState, useEffect, useRef, useCallback } from 'react';
import { collection, getDocs, doc, getDoc, setDoc, addDoc, serverTimestamp, Timestamp, query, where } from 'firebase/firestore';
import { pdf } from '@react-pdf/renderer';
import QuotePDF from './QuotePDF.jsx';
import ProductoForm from '../catalogo/ProductoForm.jsx';
import { obtenerSiguienteNumeroCotizacion } from '../../utils/firestoreUtils.js';
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
import { Trash2, AlertCircle, X, ShoppingCart, ArrowLeft } from 'lucide-react';
import { DatePicker } from '@/ui/DatePicker.jsx';

// --- Sub-componente: NotificationModal ---
const NotificationModal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[70]">
        <div className="bg-card border rounded-2xl p-8 max-w-sm w-full text-center shadow-lg animate-fade-in-up text-card-foreground">
            <div className="text-destructive mb-4"><AlertCircle className="w-16 h-16 mx-auto" strokeWidth={1.5} /></div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">{message}</h2>
            <Button variant="destructive" onClick={onClose} className="w-full">Aceptar</Button>
        </div>
    </div>
);

// --- Sub-componente: ProductCatalogModal ---
const ProductCatalogModal = ({ products, onAddToCart, onClose, initialCart }) => {
  const [cart, setCart] = useState(initialCart);
  const handleQuantityChange = (productId, quantity) => {
    const newQuantity = Math.max(0, quantity);
    const newCart = { ...cart };
    if (newQuantity === 0) delete newCart[productId];
    else newCart[productId] = newQuantity;
    setCart(newCart);
  };
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] flex flex-col text-card-foreground">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Catálogo de Productos</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground -mr-4 -mt-4">
            <X className="w-6 h-6" /><span className="sr-only">Cerrar</span>
          </Button>
        </div>
        <div className="flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 pr-4">
          {products.map(product => (
            <div key={product.id} className="bg-muted p-4 rounded-lg flex flex-col justify-between shadow-lg text-muted-foreground">
              <div className="flex-grow">
                <h3 className="font-bold text-foreground">{product.nombre}</h3>
                <p className="text-sm mt-1">SKU: {product.sku || 'N/A'}</p>
                <p className="text-xl font-semibold text-primary mt-2">${(product.precioBase || 0).toFixed(2)}</p>
              </div>
              <div className="mt-4">
                {cart[product.id] > 0 ? (
                  <div className="flex items-center justify-between">
                    <Button variant="secondary" size="icon" onClick={() => handleQuantityChange(product.id, (cart[product.id] || 0) - 1)} className="w-10 h-10 rounded-md font-bold text-lg">-</Button>
                    <span className="font-bold text-lg text-foreground">{cart[product.id]}</span>
                    <Button size="icon" onClick={() => handleQuantityChange(product.id, (cart[product.id] || 0) + 1)} className="w-10 h-10 rounded-md font-bold text-lg">+</Button>
                  </div>
                ) : ( <Button onClick={() => handleQuantityChange(product.id, 1)} className="w-full flex items-center justify-center gap-2"> <ShoppingCart className="w-5 h-5" /> Añadir </Button> )}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t"><Button onClick={() => onAddToCart(cart)} className="w-full"> Volver a la cotización </Button></div>
      </div>
    </div>
  );
};

// --- Sub-componente: InlineProductSearch ---
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
      setResults(products.filter(p => p.nombre.toLowerCase().includes(newQuery.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(newQuery.toLowerCase()))));
    }
    else { setResults([]); }
  };
  
  const selectProduct = (product) => { onProductSelect(index, product); };
  
  return (
    <div ref={searchRef}>
      <Input ref={inputRef} type="text" value={query} onChange={handleQueryChange} placeholder="Buscar producto..." autoFocus />
      {(results.length > 0 || query.length > 0) && (
        <div className="fixed z-20 bg-popover border rounded-lg max-h-60 overflow-y-auto shadow-lg text-popover-foreground" style={{ top: `${position.top}px`, left: `${position.left}px`, width: `${position.width}px` }}>
          {results.map(product => (
            <div key={product.id} onClick={() => selectProduct(product)} className="p-3 cursor-pointer hover:bg-accent border-b">
              <p className="font-semibold">{product.nombre}</p>
              <p className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
            </div>
          ))}
          <div onClick={() => onCreateNew(query)} className="p-3 cursor-pointer text-primary hover:bg-accent">
            <p className="font-semibold">+ Crear "{query}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-componente: DownloadPDFButton ---
const DownloadPDFButton = ({ quoteId, loading, clients, quote, subtotal, tax, total, quoteStyleName }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const styleToUse = quoteStyleName || 'Bubble';

    if (!quoteId || loading) return null;

    const handleDownload = async () => {
        setIsGenerating(true);
        console.log(`[DownloadPDFButton] Using PDF Style: ${styleToUse}`);
        try {
            const currentClient = clients.find(c => c.id === quote.clienteId);
            if (!currentClient) throw new Error("Client data not found");

            const doc = <QuotePDF quote={{...quote, subtotal, impuestos: tax, total}} client={currentClient} styleName={styleToUse} />;
            const blob = await pdf(doc).toBlob();
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${quote.numero || 'cotizacion'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return ( <Button variant="outline" onClick={handleDownload} disabled={isGenerating}> {isGenerating ? 'Generando PDF...' : 'Descargar PDF'} </Button> );
};

// --- Componente Principal: QuoteForm ---
const QuoteForm = ({ db, quoteId, onBack }) => {
  // --- Estados ---
  const [quote, setQuote] = useState({ numero: '', estado: 'Borrador', clienteId: '', vencimiento: null, condicionesPago: '', lineas: [], });
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [errorNotification, setErrorNotification] = useState(null);
  const [canSave, setCanSave] = useState(true);
  const [globalConfig, setGlobalConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // --- Funciones de Carga ---
  const fetchProducts = useCallback(async () => {
    const productsSnap = await getDocs(collection(db, "productos"));
    setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, [db]);

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      setLoadingConfig(true);
      setCanSave(true);
      setErrorNotification(null);
      try {
        const configRef = doc(db, 'configuracion', 'global');
        const paymentTermsQuery = query(collection(db, "condicionesPago"), where("activo", "==", true));

        const [clientsSnap, termsSnap, configSnap] = await Promise.all([
          getDocs(collection(db, "clientes")),
          getDocs(paymentTermsQuery),
          getDoc(configRef)
        ]);

        setClients(clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setPaymentTerms(termsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        if (configSnap.exists()) {
          setGlobalConfig(configSnap.data());
          console.log("[QuoteForm] Global config loaded:", configSnap.data());
        } else {
          console.warn("[QuoteForm] Global config document not found.");
          setGlobalConfig({});
        }
        setLoadingConfig(false);

        await fetchProducts();

        if (quoteId) {
          const quoteRef = doc(db, "cotizaciones", quoteId);
          const quoteSnap = await getDoc(quoteRef);
          if (quoteSnap.exists()) {
            const data = quoteSnap.data();
            setQuote({
              ...data,
              vencimiento: data.vencimiento ? data.vencimiento.toDate() : null,
              lineas: data.lineas || []
            });
            setCanSave(true);
          } else {
             setErrorNotification({ message: "Cotización no encontrada." });
             setCanSave(false);
          }
        } else {
          const formattedNumber = await obtenerSiguienteNumeroCotizacion(db);
          if (formattedNumber) {
            setQuote(prev => ({ ...prev, numero: formattedNumber }));
            setCanSave(true);
          } else {
            setErrorNotification({ message: "Error al generar Nº de cotización. No se podrá guardar." });
            setQuote(prev => ({ ...prev, numero: 'ERROR' }));
            setCanSave(false);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setErrorNotification({ message: "Error al cargar datos. No se podrá guardar." });
        setCanSave(false);
        setLoadingConfig(false);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [db, quoteId, fetchProducts]);

  const handleOpenProductForm = (productData) => {
    setProductToEdit(productData);
    setIsProductFormOpen(true);
  };

  const handleCloseProductForm = (newProduct) => {
    setIsProductFormOpen(false);
    setProductToEdit(null);
    if (newProduct) {
      fetchProducts();
    }
  };

  const handleInputChange = (e) => setQuote(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleLineChange = (index, field, value) => {
      const newLines = [...quote.lineas];
      const numericValue = (field === 'quantity' || field === 'price') ? parseFloat(value) : value;
      newLines[index][field] = (field === 'quantity' || field === 'price') ? (isNaN(numericValue) ? '' : numericValue) : value;
      setQuote(prev => ({ ...prev, lineas: newLines }));
  };
  
  const handleInlineProductSelect = (index, product) => {
      const newLines = [...quote.lineas];
      newLines[index] = { productId: product.id, productName: product.nombre, quantity: 1, price: product.precioBase || 0 };
      setQuote(prev => ({ ...prev, lineas: newLines }));
  };
  
  const addEmptyLine = () => {
      if (!quote.lineas.some(line => line.productId === null)) {
          setQuote(prev => ({ ...prev, lineas: [...prev.lineas, { productId: null, productName: '', quantity: 1, price: 0 }] }));
      }
  };
  
  const cancelSearchLine = (index) => setQuote(prev => ({ ...prev, lineas: prev.lineas.filter((_, i) => i !== index) }));
  const removeLine = (index) => setQuote(prev => ({ ...prev, lineas: prev.lineas.filter((_, i) => i !== index) }));

  // --- Función de Guardado ---
  const handleSave = async () => {
    if (!canSave || !quote.numero || quote.numero === 'ERROR' || !quote.clienteId) {
      setErrorNotification({ message: !quote.clienteId ? "Selecciona un cliente." : "No se puede guardar la cotización." });
      return;
    }
    setLoading(true);
    setErrorNotification(null);
    const { subtotal, tax, total } = calculateTotals();
    const selectedClient = clients.find(c => c.id === quote.clienteId);
    const quoteData = {
      numero: quote.numero,
      estado: quote.estado,
      clienteId: quote.clienteId,
      clienteNombre: selectedClient?.nombre || 'N/A',
      condicionesPago: quote.condicionesPago,
      vencimiento: quote.vencimiento ? Timestamp.fromDate(quote.vencimiento) : null,
      subtotal,
      impuestos: tax,
      total,
      lineas: quote.lineas.filter(line => line.productId).map(line => ({
          ...line,
          quantity: parseFloat(line.quantity || 0),
          price: parseFloat(line.price || 0)
      })),
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
      setLoading(false);
    }
  };

  // --- Función de Cálculo ---
  const calculateTotals = () => {
    const lineasValidas = Array.isArray(quote.lineas) ? quote.lineas : [];
    const subtotal = lineasValidas.reduce((acc, line) => acc + ((parseFloat(line.quantity) || 0) * (parseFloat(line.price) || 0)), 0);
    const tax = subtotal * 0.19;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };
  const { subtotal, tax, total } = calculateTotals();

  const statusOptions = ["Borrador", "Enviada", "En negociación", "Aprobada", "Rechazada", "Vencida"];
  
  const handleAddToCart = (cart) => {
    const newLineas = Object.entries(cart).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return { productId, productName: product?.nombre || '', quantity, price: product?.precioBase || 0 };
    });
    setQuote(prev => ({ ...prev, lineas: [...prev.lineas.filter(l => l.productId !== null), ...newLineas] }));
    setIsCatalogOpen(false);
  };

  if ((loading || loadingConfig) && (!quote.numero || quote.numero === 'ERROR') ) return <p className="text-center text-muted-foreground">Cargando cotización...</p>;

  // --- RENDERIZADO ---
  return (
      <div className="space-y-8">
          {errorNotification && <NotificationModal message={errorNotification.message} onClose={() => setErrorNotification(null)} />}
          {isCatalogOpen && <ProductCatalogModal products={products} onClose={() => setIsCatalogOpen(false)} onAddToCart={handleAddToCart} initialCart={quote.lineas.reduce((acc, line) => { if(line.productId) acc[line.productId] = line.quantity; return acc; }, {})} />}
          {isProductFormOpen && <ProductoForm db={db} product={productToEdit} onClose={handleCloseProductForm} />}

          {/* --- Cabecera --- */}
          <div>
              <div className="flex justify-between items-center">
                  <input type="text" name="numero" value={quote.numero} readOnly className={`text-4xl font-bold bg-transparent border-none focus:ring-0 p-0 h-auto ${quote.numero === 'ERROR' ? 'text-destructive' : 'text-foreground'}`} />
                  <div className="flex items-center gap-2">
                      <Button variant="secondary" onClick={() => onBack(false)} disabled={loading && canSave}>Cancelar</Button>
                      <Button onClick={handleSave} disabled={!canSave || (loading && canSave)}>
                          {loading && canSave ? 'Guardando...' : (canSave ? 'Guardar Cotización' : 'Error al Cargar')}
                      </Button>
                      <DownloadPDFButton
                          quoteId={quoteId}
                          loading={loading || loadingConfig}
                          clients={clients}
                          quote={quote}
                          subtotal={subtotal}
                          tax={tax}
                          total={total}
                          quoteStyleName={globalConfig?.quoteStyle}
                      />
                  </div>
              </div>
          </div>

          {/* --- Botones de Estado --- */}
          <div className="flex items-center border rounded-lg p-1 max-w-max flex-wrap">
              {statusOptions.map(status => ( <Button key={status} variant={quote.estado === status ? "default" : "ghost"} size="sm" onClick={() => setQuote(prev => ({ ...prev, estado: status }))}> {status} </Button> ))}
          </div>

          {/* --- Card Información Principal --- */}
          <Card className="bg-transparent border-none">
              <CardHeader className="p-0 mb-4"><CardTitle>Información Principal</CardTitle></CardHeader>
              <CardContent className="p-6 bg-card rounded-lg border">
                  <div className="grid md:grid-cols-3 gap-6">
                      <div>
                          <label className="block text-sm font-medium mb-1 text-foreground">Cliente</label>
                          <Select name="clienteId" value={quote.clienteId} onValueChange={(value) => handleInputChange({ target: { name: 'clienteId', value } })}>
                              <SelectTrigger><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
                              <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}</SelectContent>
                          </Select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1 text-foreground">Vencimiento</label>
                          <DatePicker date={quote.vencimiento} setDate={(date) => setQuote(prev => ({ ...prev, vencimiento: date }))} placeholder="dd/mm/aaaa" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium mb-1 text-foreground">Condiciones de pago</label>
                          <Select name="condicionesPago" value={quote.condicionesPago} onValueChange={(value) => handleInputChange({ target: { name: 'condicionesPago', value } })}>
                              <SelectTrigger><SelectValue placeholder="Selecciona una condición" /></SelectTrigger>
                              <SelectContent>{paymentTerms.map(pt => <SelectItem key={pt.id} value={pt.nombre}>{pt.nombre}</SelectItem>)}</SelectContent>
                          </Select>
                      </div>
                  </div>
               </CardContent>
          </Card>

          {/* --- Tabla Líneas de Cotización --- */}
          <div>
                <h2 className="text-xl font-bold mb-4 text-foreground">Líneas de Cotización</h2>
                <div className="overflow-x-auto bg-card rounded-lg border shadow">
                     <table className="w-full text-sm text-left text-foreground">
                        <thead className="text-xs uppercase bg-muted text-muted-foreground">
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
                                <tr key={index} className="border-b">
                                    <td className="px-6 py-2">
                                        {line.productId === null ? (
                                            <InlineProductSearch products={products} index={index} onProductSelect={handleInlineProductSelect} onCancel={cancelSearchLine} onCreateNew={handleOpenProductForm} />
                                        ) : ( line.productName )}
                                    </td>
                                    <td className="px-6 py-2"><Input type="number" value={line.quantity} onChange={e => handleLineChange(index, 'quantity', e.target.value)} className="text-center"/></td>
                                    <td className="px-6 py-2"><Input type="number" value={line.price} onChange={e => handleLineChange(index, 'price', e.target.value)} className="text-right"/></td>
                                    <td className="px-6 py-2 text-center text-foreground">19% IVA</td>
                                    <td className="px-6 py-2 text-right font-semibold text-foreground">${((line.quantity || 0) * (line.price || 0)).toFixed(2)}</td>
                                    <td className="px-2 py-2">
                                      <Button variant="ghost" size="icon" onClick={() => removeLine(index)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex items-center gap-4">
                     <Button variant="link" className="p-0 h-auto" onClick={addEmptyLine}>+ Añadir un producto</Button>
                     <Button variant="link" className="p-0 h-auto" onClick={() => setIsCatalogOpen(true)}>
                        Abrir Catálogo
                     </Button>
                </div>
            </div>

          {/* --- Totales --- */}
          <div className="flex justify-end">
                <Card className="w-full max-w-sm bg-transparent border-none">
                    <CardContent className="p-6 bg-card rounded-lg border space-y-4 text-card-foreground">
                        <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>IVA 19%:</span><span>${tax.toFixed(2)}</span></div>
                        <Separator />
                        <div className="flex justify-between text-xl"><span className="font-bold">Total:</span><span className="font-bold text-primary">${total.toFixed(2)}</span></div>
                    </CardContent>
                </Card>
            </div>
      </div>
  );
};

export default QuoteForm;