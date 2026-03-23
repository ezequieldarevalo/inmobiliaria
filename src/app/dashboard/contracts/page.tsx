"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Contract {
  id: string;
  contractType: string;
  status: string;
  startDate: string;
  endDate: string | null;
  amount: number;
  currency: string;
  adjustmentType: string | null;
  adjustmentPeriod: number | null;
  property: { title: string; street: string | null; streetNumber: string | null };
  client: { firstName: string; lastName: string };
  owner: { firstName: string; lastName: string } | null;
  _count: { payments: number };
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contracts")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setContracts(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (s: string) => {
    switch (s) {
      case "VIGENTE": return "success";
      case "PENDIENTE": return "warning";
      case "FINALIZADO": return "default";
      case "RESCINDIDO": return "danger";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
        <FileText size={24} /> Contratos
      </h1>

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : contracts.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <FileText size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">No hay contratos</p>
            <p className="text-xs text-gray-600 mt-1">Los contratos se crean desde la ficha de cada propiedad</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => (
            <Card key={c.id}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{c.property.title}</h3>
                    <Badge variant={statusBadge(c.status) as "success" | "warning" | "danger" | "default"}>{c.status}</Badge>
                    <Badge variant="info">{c.contractType}</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-400 mt-2">
                    <div>
                      <p className="text-xs text-gray-600">Inquilino/Comprador</p>
                      <p className="text-white">{c.client.firstName} {c.client.lastName}</p>
                    </div>
                    {c.owner && (
                      <div>
                        <p className="text-xs text-gray-600">Propietario</p>
                        <p className="text-white">{c.owner.firstName} {c.owner.lastName}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-600">Período</p>
                      <p className="text-white">{formatDate(c.startDate)} — {c.endDate ? formatDate(c.endDate) : "Indefinido"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Monto</p>
                      <p className="text-white font-medium">{formatCurrency(c.amount, c.currency)}</p>
                      {c.adjustmentType && <p className="text-xs text-gray-500">Ajuste: {c.adjustmentType} cada {c.adjustmentPeriod} meses</p>}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
