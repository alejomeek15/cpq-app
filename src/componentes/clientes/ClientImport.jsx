import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Papa from 'papaparse';
import { Button } from '@/ui/button.jsx';
// Optional: If you have a Dialog component, consider using it for the modal
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/ui/dialog.jsx';

const ClientImport = ({ db, onBack }) => {
  // --- Lógica de estado y funciones (sin cambios) ---
  const [status, setStatus] = useState('Arrastre o suba el archivo a importar');
  const [fileName, setFileName] = useState('');
  const [importedClients, setImportedClients] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleFile = (file) => {
    if (file) {
      setFileName(file.name);
      setStatus('Procesando archivo...');

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const clients = results.data;
          const importedNames = [];
          try {
            for (const client of clients) {
              if (!client.nombre || client.nombre.trim() === '') continue;
              const clientData = {
                tipo: client.tipo || 'compañia',
                nombre: client.nombre,
                email: client.email || '',
                telefono: client.telefono || '',
                direccion: {
                  calle: client.calle || '',
                  ciudad: client.ciudad || '',
                  departamento: client.departamento || '',
                  pais: client.pais || '',
                },
                identificacionNumero: client.identificacionNumero || '',
                sitioWeb: client.sitioWeb || '',
                nombreCompania: client.nombreCompania || '',
                puestoTrabajo: client.puestoTrabajo || '',
                fechaCreacion: serverTimestamp(),
                fechaActualizacion: serverTimestamp(),
              };
              await addDoc(collection(db, 'clientes'), clientData);
              importedNames.push(client.nombre);
            }
            setImportedClients(importedNames);
            setIsSuccessModalOpen(true);
          } catch (error) {
            console.error('Error importing clients:', error);
            setStatus('Error al guardar los datos.');
          }
        },
        error: (error) => {
          console.error('Error parsing file:', error);
          setStatus('Error al leer el archivo CSV.');
        },
      });
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'tipo', 'nombre', 'email', 'telefono', 'calle', 'ciudad',
      'departamento', 'pais', 'identificacionNumero', 'sitioWeb',
      'nombreCompania', 'puestoTrabajo',
    ];
    const exampleCompany = [
      'compañia', 'Jabones SAS', 'facturacion@jabones.com', '+576015551234',
      'Calle Falsa 123', 'Bogotá', 'Cundinamarca', 'Colombia',
      '900.123.456-7', 'https://jabones.com', '', '',
    ];
    const exampleIndividual = [
      'individuo', 'Luis Mojica', 'luis.mojica@example.com', '+573105551234',
      'Carrera 7 # 8-90', 'Medellín', 'Antioquia', 'Colombia',
      '12345678', '', 'Jabones SAS', 'Director de Ventas',
    ];
    const csvContent = [headers, exampleCompany, exampleIndividual]
      .map((e) => e.join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'plantilla_importacion_clientes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="w-full">
      {/* --- Encabezado --- */}
      <header className="mb-8 flex justify-between items-center">
        {/* --- ¡CAMBIO 1! text-text-primary -> text-foreground --- */}
        <h1 className="text-2xl font-bold text-foreground">Importar un archivo</h1>
        <Button variant="secondary" onClick={() => onBack()}>
          Cancelar
        </Button>
      </header>

      {/* --- Zona de carga de archivo --- */}
      <div className="w-full max-w-lg mx-auto text-center">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-input').click()}
          // --- ¡CAMBIO 2! Clases de borde y hover refactorizadas ---
          className="border-2 border-dashed border rounded-xl p-12 cursor-pointer hover:border-primary transition-colors"
        >
          <input
            type="file"
            id="file-input"
            className="hidden"
            accept=".csv"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {/* --- ¡CAMBIO 3! Color del icono refactorizado --- */}
          <svg
            className="w-16 h-16 text-muted-foreground mb-4 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          {/* El texto del estado/nombre de archivo hereda el color, está bien */}
          <p className="text-lg font-semibold">{fileName || status}</p>
          {/* --- ¡CAMBIO 4! Color del texto de ayuda refactorizado --- */}
          <p className="text-sm text-muted-foreground mt-2">
            Usa archivos .csv. Se recomienda usar la plantilla.
          </p>
        </div>

        {/* El botón de descarga usa la variante primaria, está bien */}
        <Button className="mt-8" onClick={handleDownloadTemplate}>
          Descargar Plantilla
        </Button>
      </div>

      {/* --- Modal de Éxito --- */}
      {isSuccessModalOpen && (
        // --- ¡CAMBIO 5! Overlay del modal refactorizado ---
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          {/* --- ¡CAMBIO 6! Contenido del modal refactorizado --- */}
          <div className="bg-card border rounded-2xl p-8 max-w-md w-full text-card-foreground">
            {/* El título hereda el color de la tarjeta, está bien */}
            <h3 className="text-2xl font-bold text-center">¡Importación Exitosa!</h3>
            {/* --- ¡CAMBIO 7! Color de la descripción refactorizado --- */}
            <p className="mt-2 mb-6 text-center text-muted-foreground">
              Se crearon los siguientes clientes:
            </p>

            {/* --- ¡CAMBIO 8! Contenedor de la lista refactorizado --- */}
            <div className="bg-muted rounded-lg p-4 max-h-48 overflow-y-auto text-left text-muted-foreground">
              {importedClients.map((name, i) => (
                // El texto hereda el color del contenedor, está bien
                <p key={i}>• {name}</p>
              ))}
            </div>

            {/* El botón Aceptar usa la variante primaria, está bien */}
            <Button className="w-full mt-8" onClick={() => onBack()}>
              Aceptar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientImport;