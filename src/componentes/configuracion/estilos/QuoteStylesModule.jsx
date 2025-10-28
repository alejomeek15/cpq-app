import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Button } from "@/ui/button.jsx";
import { Badge } from "@/ui/badge.jsx";
import { Skeleton } from "@/ui/skeleton.jsx";
// Dialog components should be theme-aware
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Not used here, but keep if needed elsewhere
  DialogClose,
} from "@/ui/dialog.jsx"

// Style definitions (no changes needed)
const availableStyles = [
  { name: 'Wave', preview: '/style-previews/wave-preview.png' },
  { name: 'Striped', preview: '/style-previews/striped-preview.png' },
  { name: 'Light', preview: '/style-previews/light-preview.png' },
  { name: 'Bubble', preview: '/style-previews/bubble-preview.png' },
];

const QuoteStylesModule = ({ db }) => {
  // State logic (no changes needed)
  const [selectedStyle, setSelectedStyle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewImageTitle, setPreviewImageTitle] = useState('');

  // useEffect and data fetching (no changes needed)
  useEffect(() => {
    const fetchStyleSetting = async () => {
        setLoading(true);
        setError(null);
        try {
          const configRef = doc(db, 'configuracion', 'global');
          const configSnap = await getDoc(configRef);

          if (configSnap.exists()) {
            setSelectedStyle(configSnap.data().quoteStyle || availableStyles[0].name);
          } else {
            // Set default if config doesn't exist
            await setDoc(configRef, { quoteStyle: availableStyles[0].name });
            setSelectedStyle(availableStyles[0].name);
            console.log("Documento de configuración global creado.");
          }
        } catch (err) {
          console.error("Error al cargar la configuración de estilo:", err);
          setError("No se pudo cargar la configuración. Inténtalo de nuevo.");
          setSelectedStyle(availableStyles[0].name); // Fallback default
        } finally {
          setLoading(false);
        }
      };
      fetchStyleSetting();
  }, [db]);

  // handleSelectStyle logic (no changes needed)
  const handleSelectStyle = async (styleName) => {
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

  // openPreview logic (no changes needed)
  const openPreview = (style) => {
    setPreviewImageUrl(style.preview);
    setPreviewImageTitle(`Previsualización: Estilo ${style.name}`);
    setIsPreviewOpen(true);
  };

  // --- FIX 1: Use text-destructive for error message ---
  if (error) {
    return <p className="text-destructive">Error: {error}</p>;
  }

  return (
    <div>
      {/* --- FIX 2: Use text-foreground for title --- */}
      <h2 className="text-xl font-semibold mb-4 text-foreground">Selecciona un Estilo para tus Cotizaciones</h2>
      {/* Description already uses text-muted-foreground (OK) */}
      <p className="text-sm text-muted-foreground mb-6">
        Haz clic en una imagen para verla más grande. El estilo que elijas aquí se aplicará a todos los PDFs.
      </p>

      {/* Dialog component should be theme-aware */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Skeleton structure (OK, assumes Skeleton is theme-aware)
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
              // Card component should be theme-aware
              // Border color applied conditionally using border-primary (OK)
              return (
                <Card key={style.name} className={`relative overflow-hidden ${isSelected ? 'border-primary border-2' : ''}`}>
                  {/* Badge uses variant (OK) */}
                  {isSelected && (
                    <Badge variant="default" className="absolute top-2 right-2 z-10">
                      Seleccionado
                    </Badge>
                  )}
                  {/* CardHeader, CardTitle, CardContent, CardFooter should be theme-aware */}
                  <CardHeader>
                    <CardTitle>{style.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Button wrapper for image click */}
                    <button onClick={() => openPreview(style)} className="w-full block cursor-pointer">
                       {/* Image uses border, bg-muted (OK) */}
                       <img
                          src={style.preview}
                          alt={`Previsualización del estilo ${style.name}`}
                          className="w-full h-auto aspect-[3/4] object-cover rounded-md border bg-muted transition-opacity hover:opacity-80"
                          onError={(e) => e.target.src = '/style-previews/placeholder.png'} // Placeholder path
                       />
                    </button>
                  </CardContent>
                  <CardFooter>
                    {/* Button uses default variant (OK) */}
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

        {/* DialogContent and its children should be theme-aware */}
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
           {/* Optional Close Button Example */}
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