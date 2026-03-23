"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, FileText, Calendar, AlertTriangle, CreditCard, TrendingUp, Percent } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];
const STATUS_LABELS: Record<string, string> = {
  DISPONIBLE: "Disponible", RESERVADA: "Reservada", VENDIDA: "Vendida",
  ALQUILADA: "Alquilada", SUSPENDIDA: "Suspendida",
};

interface DashboardData {
  properties: number;
  clients: number;
  activeContracts: number;
  upcomingAppointments: number;
  overduePayments: number;
  occupancyRate: number;
  monthlyRevenue: { month: string; ingresos: number; egresos: number }[];
  propertyStatusBreakdown: Record<string, number>;
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value, "ARS")}
        </p>
      ))}
    </div>
  );
};

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
    { label: "Tasa ocupación", value: `${data?.occupancyRate || 0}%`, icon: Percent, color: "bg-yellow-600/20 text-yellow-400" },
  ];

  const statusPieData = data?.propertyStatusBreakdown
    ? Object.entries(data.propertyStatusBreakdown).map(([key, value]) => ({ name: STATUS_LABELS[key] || key, value }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{loading ? "..." : s.value}</p>
                <p className="text-[10px] text-gray-400">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        {data?.monthlyRevenue && data.monthlyRevenue.length > 0 && (
          <Card className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" /> Ingresos vs Egresos
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyRevenue}>
                  <defs>
                    <linearGradient id="dashIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dashEgresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" fillOpacity={1} fill="url(#dashIngresos)" strokeWidth={2} />
                  <Area type="monotone" dataKey="egresos" name="Egresos" stroke="#ef4444" fillOpacity={1} fill="url(#dashEgresos)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Property status pie */}
        {statusPieData.length > 0 && (
          <Card>
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-blue-400" /> Estado propiedades
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {statusPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
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
