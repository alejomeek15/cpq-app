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

// Import modules
import ConditionsModule from './condiciones/ConditionsModule.jsx';
import TaxesModule from './impuestos/TaxesModule.jsx';
import QuoteStylesModule from './estilos/QuoteStylesModule.jsx'; // Assuming this exists

const SettingsPage = ({ db, navigate }) => {
  return (
    <div className="w-full">
      {/* --- Page Header with Breadcrumb (No changes needed) --- */}
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

      {/* --- FIX: Add text-foreground to the heading --- */}
      <h1 className="text-2xl font-bold mb-8 text-foreground">Gestión de Parámetros</h1>

      {/* --- Tabs (No changes needed, uses UI components) --- */}
      <Tabs defaultValue="condiciones" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="condiciones">Condiciones de Pago</TabsTrigger>
          <TabsTrigger value="impuestos">Impuestos</TabsTrigger>
          <TabsTrigger value="estilos">Estilos de Cotización</TabsTrigger>
        </TabsList>

        <TabsContent value="condiciones" className="mt-6">
          {/* ConditionsModule will need refactoring */}
          <ConditionsModule db={db} />
        </TabsContent>
        
        <TabsContent value="impuestos" className="mt-6">
          {/* TaxesModule will need refactoring */}
          <TaxesModule db={db} />
        </TabsContent>

        <TabsContent value="estilos" className="mt-6">
           {/* QuoteStylesModule will need refactoring */}
          <QuoteStylesModule db={db} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;