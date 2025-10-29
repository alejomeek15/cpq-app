import React from 'react';
// --- REMOVE SidebarTrigger import ---
// import { SidebarTrigger } from '@/ui/sidebar.jsx';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/breadcrumb.jsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs.jsx";

// Import modules
import ConditionsModule from './condiciones/ConditionsModule.jsx';
import TaxesModule from './impuestos/TaxesModule.jsx';
import QuoteStylesModule from './estilos/QuoteStylesModule.jsx'; // Assuming this exists and is theme-aware

const SettingsPage = ({ db, navigate }) => {
  return (
    <div className="w-full">
      {/* --- Page Header with Breadcrumb --- */}
      {/* --- REMOVE SidebarTrigger and adjust structure --- */}
      {/* Breadcrumb now sits directly here, mb-8 gives it space */}
      <div className="mb-8">
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

      {/* Heading uses text-foreground (OK) */}
      <h1 className="text-2xl font-bold mb-8 text-foreground">Gestión de Parámetros</h1>

      {/* Tabs use UI components (OK) */}
      <Tabs defaultValue="condiciones" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="condiciones">Condiciones de Pago</TabsTrigger>
          <TabsTrigger value="impuestos">Impuestos</TabsTrigger>
          <TabsTrigger value="estilos">Estilos de Cotización</TabsTrigger>
        </TabsList>

        <TabsContent value="condiciones" className="mt-6">
          {/* ConditionsModule uses refactored children (OK) */}
          <ConditionsModule db={db} />
        </TabsContent>

        <TabsContent value="impuestos" className="mt-6">
          {/* TaxesModule uses refactored children (OK) */}
          <TaxesModule db={db} />
        </TabsContent>

        <TabsContent value="estilos" className="mt-6">
          {/* QuoteStylesModule was refactored (OK) */}
          <QuoteStylesModule db={db} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;