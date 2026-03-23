"use client";

import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
        <BarChart3 size={24} /> Reportes
      </h1>
      <Card>
        <div className="text-center py-12">
          <BarChart3 size={48} className="text-gray-700 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Reportes disponibles próximamente</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Acá vas a poder ver reportes de ocupación, ingresos por alquiler, comisiones, y análisis de tu cartera de propiedades.
          </p>
        </div>
      </Card>
    </div>
  );
}
