import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Button } from "@/ui/button.jsx";
import { Badge } from "@/ui/badge.jsx";
import { Skeleton } from "@/ui/skeleton.jsx";
// **NUEVO: Importar componentes de Dialog**
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Para un botón de cierre opcional
} from "@/ui/dialog.jsx"

// --- Define tus estilos disponibles ---
const availableStyles = [
  { name: 'Wave', preview: '/style-previews/wave-preview.png' },
  { name: 'Striped', preview: '/style-previews/striped-preview.png' },
  { name: 'Light', preview: '/style-previews/light-preview.png' },
  { name: 'Bubble', preview: '/style-previews/bubble-preview.png' },
];

const QuoteStylesModule = ({ db }) => {
  const [selectedStyle, setSelectedStyle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // **NUEVO: Estados para el modal de previsualización**
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewImageTitle, setPreviewImageTitle] = useState(''); // Para el título del modal

  useEffect(() => {
    // ... (fetchStyleSetting sin cambios)
    const fetchStyleSetting = async () => {
        setLoading(true);
        setError(null);
        try {
          const configRef = doc(db, 'configuracion', 'global');
          const configSnap = await getDoc(configRef);

          if (configSnap.exists()) {
            setSelectedStyle(configSnap.data().quoteStyle || availableStyles[0].name);
          } else {
            await setDoc(configRef, { quoteStyle: availableStyles[0].name });
            setSelectedStyle(availableStyles[0].name);
            console.log("Documento de configuración global creado.");
          }
        } catch (err) {
          console.error("Error al cargar la configuración de estilo:", err);
          setError("No se pudo cargar la configuración. Inténtalo de nuevo.");
          setSelectedStyle(availableStyles[0].name);
        } finally {
          setLoading(false);
        }
      };
      fetchStyleSetting();
  }, [db]);

  const handleSelectStyle = async (styleName) => {
    // ... (handleSelectStyle sin cambios)
    setSaving(true);
      setError(null);
      try {
        const configRef = doc(db, 'configuracion', 'global');
        await setDoc(configRef, { quoteStyle: styleName }, { merge: true });
        setSelectedStyle(styleName);
        console.log(`Estilo '${styleName}' guardado correctamente.`);
      } catch (err) {
        console.error("Error al guardar el estilo:", err);
        setError("No se pudo guardar la selección. Inténtalo de nuevo.");
      } finally {
        setSaving(false);
      }
  };

  // **NUEVO: Función para abrir la previsualización**
  const openPreview = (style) => {
    setPreviewImageUrl(style.preview);
    setPreviewImageTitle(`Previsualización: Estilo ${style.name}`);
    setIsPreviewOpen(true);
  };

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Selecciona un Estilo para tus Cotizaciones</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Haz clic en una imagen para verla más grande. El estilo que elijas aquí se aplicará a todos los PDFs.
      </p>

      {/* **NUEVO: Envolvemos todo en el componente Dialog principal** */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // ... (Skeleton sin cambios)
             Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-4 w-2/5" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[150px] w-full rounded-md" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))
          ) : (
            availableStyles.map((style) => {
              const isSelected = style.name === selectedStyle;
              return (
                <Card key={style.name} className={`relative overflow-hidden ${isSelected ? 'border-primary border-2' : ''}`}>
                  {isSelected && (
                    <Badge variant="default" className="absolute top-2 right-2 z-10">
                      Seleccionado
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle>{style.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* **CAMBIO: Hacemos la imagen clickeable para abrir el Dialog** */}
                    <button onClick={() => openPreview(style)} className="w-full block cursor-pointer">
                       <img
                          src={style.preview}
                          alt={`Previsualización del estilo ${style.name}`}
                          className="w-full h-auto aspect-[3/4] object-cover rounded-md border bg-muted transition-opacity hover:opacity-80"
                          onError={(e) => e.target.src = '/style-previews/placeholder.png'}
                       />
                    </button>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleSelectStyle(style.name)}
                      disabled={isSelected || saving}
                    >
                      {saving && !isSelected ? 'Guardando...' : (isSelected ? 'Estilo Actual' : 'Seleccionar Estilo')}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>

        {/* **NUEVO: Contenido del Dialog para la previsualización grande** */}
        <DialogContent className="sm:max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] xl:max-w-[40vw]">
           <DialogHeader>
             <DialogTitle>{previewImageTitle}</DialogTitle>
             <DialogDescription>
               Esta es una vista ampliada del estilo seleccionado.
             </DialogDescription>
           </DialogHeader>
           <div className="mt-4 max-h-[70vh] overflow-auto">
              <img
                  src={previewImageUrl}
                  alt={previewImageTitle}
                  className="w-full h-auto rounded-md"
              />
           </div>
           {/* Puedes añadir un botón de cierre explícito si lo prefieres */}
           {/* <DialogFooter>
               <DialogClose asChild>
                  <Button type="button" variant="secondary">Cerrar</Button>
               </DialogClose>
           </DialogFooter> */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuoteStylesModule;