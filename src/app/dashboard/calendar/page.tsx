"use client";

import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
        <Calendar size={24} /> Calendario
      </h1>
      <Card>
        <div className="text-center py-12">
          <Calendar size={48} className="text-gray-700 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Calendario completo próximamente</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Vista mensual con visitas, vencimientos de contratos, cobros, y recordatorios.
          </p>
        </div>
      </Card>
    </div>
  );
}
