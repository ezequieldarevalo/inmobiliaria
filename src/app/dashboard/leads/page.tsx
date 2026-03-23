"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, TrendingUp, Calendar, FileText, Target,
  BarChart3, ArrowRight, Globe, MessageCircle, Instagram,
  Facebook, Eye as EyeIcon, UserCheck,
} from "lucide-react";

interface LeadMetrics {
  totalLeads: number;
  withAppointments: number;
  withContracts: number;
  activeContracts: number;
  conversionRate: number;
  sourceDistribution: Record<string, number>;
  monthlyLeads: { month: string; count: number }[];
  sourceConversion: { source: string; total: number; converted: number; rate: number }[];
}

const SOURCE_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  PORTAL: { icon: Globe, label: "Portal inmobiliario", color: "text-blue-400" },
  INSTAGRAM: { icon: Instagram, label: "Instagram", color: "text-pink-400" },
  FACEBOOK: { icon: Facebook, label: "Facebook", color: "text-blue-500" },
  REFERIDO: { icon: UserCheck, label: "Referido", color: "text-emerald-400" },
  CARTEL: { icon: EyeIcon, label: "Cartel", color: "text-yellow-400" },
  OTRO: { icon: Users, label: "Otro", color: "text-gray-400" },
  SIN_FUENTE: { icon: Users, label: "Sin fuente", color: "text-gray-600" },
};

export default function LeadsPage() {
  const [metrics, setMetrics] = useState<LeadMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then(setMetrics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Error al cargar métricas</p>
      </div>
    );
  }

  const maxMonthly = Math.max(...metrics.monthlyLeads.map((m) => m.count), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
        <Target size={24} /> Tracking de Leads
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10">
              <Users size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total leads</p>
              <p className="text-2xl font-bold text-white">{metrics.totalLeads}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-600/10">
              <Calendar size={20} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Con visitas</p>
              <p className="text-2xl font-bold text-white">{metrics.withAppointments}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/10">
              <FileText size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Con contratos</p>
              <p className="text-2xl font-bold text-white">{metrics.withContracts}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-600/10">
              <TrendingUp size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tasa conversión</p>
              <p className="text-2xl font-bold text-white">{metrics.conversionRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-emerald-400" /> Embudo de conversión
          </h2>
          <div className="space-y-3">
            {[
              { label: "Leads totales", value: metrics.totalLeads, color: "bg-blue-500", pct: 100 },
              { label: "Con visita agendada", value: metrics.withAppointments, color: "bg-cyan-500", pct: metrics.totalLeads > 0 ? Math.round((metrics.withAppointments / metrics.totalLeads) * 100) : 0 },
              { label: "Con contrato", value: metrics.withContracts, color: "bg-emerald-500", pct: metrics.totalLeads > 0 ? Math.round((metrics.withContracts / metrics.totalLeads) * 100) : 0 },
              { label: "Contratos activos", value: metrics.activeContracts, color: "bg-green-500", pct: metrics.totalLeads > 0 ? Math.round((metrics.activeContracts / metrics.totalLeads) * 100) : 0 },
            ].map((step, i) => (
              <div key={step.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400">{step.label}</span>
                  <span className="text-white font-medium">{step.value} ({step.pct}%)</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${step.color} rounded-full transition-all duration-500`}
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
                {i < 3 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight size={12} className="text-gray-700 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Source distribution */}
        <Card>
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Target size={16} className="text-purple-400" /> Origen de leads
          </h2>
          {Object.keys(metrics.sourceDistribution).length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Sin datos de fuente</p>
          ) : (
            <div className="space-y-3">
              {metrics.sourceConversion
                .sort((a, b) => b.total - a.total)
                .map((src) => {
                  const conf = SOURCE_CONFIG[src.source] || SOURCE_CONFIG.OTRO;
                  const SrcIcon = conf.icon;
                  const maxCount = Math.max(...metrics.sourceConversion.map((s) => s.total), 1);
                  return (
                    <div key={src.source} className="flex items-center gap-3">
                      <SrcIcon size={16} className={`shrink-0 ${conf.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">{conf.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{src.total}</span>
                            {src.converted > 0 && (
                              <Badge variant="success" className="text-[10px]">
                                {src.rate}% conv.
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${(src.total / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>

        {/* Monthly trend */}
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-400" /> Leads por mes (últimos 6 meses)
          </h2>
          <div className="flex items-end gap-3 h-40">
            {metrics.monthlyLeads.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-white font-medium">{m.count}</span>
                <div className="w-full bg-gray-800 rounded-t-lg overflow-hidden" style={{ height: "100%" }}>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all"
                    style={{
                      height: `${maxMonthly > 0 ? (m.count / maxMonthly) * 100 : 0}%`,
                      marginTop: "auto",
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 whitespace-nowrap">{m.month}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
