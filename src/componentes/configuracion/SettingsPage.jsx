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

import ConditionsModule from './condiciones/ConditionsModule.jsx';
import TaxesModule from './impuestos/TaxesModule.jsx';

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

      <Tabs defaultValue="condiciones" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="condiciones">Condiciones de Pago</TabsTrigger>
          <TabsTrigger value="impuestos">Impuestos</TabsTrigger>
        </TabsList>

        <TabsContent value="condiciones" className="mt-6">
          <ConditionsModule db={db} />
        </TabsContent>
        
        <TabsContent value="impuestos" className="mt-6">
          <TaxesModule db={db} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;