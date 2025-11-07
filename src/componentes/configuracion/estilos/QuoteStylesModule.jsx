import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth'; // ¡NUEVO!
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Button } from "@/ui/button.jsx";
import { Badge } from "@/ui/badge.jsx";
import { Skeleton } from "@/ui/skeleton.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/ui/dialog.jsx"

// Style definitions (sin cambios)
const availableStyles = [
  { name: 'Wave', preview: '/style-previews/wave-preview.png' },
  { name: 'Striped', preview: '/style-previews/striped-preview.png' },
  { name: 'Light', preview: '/style-previews/light-preview.png' },
  { name: 'Bubble', preview: '/style-previews/bubble-preview.png' },
];

// ¡CAMBIO! Ya NO recibe 'user' como prop
const QuoteStylesModule = ({ db }) => {
  // ¡NUEVO! Obtener user del Context
  const { user } = useAuth();

  const [selectedStyle, setSelectedStyle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewImageTitle, setPreviewImageTitle] = useState('');

  // ¡CAMBIO! useEffect ahora obtiene configuración DEL USUARIO
  useEffect(() => {
    const fetchStyleSetting = async () => {
      // ¡NUEVO! Validar que el usuario esté autenticado
      if (!user || !user.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // ¡CAMBIO! Ruta anidada con user.uid
        const configRef = doc(db, 'usuarios', user.uid, 'configuracion', 'global');
        const configSnap = await getDoc(configRef);

        if (configSnap.exists()) {
          setSelectedStyle(configSnap.data().quoteStyle || availableStyles[0].name);
        } else {
          // ¡CAMBIO! Crear configuración en la ruta anidada
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
  }, [db, user]); // ¡CAMBIO! Añadir 'user' a las dependencias

  // ¡CAMBIO! handleSelectStyle ahora guarda en la ruta anidada
  const handleSelectStyle = async (styleName) => {
    // ¡NUEVO! Validar que el usuario esté autenticado
    if (!user || !user.uid) {
      setError('Error: Usuario no autenticado.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // ¡CAMBIO! Ruta anidada con user.uid
      const configRef = doc(db, 'usuarios', user.uid, 'configuracion', 'global');
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

  const openPreview = (style) => {
    setPreviewImageUrl(style.preview);
    setPreviewImageTitle(`Previsualización: Estilo ${style.name}`);
    setIsPreviewOpen(true);
  };

  if (error) {
    return <p className="text-destructive">Error: {error}</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-foreground">Selecciona un Estilo para tus Cotizaciones</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Haz clic en una imagen para verla más grande. El estilo que elijas aquí se aplicará a todos los PDFs.
      </p>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuoteStylesModule;