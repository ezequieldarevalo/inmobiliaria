"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Building2, Users, FileText, Calendar, AlertTriangle, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardData {
  properties: number;
  clients: number;
  activeContracts: number;
  upcomingAppointments: number;
  overduePayments: number;
  recentPayments: {
    id: string;
    period: string;
    dueDate: string;
    amount: number;
    currency: string;
    status: string;
    contract: {
      property: { title: string };
      client: { firstName: string; lastName: string };
    };
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Propiedades", value: data?.properties || 0, icon: Building2, color: "bg-emerald-600/20 text-emerald-400" },
    { label: "Interesados", value: data?.clients || 0, icon: Users, color: "bg-blue-600/20 text-blue-400" },
    { label: "Contratos activos", value: data?.activeContracts || 0, icon: FileText, color: "bg-purple-600/20 text-purple-400" },
    { label: "Visitas próximas", value: data?.upcomingAppointments || 0, icon: Calendar, color: "bg-cyan-600/20 text-cyan-400" },
    { label: "Cobros vencidos", value: data?.overduePayments || 0, icon: AlertTriangle, color: "bg-red-600/20 text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{loading ? "..." : s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Upcoming payments */}
      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard size={20} className="text-emerald-400" /> Próximos cobros
        </h2>
        {!data?.recentPayments?.length ? (
          <p className="text-sm text-gray-500">No hay cobros pendientes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Propiedad</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Inquilino</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Período</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Vencimiento</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-800/50">
                    <td className="py-2 px-3 text-white">{p.contract.property.title}</td>
                    <td className="py-2 px-3 text-gray-300">
                      {p.contract.client.firstName} {p.contract.client.lastName}
                    </td>
                    <td className="py-2 px-3 text-gray-300">{p.period}</td>
                    <td className="py-2 px-3 text-gray-300">{formatDate(p.dueDate)}</td>
                    <td className="py-2 px-3 text-right text-white font-medium">
                      {formatCurrency(p.amount, p.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
