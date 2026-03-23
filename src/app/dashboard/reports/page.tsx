"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, TrendingUp, TrendingDown, Building2, FileText, Users, DollarSign,
  Percent, AlertTriangle, Clock, PieChart as PieChartIcon,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const CATEGORY_LABELS: Record<string, string> = {
  ALQUILER: "Alquiler", COMISION: "Comisión", EXPENSAS: "Expensas",
  IMPUESTO: "Impuesto", HONORARIO: "Honorario", MANTENIMIENTO: "Mantenimiento", OTRO: "Otro",
};
const SOURCE_LABELS: Record<string, string> = {
  PORTAL: "Portal", INSTAGRAM: "Instagram", FACEBOOK: "Facebook",
  REFERIDO: "Referido", CARTEL: "Cartel", OTRO: "Otro", SIN_FUENTE: "Sin fuente",
};
const STATUS_LABELS: Record<string, string> = {
  DISPONIBLE: "Disponible", RESERVADA: "Reservada", VENDIDA: "Vendida",
  ALQUILADA: "Alquilada", SUSPENDIDA: "Suspendida",
};
const TYPE_LABELS: Record<string, string> = {
  CASA: "Casa", DEPARTAMENTO: "Depto", LOCAL: "Local", TERRENO: "Terreno",
  OFICINA: "Oficina", GALPON: "Galpón", PH: "PH", COCHERA: "Cochera", CAMPO: "Campo",
};

interface ReportData {
  summary: {
    totalProperties: number; totalContracts: number; activeContracts: number;
    expiringContracts: number; occupancyRate: number; paymentCollectionRate: number;
    totalIncome: number; totalExpense: number; balance: number;
    totalClients: number; pendingPayments: number; overduePayments: number;
  };
  propertiesByType: Record<string, number>;
  propertiesByStatus: Record<string, number>;
  propertiesByNeighborhood: Record<string, number>;
  monthlyRevenue: { month: string; ingresos: number; egresos: number }[];
  byCategory: Record<string, number>;
  clientsBySource: Record<string, number>;
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

function toChartData(obj: Record<string, number>, labels?: Record<string, string>) {
  return Object.entries(obj).map(([key, value]) => ({
    name: labels?.[key] || key,
    value,
  }));
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports").then((r) => r.json()).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;
  if (!data) return <p className="text-gray-500 text-center py-10">No hay datos</p>;

  const { summary } = data;
  const propertyTypeData = toChartData(data.propertiesByType, TYPE_LABELS);
  const propertyStatusData = toChartData(data.propertiesByStatus, STATUS_LABELS);
  const categoryData = toChartData(data.byCategory, CATEGORY_LABELS);
  const sourceData = toChartData(data.clientsBySource, SOURCE_LABELS);
  const neighborhoodData = toChartData(data.propertiesByNeighborhood).sort((a, b) => b.value - a.value).slice(0, 8);

  const kpis = [
    { label: "Propiedades", value: summary.totalProperties, icon: Building2, color: "text-emerald-400", bg: "bg-emerald-600/15" },
    { label: "Contratos activos", value: summary.activeContracts, icon: FileText, color: "text-blue-400", bg: "bg-blue-600/15" },
    { label: "Tasa ocupación", value: `${summary.occupancyRate}%`, icon: Percent, color: "text-purple-400", bg: "bg-purple-600/15" },
    { label: "Tasa cobranza", value: `${summary.paymentCollectionRate}%`, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-600/15" },
    { label: "Cobros vencidos", value: summary.overduePayments, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-600/15" },
    { label: "Por vencer (90d)", value: summary.expiringContracts, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-600/15" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
        <BarChart3 size={24} /> Reportes
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${k.bg}`}>
                <k.icon size={18} className={k.color} />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{k.value}</p>
                <p className="text-[10px] text-gray-500 leading-tight">{k.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Financial summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3 mb-1">
            <TrendingUp size={18} className="text-green-400" />
            <span className="text-sm text-gray-400">Ingresos (6 meses)</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(summary.totalIncome, "ARS")}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-1">
            <TrendingDown size={18} className="text-red-400" />
            <span className="text-sm text-gray-400">Egresos (6 meses)</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(summary.totalExpense, "ARS")}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-1">
            <DollarSign size={18} className={summary.balance >= 0 ? "text-emerald-400" : "text-red-400"} />
            <span className="text-sm text-gray-400">Balance</span>
          </div>
          <p className={`text-2xl font-bold ${summary.balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatCurrency(summary.balance, "ARS")}
          </p>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      {data.monthlyRevenue.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Ingresos vs Egresos mensuales</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyRevenue}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" fillOpacity={1} fill="url(#colorIngresos)" strokeWidth={2} />
                <Area type="monotone" dataKey="egresos" name="Egresos" stroke="#ef4444" fillOpacity={1} fill="url(#colorEgresos)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Properties by type */}
        {propertyTypeData.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Propiedades por tipo</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={propertyTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {propertyTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Properties by status */}
        {propertyStatusData.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Propiedades por estado</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={propertyStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {propertyStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Income by category */}
        {categoryData.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Movimientos por categoría</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" stroke="#6b7280" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Monto" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Clients by source */}
        {sourceData.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Users size={16} className="text-blue-400" /> Interesados por canal
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Properties by neighborhood */}
        {neighborhoodData.length > 0 && (
          <Card className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Propiedades por barrio (top 8)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={neighborhoodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Propiedades" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
