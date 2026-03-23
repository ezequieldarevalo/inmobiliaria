"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { FileText, TrendingUp, Calculator, ArrowUpRight } from "lucide-react";
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
  const [adjustmentData, setAdjustmentData] = useState<any>(null);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [loadingAdj, setLoadingAdj] = useState(false);

  useEffect(() => {
    fetch("/api/contracts")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setContracts(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const viewAdjustments = async (contractId: string) => {
    setLoadingAdj(true);
    setShowAdjustment(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/adjustment`);
      const data = await res.json();
      setAdjustmentData(data);
    } catch {
      setAdjustmentData(null);
    }
    setLoadingAdj(false);
  };

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
                  {c.adjustmentType && (
                    <button onClick={() => viewAdjustments(c.id)}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-purple-600/30 bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 transition-colors">
                      <Calculator size={12} /> Calculadora de ajuste
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Adjustment modal */}
      <Modal open={showAdjustment} onClose={() => { setShowAdjustment(false); setAdjustmentData(null); }} title="Calculadora de Ajuste de Alquiler" className="max-w-2xl">
        {loadingAdj ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
          </div>
        ) : adjustmentData ? (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                <p className="text-xs text-gray-500">Monto inicial</p>
                <p className="text-sm font-bold text-white">{formatCurrency(adjustmentData.contract.amount, adjustmentData.contract.currency)}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-600/10 border border-emerald-600/20">
                <p className="text-xs text-gray-500">Monto actual</p>
                <p className="text-sm font-bold text-emerald-400">{formatCurrency(adjustmentData.currentAmount, adjustmentData.contract.currency)}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                <p className="text-xs text-gray-500">Índice</p>
                <p className="text-sm font-bold text-white">{adjustmentData.contract.adjustmentType}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-600/10 border border-purple-600/20">
                <p className="text-xs text-gray-500">Próximo ajuste</p>
                <p className="text-sm font-bold text-purple-400">{formatDate(adjustmentData.nextAdjustmentDate)}</p>
              </div>
            </div>

            {adjustmentData.nextEstimatedAmount && (
              <div className="p-4 rounded-xl bg-yellow-600/10 border border-yellow-600/20 flex items-center gap-3">
                <TrendingUp size={20} className="text-yellow-400 shrink-0" />
                <div>
                  <p className="text-sm text-yellow-300 font-medium">Estimación próximo período</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(adjustmentData.nextEstimatedAmount, adjustmentData.contract.currency)}/mes</p>
                </div>
              </div>
            )}

            {/* History table */}
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Historial de ajustes</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 text-gray-500 font-normal">Período</th>
                      <th className="text-left py-2 text-gray-500 font-normal">Fecha</th>
                      <th className="text-right py-2 text-gray-500 font-normal">Base</th>
                      <th className="text-right py-2 text-gray-500 font-normal">Ajustado</th>
                      <th className="text-right py-2 text-gray-500 font-normal">Variación</th>
                      <th className="text-right py-2 text-gray-500 font-normal">Acum.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustmentData.adjustments.map((adj: any) => (
                      <tr key={adj.periodNumber} className={`border-b border-gray-800/50 ${adj.periodNumber === adjustmentData.currentPeriod ? "bg-emerald-600/10" : ""}`}>
                        <td className="py-2">{adj.periodNumber === adjustmentData.currentPeriod && <Badge variant="success" className="text-[9px] mr-1">Actual</Badge>}{adj.periodNumber}°</td>
                        <td className="py-2 text-gray-400">{formatDate(adj.date)}</td>
                        <td className="py-2 text-right text-gray-400">{formatCurrency(adj.baseAmount, adjustmentData.contract.currency)}</td>
                        <td className="py-2 text-right text-white font-medium">{formatCurrency(adj.adjustedAmount, adjustmentData.contract.currency)}</td>
                        <td className="py-2 text-right">
                          {adj.percentChange > 0 ? (
                            <span className="text-red-400 flex items-center justify-end gap-0.5"><ArrowUpRight size={10} />{adj.percentChange}%</span>
                          ) : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="py-2 text-right text-gray-500">{adj.cumPercent > 0 ? `${adj.cumPercent}%` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No se pudo cargar la información</p>
        )}
      </Modal>
    </div>
  );
}
