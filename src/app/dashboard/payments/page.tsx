"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { CreditCard, Check } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Payment {
  id: string;
  period: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: string;
  paidDate: string | null;
  paidAmount: number | null;
  paymentMethod: string | null;
  contract: {
    property: { title: string };
    client: { firstName: string; lastName: string };
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const loadPayments = () => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setPayments(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPayments(); }, []);

  const markPaid = async (id: string, amount: number) => {
    await fetch("/api/payments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "PAGADO", paidDate: new Date().toISOString(), paidAmount: amount }),
    });
    loadPayments();
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "PAGADO": return "success";
      case "PENDIENTE": return "warning";
      case "VENCIDO": return "danger";
      default: return "default";
    }
  };

  // Mark overdue
  const now = new Date();
  const enriched = payments.map((p) => ({
    ...p,
    status: p.status === "PENDIENTE" && new Date(p.dueDate) < now ? "VENCIDO" : p.status,
  }));

  const filtered = enriched.filter((p) => !filter || p.status === filter);

  const tabs = [
    { id: "", label: "Todos", count: enriched.length },
    { id: "PENDIENTE", label: "Pendientes", count: enriched.filter((p) => p.status === "PENDIENTE").length },
    { id: "VENCIDO", label: "Vencidos", count: enriched.filter((p) => p.status === "VENCIDO").length },
    { id: "PAGADO", label: "Pagados", count: enriched.filter((p) => p.status === "PAGADO").length },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
        <CreditCard size={24} /> Cobros / Pagos
      </h1>

      <Tabs tabs={tabs} active={filter} onChange={setFilter} />

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <CreditCard size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">No hay cobros</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">Propiedad</th>
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">Inquilino</th>
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">Período</th>
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">Vencimiento</th>
                  <th className="text-right py-3 px-3 text-gray-400 font-medium">Monto</th>
                  <th className="text-center py-3 px-3 text-gray-400 font-medium">Estado</th>
                  <th className="text-right py-3 px-3 text-gray-400 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3 px-3 text-white">{p.contract.property.title}</td>
                    <td className="py-3 px-3 text-gray-300">{p.contract.client.firstName} {p.contract.client.lastName}</td>
                    <td className="py-3 px-3 text-gray-300">{p.period}</td>
                    <td className="py-3 px-3 text-gray-300">{formatDate(p.dueDate)}</td>
                    <td className="py-3 px-3 text-right text-white font-medium">{formatCurrency(p.amount, p.currency)}</td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={statusBadge(p.status) as "success" | "warning" | "danger" | "default"}>{p.status}</Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {p.status !== "PAGADO" && (
                        <Button size="sm" onClick={() => markPaid(p.id, p.amount)}>
                          <Check size={14} className="mr-1" /> Cobrar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
