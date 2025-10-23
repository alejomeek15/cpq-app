import React from 'react';
import { SidebarTrigger } from '@/ui/sidebar.jsx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/breadcrumb.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs.jsx";

// Importamos los módulos existentes
import ConditionsModule from './condiciones/ConditionsModule.jsx';
import TaxesModule from './impuestos/TaxesModule.jsx';
// **NUEVO: Importamos el módulo de estilos (aún no lo hemos creado)**
import QuoteStylesModule from './estilos/QuoteStylesModule.jsx';

const SettingsPage = ({ db, navigate }) => {
  return (
    <div className="w-full">
      {/* --- CABECERA DE LA PÁGINA CON BREADCRUMB --- */}
      <div className="mb-8">
        <SidebarTrigger />
        <div className="mt-4">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink onClick={() => navigate('dashboard')} className="cursor-pointer">
                            Dashboard
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Configuración</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-8">Gestión de Parámetros</h1>

      {/* **CAMBIO: Ajustamos el valor por defecto y las columnas del grid** */}
      <Tabs defaultValue="condiciones" className="w-full">
        {/* **CAMBIO: grid-cols-3 para 3 pestañas y añadimos el nuevo Trigger** */}
        <TabsList className="grid w-full grid-cols-3 max-w-lg"> {/* Ajustado a 3 columnas y un poco más ancho */}
          <TabsTrigger value="condiciones">Condiciones de Pago</TabsTrigger>
          <TabsTrigger value="impuestos">Impuestos</TabsTrigger>
          <TabsTrigger value="estilos">Estilos de Cotización</TabsTrigger> {/* Nueva Pestaña */}
        </TabsList>

        <TabsContent value="condiciones" className="mt-6">
          <ConditionsModule db={db} />
        </TabsContent>
        
        <TabsContent value="impuestos" className="mt-6">
          <TaxesModule db={db} />
        </TabsContent>

        {/* **NUEVO: Contenido para la pestaña de estilos** */}
        <TabsContent value="estilos" className="mt-6">
          <QuoteStylesModule db={db} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;