"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, User, Phone, Mail, FileText, Calendar, MapPin,
  Search, Building2, DollarSign, Home, Star,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { WhatsAppMenu, TEMPLATES } from "@/components/whatsapp-menu";

const CLIENT_TYPE_LABELS: Record<string, { label: string; variant: "success" | "info" | "warning" | "default" }> = {
  INTERESADO: { label: "Interesado", variant: "info" },
  INQUILINO: { label: "Inquilino", variant: "success" },
  COMPRADOR: { label: "Comprador", variant: "warning" },
  GARANTE: { label: "Garante", variant: "default" },
};

const SOURCE_LABELS: Record<string, string> = {
  PORTAL: "Portal inmobiliario", INSTAGRAM: "Instagram", FACEBOOK: "Facebook",
  REFERIDO: "Referido", CARTEL: "Cartel", OTRO: "Otro",
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matchedProperties, setMatchedProperties] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/clients/${params.id}`)
      .then((r) => r.json())
      .then(setClient)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (client?.id) {
      fetch(`/api/match/client/${client.id}`)
        .then((r) => r.json())
        .then((data) => Array.isArray(data) ? setMatchedProperties(data) : setMatchedProperties([]))
        .catch(() => {});
    }
  }, [client?.id]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;
  if (!client) return <div className="text-center py-20"><p className="text-gray-500">Cliente no encontrado</p></div>;

  const typeInfo = CLIENT_TYPE_LABELS[client.clientType] || { label: client.clientType, variant: "default" as const };
  const hasPreferences = client.searchType || client.searchZone || client.budgetMax || client.searchRooms || client.searchPropertyType;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.back()} className="mt-1 p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{client.firstName} {client.lastName}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
              {client.phone && <span className="flex items-center gap-1"><Phone size={14} /> {client.phone}</span>}
              {client.email && <span className="flex items-center gap-1"><Mail size={14} /> {client.email}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search preferences */}
          {hasPreferences && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <Search size={16} className="text-emerald-400" /> Preferencias de búsqueda
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {client.searchType && (
                  <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                    <p className="text-xs text-gray-500 mb-1">Operación</p>
                    <p className="text-sm text-white font-medium">{client.searchType === "ALQUILER" ? "Alquiler" : "Venta"}</p>
                  </div>
                )}
                {client.searchPropertyType && (
                  <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                    <p className="text-xs text-gray-500 mb-1">Tipo</p>
                    <p className="text-sm text-white font-medium">{client.searchPropertyType}</p>
                  </div>
                )}
                {client.searchZone && (
                  <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                    <p className="text-xs text-gray-500 mb-1">Zona</p>
                    <p className="text-sm text-white font-medium">{client.searchZone}</p>
                  </div>
                )}
                {(client.budgetMin || client.budgetMax) && (
                  <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                    <p className="text-xs text-gray-500 mb-1">Presupuesto</p>
                    <p className="text-sm text-white font-medium">
                      {client.budgetMin ? formatCurrency(client.budgetMin, client.budgetCurrency || "ARS") : ""} 
                      {client.budgetMin && client.budgetMax ? " - " : ""}
                      {client.budgetMax ? formatCurrency(client.budgetMax, client.budgetCurrency || "ARS") : ""}
                    </p>
                  </div>
                )}
                {client.searchRooms && (
                  <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                    <p className="text-xs text-gray-500 mb-1">Ambientes</p>
                    <p className="text-sm text-white font-medium">{client.searchRooms} amb.</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Matched properties */}
          {matchedProperties.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <Home size={16} className="text-purple-400" /> Propiedades sugeridas ({matchedProperties.length})
              </h2>
              <div className="space-y-3">
                {matchedProperties.map((m: any) => (
                  <Link key={m.property.id} href={`/dashboard/properties/${m.property.id}`} className="block">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-800 hover:border-purple-500/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-white truncate">{m.property.title}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star size={12} className={m.matchPercent >= 70 ? "text-yellow-400 fill-yellow-400" : m.matchPercent >= 40 ? "text-yellow-400" : "text-gray-600"} />
                            <span className={`text-xs font-bold ${m.matchPercent >= 70 ? "text-emerald-400" : m.matchPercent >= 40 ? "text-yellow-400" : "text-gray-500"}`}>
                              {m.matchPercent}%
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {m.reasons.map((r: string, i: number) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-600/15 text-purple-300 border border-purple-600/20">{r}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                          {m.property.street && <span className="flex items-center gap-1"><MapPin size={10} /> {m.property.street} {m.property.streetNumber}</span>}
                          {m.property.price && <span className="flex items-center gap-1"><DollarSign size={10} /> {formatCurrency(m.property.price, m.property.currency)}</span>}
                          <Badge variant="default" className="text-[10px]">{m.property.operationType}</Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Contracts */}
          {client.contracts?.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <FileText size={16} className="text-blue-400" /> Contratos ({client.contracts.length})
              </h2>
              <div className="space-y-3">
                {client.contracts.map((c: any) => (
                  <Link key={c.id} href={`/dashboard/properties/${c.property.id}`} className="block">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-800 hover:border-blue-500/30 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={c.status === "VIGENTE" ? "success" : "default"} className="text-xs">{c.status}</Badge>
                          <span className="text-xs text-gray-500">{c.contractType}</span>
                        </div>
                        <p className="text-sm text-white">{c.property.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(c.startDate)} → {c.endDate ? formatDate(c.endDate) : "Sin fin"}</p>
                      </div>
                      <p className="text-sm font-bold text-white">{formatCurrency(c.amount, "ARS")}/mes</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          {client.notes && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-300 mb-3">Notas</h2>
              <p className="text-sm text-gray-400 whitespace-pre-wrap">{client.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact info */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <User size={16} className="text-emerald-400" /> Datos de contacto
            </h3>
            <div className="space-y-2.5 text-sm">
              <p className="text-white font-medium">{client.firstName} {client.lastName}</p>
              {client.dni && <p className="text-xs text-gray-400">DNI: {client.dni}</p>}
              {client.phone && (
                <a href={`https://wa.me/${client.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                  <Phone size={12} /> {client.phone}
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                  <Mail size={12} /> {client.email}
                </a>
              )}
              {client.phone && (
                <div className="pt-2">
                  <WhatsAppMenu phone={client.phone} templates={[
                    TEMPLATES.welcomeClient(`${client.firstName}`),
                    ...(matchedProperties.length > 0 ? [TEMPLATES.newProperty(
                      client.firstName,
                      matchedProperties[0].property.title,
                      matchedProperties[0].property.price ? formatCurrency(matchedProperties[0].property.price, matchedProperties[0].property.currency) : "",
                      matchedProperties[0].property.neighborhood || ""
                    )] : []),
                  ]} />
                </div>
              )}
              {client.source && (
                <div className="pt-2 border-t border-gray-800">
                  <p className="text-xs text-gray-500">Origen: <span className="text-gray-300">{SOURCE_LABELS[client.source] || client.source}</span></p>
                </div>
              )}
            </div>
          </Card>

          {/* Appointments */}
          {client.appointments?.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-cyan-400" /> Visitas ({client.appointments.length})
              </h3>
              <div className="space-y-2">
                {client.appointments.map((a: any) => (
                  <div key={a.id} className="p-2.5 rounded-lg bg-gray-800/50 border border-gray-800">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={a.status === "CONFIRMADA" ? "success" : a.status === "CANCELADA" ? "danger" : "warning"} className="text-[10px]">{a.status}</Badge>
                      <span className="text-[10px] text-gray-600">{a.type}</span>
                    </div>
                    <p className="text-xs text-white">{a.title}</p>
                    {a.property && <p className="text-[10px] text-gray-500">{a.property.title}</p>}
                    <p className="text-[10px] text-gray-500 mt-1">{formatDate(a.date)} {a.time || ""}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quick info */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Info rápida</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Registrado</span><span className="text-gray-300">{formatDate(client.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tipo</span><span className="text-gray-300">{typeInfo.label}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Contratos</span><span className="text-gray-300">{client.contracts?.length || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Visitas</span><span className="text-gray-300">{client.appointments?.length || 0}</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
