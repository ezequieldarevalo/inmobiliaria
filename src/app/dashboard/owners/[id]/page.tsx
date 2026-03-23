"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, User, Phone, Mail, Building2, FileText, DollarSign,
  CreditCard, AlertTriangle, Landmark, ChevronDown, ChevronRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { WhatsAppMenu, TEMPLATES } from "@/components/whatsapp-menu";

const STATUS_COLORS: Record<string, "success" | "warning" | "info" | "danger" | "default"> = {
  DISPONIBLE: "success", RESERVADA: "warning", VENDIDA: "info", ALQUILADA: "info", SUSPENDIDA: "danger",
};

export default function OwnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/owners/${params.id}`)
      .then((r) => r.json())
      .then(setOwner)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;
  if (!owner) return <div className="text-center py-20"><p className="text-gray-500">Propietario no encontrado</p></div>;

  const monthLabel = (m: string) => {
    const [y, mo] = m.split("-");
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${months[parseInt(mo) - 1]} ${y}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => router.back()} className="mt-1 p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{owner.firstName} {owner.lastName}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
            {owner.phone && <span className="flex items-center gap-1"><Phone size={14} /> {owner.phone}</span>}
            {owner.email && <span className="flex items-center gap-1"><Mail size={14} /> {owner.email}</span>}
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20"><Building2 size={18} className="text-blue-400" /></div>
            <div>
              <p className="text-2xl font-bold text-white">{owner.summary.totalProperties}</p>
              <p className="text-xs text-gray-500">Propiedades</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600/20"><DollarSign size={18} className="text-emerald-400" /></div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(owner.summary.totalNet, "ARS")}</p>
              <p className="text-xs text-gray-500">Neto liquidado</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-600/20"><FileText size={18} className="text-purple-400" /></div>
            <div>
              <p className="text-2xl font-bold text-white">{owner.summary.activeContracts}</p>
              <p className="text-xs text-gray-500">Contratos activos</p>
            </div>
          </div>
        </Card>
        <Card className={owner.summary.pendingPayments > 0 ? "border-yellow-500/30" : ""}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-600/20"><AlertTriangle size={18} className="text-yellow-400" /></div>
            <div>
              <p className="text-2xl font-bold text-white">{owner.summary.pendingPayments}</p>
              <p className="text-xs text-gray-500">Cobros pendientes</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Liquidation */}
          {owner.liquidation.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-400" /> Liquidación mensual
              </h2>
              <div className="space-y-2">
                {owner.liquidation.map((m: any) => (
                  <div key={m.month}>
                    <button onClick={() => setExpandedMonth(expandedMonth === m.month ? null : m.month)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-800 hover:border-gray-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <ChevronDown size={14} className={`text-gray-500 transition-transform ${expandedMonth === m.month ? "rotate-180" : ""}`} />
                        <span className="text-sm font-medium text-white">{monthLabel(m.month)}</span>
                      </div>
                      <div className="flex items-center gap-6 text-xs">
                        <span className="text-gray-500">Ingreso: <span className="text-white">{formatCurrency(m.income, "ARS")}</span></span>
                        <span className="text-gray-500">Comisión: <span className="text-red-400">-{formatCurrency(m.commission, "ARS")}</span></span>
                        <span className="text-gray-500">Neto: <span className="text-emerald-400 font-bold">{formatCurrency(m.net, "ARS")}</span></span>
                      </div>
                    </button>
                    {expandedMonth === m.month && (
                      <div className="ml-8 mt-1 space-y-1">
                        {m.details.map((d: any, i: number) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 text-xs bg-gray-900/50 rounded-lg border border-gray-800/50">
                            <div>
                              <span className="text-white">{d.property}</span>
                              <span className="text-gray-600 ml-2">({d.client})</span>
                            </div>
                            <div className="flex gap-4">
                              <span className="text-gray-400">{formatCurrency(d.amount, "ARS")}</span>
                              <span className="text-red-400">-{formatCurrency(d.commission, "ARS")}</span>
                              <span className="text-emerald-400 font-medium">{formatCurrency(d.net, "ARS")}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-sm">
                <span className="text-gray-400 font-medium">Total acumulado</span>
                <div className="flex items-center gap-6 text-xs">
                  <span className="text-gray-500">Ingreso: <span className="text-white">{formatCurrency(owner.summary.totalIncome, "ARS")}</span></span>
                  <span className="text-gray-500">Comisión: <span className="text-red-400">-{formatCurrency(owner.summary.totalCommission, "ARS")}</span></span>
                  <span className="text-gray-500">Neto: <span className="text-emerald-400 font-bold">{formatCurrency(owner.summary.totalNet, "ARS")}</span></span>
                </div>
              </div>
            </Card>
          )}

          {/* Properties */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-blue-400" /> Propiedades ({owner.properties.length})
            </h2>
            <div className="space-y-2">
              {owner.properties.map((p: any) => (
                <Link key={p.id} href={`/dashboard/properties/${p.id}`} className="block">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-800 hover:border-blue-500/30 transition-colors">
                    <div>
                      <p className="text-sm text-white font-medium">{p.title}</p>
                      <p className="text-xs text-gray-500">{p.street} {p.streetNumber}, {p.neighborhood || p.city}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_COLORS[p.status] || "default"} className="text-xs">{p.status}</Badge>
                      {p.price && <span className="text-xs font-medium text-white">{formatCurrency(p.price, p.currency)}</span>}
                      <ChevronRight size={14} className="text-gray-600" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Pending payments */}
          {owner.pendingPayments.length > 0 && (
            <Card className="border-yellow-500/20">
              <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-400" /> Cobros pendientes ({owner.pendingPayments.length})
              </h2>
              <div className="space-y-2">
                {owner.pendingPayments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant={p.status === "VENCIDO" ? "danger" : "warning"} className="text-[10px]">{p.status}</Badge>
                        <span className="text-xs text-gray-500">{p.period}</span>
                      </div>
                      <p className="text-xs text-white">{p.propertyTitle}</p>
                      <p className="text-xs text-gray-500">{p.clientName} - Vto: {formatDate(p.dueDate)}</p>
                    </div>
                    <p className="text-sm font-bold text-white">{formatCurrency(p.amount, p.currency)}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <User size={16} className="text-emerald-400" /> Datos del propietario
            </h3>
            <div className="space-y-2.5 text-sm">
              <p className="text-white font-medium">{owner.firstName} {owner.lastName}</p>
              {owner.dni && <p className="text-xs text-gray-400">DNI: {owner.dni}</p>}
              {owner.cuit && <p className="text-xs text-gray-400">CUIT: {owner.cuit}</p>}
              {owner.phone && (
                <a href={`tel:${owner.phone}`} className="flex items-center gap-2 text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                  <Phone size={12} /> {owner.phone}
                </a>
              )}
              {owner.email && (
                <a href={`mailto:${owner.email}`} className="flex items-center gap-2 text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                  <Mail size={12} /> {owner.email}
                </a>
              )}
              {owner.phone && (
                <div className="pt-2">
                  <WhatsAppMenu phone={owner.phone} templates={[
                    TEMPLATES.ownerReport(owner.firstName, new Date().toLocaleDateString("es-AR", { month: "long" })),
                  ]} />
                </div>
              )}
            </div>
          </Card>

          {(owner.bankAlias || owner.bankCbu) && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Landmark size={16} className="text-yellow-400" /> Datos bancarios
              </h3>
              <div className="space-y-2 text-xs">
                {owner.bankAlias && <div className="flex justify-between"><span className="text-gray-500">Alias</span><span className="text-white font-mono">{owner.bankAlias}</span></div>}
                {owner.bankCbu && <div className="flex justify-between"><span className="text-gray-500">CBU</span><span className="text-white font-mono text-[10px]">{owner.bankCbu}</span></div>}
              </div>
            </Card>
          )}

          {/* Quick info */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Resumen</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Registrado</span><span className="text-gray-300">{formatDate(owner.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Propiedades</span><span className="text-gray-300">{owner.properties.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Contratos activos</span><span className="text-gray-300">{owner.summary.activeContracts}</span></div>
              {owner.street && (
                <div className="flex justify-between"><span className="text-gray-500">Dirección</span><span className="text-gray-300">{owner.street} {owner.streetNumber}, {owner.city}</span></div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
