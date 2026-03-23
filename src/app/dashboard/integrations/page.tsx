"use client";

import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
        <Globe size={24} /> Integraciones
      </h1>
      <Card>
        <div className="text-center py-12">
          <Globe size={48} className="text-gray-700 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Publicación en portales próximamente</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Publicá tus propiedades automáticamente en ZonaProp, Argenprop, MercadoLibre y más.
          </p>
        </div>
      </Card>
    </div>
  );
}
