"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import {
  Bell, AlertTriangle, Clock, FileText, CreditCard, Calendar,
  Phone, MessageCircle, TrendingUp, ChevronRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AlertData {
  contractAlerts: any[];
  paymentAlerts: any[];
  upcomingPaymentAlerts: any[];
  adjustmentAlerts: any[];
  appointmentAlerts: any[];
  summary: { critical: number; warnings: number; total: number };
}

const SEVERITY_STYLES = {
  critical: "border-red-500/30 bg-red-600/5",
  warning: "border-yellow-500/30 bg-yellow-600/5",
  info: "border-blue-500/30 bg-blue-600/5",
};
const SEVERITY_BADGE: Record<string, "danger" | "warning" | "info"> = {
  critical: "danger",
  warning: "warning",
  info: "info",
};

function WhatsAppButton({ phone, message }: { phone: string | null; message: string }) {
  if (!phone) return null;
  const cleanPhone = phone.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  return (
    <a href={waUrl} target="_blank" rel="noopener noreferrer"
       className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-md bg-green-600/15 text-green-400 border border-green-600/20 hover:bg-green-600/25 transition-colors">
      <MessageCircle size={10} /> WhatsApp
    </a>
  );
}

export default function AlertsPage() {
  const [data, setData] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: "all", label: "Todas", count: data?.summary.total || 0 },
    { id: "contracts", label: "Contratos", count: (data?.contractAlerts.length || 0) + (data?.adjustmentAlerts.length || 0) },
    { id: "payments", label: "Cobros", count: (data?.paymentAlerts.length || 0) + (data?.upcomingPaymentAlerts.length || 0) },
    { id: "appointments", label: "Visitas", count: data?.appointmentAlerts.length || 0 },
  ];

  const getAlerts = () => {
    if (!data) return [];
    switch (filter) {
      case "contracts": return [...data.contractAlerts, ...data.adjustmentAlerts];
      case "payments": return [...data.paymentAlerts, ...data.upcomingPaymentAlerts];
      case "appointments": return data.appointmentAlerts;
      default: return [
        ...data.paymentAlerts,
        ...data.contractAlerts,
        ...data.adjustmentAlerts,
        ...data.upcomingPaymentAlerts,
        ...data.appointmentAlerts,
      ];
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "contract_expiring": return <FileText size={16} className="text-orange-400" />;
      case "payment_overdue": return <AlertTriangle size={16} className="text-red-400" />;
      case "payment_upcoming": return <CreditCard size={16} className="text-blue-400" />;
      case "adjustment_due": return <TrendingUp size={16} className="text-purple-400" />;
      case "appointment": return <Calendar size={16} className="text-cyan-400" />;
      default: return <Bell size={16} />;
    }
  };

  const getWaMessage = (alert: any) => {
    switch (alert.type) {
      case "payment_overdue":
        return `Hola ${alert.meta.clientName}, le recordamos que tiene un pago pendiente del período ${alert.meta.period} por ${formatCurrency(alert.meta.amount, alert.meta.currency)} correspondiente a ${alert.meta.propertyTitle}. Quedo a disposición.`;
      case "payment_upcoming":
        return `Hola ${alert.meta.clientName}, le recordamos que próximamente vence el pago del período ${alert.meta.period} por ${formatCurrency(alert.meta.amount, alert.meta.currency)}. Quedo a disposición.`;
      case "contract_expiring":
        return `Hola ${alert.meta.clientName}, le informamos que su contrato de ${alert.meta.contractType.toLowerCase()} de ${alert.meta.propertyTitle} está próximo a vencer. Coordinemos una reunión para evaluar la renovación.`;
      case "appointment":
        return `Hola${alert.meta.clientName ? ` ${alert.meta.clientName}` : ""}, le confirmo la visita ${alert.meta.time ? `a las ${alert.meta.time}` : "de hoy"}. ¿Todo en orden?`;
      default:
        return "Hola, me comunico desde la inmobiliaria.";
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;

  const alerts = getAlerts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Bell size={24} /> Alertas y Vencimientos
        </h1>
        {data && data.summary.critical > 0 && (
          <Badge variant="danger" className="text-sm px-3 py-1">
            {data.summary.critical} críticas
          </Badge>
        )}
      </div>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className={data.paymentAlerts.length > 0 ? "border-red-500/30" : ""}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-600/20"><AlertTriangle size={18} className="text-red-400" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{data.paymentAlerts.length}</p>
                <p className="text-xs text-gray-500">Pagos vencidos</p>
              </div>
            </div>
          </Card>
          <Card className={data.contractAlerts.length > 0 ? "border-orange-500/30" : ""}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-600/20"><FileText size={18} className="text-orange-400" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{data.contractAlerts.length}</p>
                <p className="text-xs text-gray-500">Contratos por vencer</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-600/20"><TrendingUp size={18} className="text-purple-400" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{data.adjustmentAlerts.length}</p>
                <p className="text-xs text-gray-500">Ajustes próximos</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-600/20"><Calendar size={18} className="text-cyan-400" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{data.appointmentAlerts.length}</p>
                <p className="text-xs text-gray-500">Visitas hoy/mañana</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Tabs tabs={tabs} active={filter} onChange={setFilter} />

      {alerts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Bell size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Sin alertas pendientes</p>
            <p className="text-gray-600 text-sm mt-1">Todo está en orden</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert: any) => (
            <Card key={alert.id} className={SEVERITY_STYLES[alert.severity as keyof typeof SEVERITY_STYLES] || ""}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5">{getIcon(alert.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white">{alert.title}</p>
                      <Badge variant={SEVERITY_BADGE[alert.severity] || "default"} className="text-[10px]">
                        {alert.severity === "critical" ? "Urgente" : alert.severity === "warning" ? "Atención" : "Info"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">{alert.description}</p>
                    {alert.meta?.amount && (
                      <p className="text-xs text-gray-500 mt-1">
                        Monto: <span className="text-white font-medium">{formatCurrency(alert.meta.amount, alert.meta.currency)}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {alert.meta?.clientPhone && (
                        <WhatsAppButton phone={alert.meta.clientPhone} message={getWaMessage(alert)} />
                      )}
                      {alert.meta?.clientPhone && (
                        <a href={`tel:${alert.meta.clientPhone}`}
                           className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-md bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600 transition-colors">
                          <Phone size={10} /> Llamar
                        </a>
                      )}
                      {alert.meta?.propertyId && (
                        <Link href={`/dashboard/properties/${alert.meta.propertyId}`}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-md bg-emerald-600/15 text-emerald-400 border border-emerald-600/20 hover:bg-emerald-600/25 transition-colors">
                          Ver propiedad <ChevronRight size={10} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">{alert.date ? formatDate(alert.date) : ""}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
