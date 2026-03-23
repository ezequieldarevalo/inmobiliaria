"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import {
  Megaphone, Globe, ShoppingBag, MessageCircle, ExternalLink,
  Building2, Search, CheckCircle2, Clock, Pause, XCircle,
  BarChart3, Eye, Copy, Check,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Publication {
  id: string;
  propertyId: string;
  portal: string;
  status: string;
  externalUrl: string | null;
  generatedTitle: string | null;
  publishedAt: string | null;
  lastSyncAt: string | null;
  createdAt: string;
  property: {
    id: string;
    title: string;
    propertyType: string;
    operationType: string;
    status: string;
    price: number | null;
    currency: string;
    city: string | null;
    neighborhood: string | null;
    images: string | null;
    coverIndex: number;
  };
}

const PORTAL_CONFIG: Record<string, { icon: any; label: string; color: string; bgColor: string }> = {
  ZONAPROP: { icon: Globe, label: "ZonaProp", color: "text-blue-400", bgColor: "bg-blue-400/10 border-blue-400/20" },
  MERCADOLIBRE: { icon: ShoppingBag, label: "MercadoLibre", color: "text-yellow-400", bgColor: "bg-yellow-400/10 border-yellow-400/20" },
  ARGENPROP: { icon: Globe, label: "Argenprop", color: "text-orange-400", bgColor: "bg-orange-400/10 border-orange-400/20" },
  WHATSAPP: { icon: MessageCircle, label: "WhatsApp", color: "text-green-400", bgColor: "bg-green-400/10 border-green-400/20" },
  PORTAL_PROPIO: { icon: Megaphone, label: "Link Público", color: "text-emerald-400", bgColor: "bg-emerald-400/10 border-emerald-400/20" },
};

const STATUS_CONFIG: Record<string, { variant: "success" | "warning" | "info" | "danger" | "default"; icon: any; label: string }> = {
  PUBLICADA: { variant: "success", icon: CheckCircle2, label: "Publicada" },
  BORRADOR: { variant: "default", icon: Clock, label: "Borrador" },
  PAUSADA: { variant: "warning", icon: Pause, label: "Pausada" },
  FINALIZADA: { variant: "danger", icon: XCircle, label: "Finalizada" },
};

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPortal, setFilterPortal] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/publications")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setPublications(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group publications by property
  const propertyMap = new Map<string, { property: Publication["property"]; publications: Publication[] }>();
  publications.forEach((pub) => {
    const existing = propertyMap.get(pub.propertyId);
    if (existing) {
      existing.publications.push(pub);
    } else {
      propertyMap.set(pub.propertyId, { property: pub.property, publications: [pub] });
    }
  });

  const propertyGroups = Array.from(propertyMap.values());

  const filtered = propertyGroups.filter((g) => {
    const matchSearch = !search ||
      g.property.title.toLowerCase().includes(search.toLowerCase()) ||
      g.property.city?.toLowerCase().includes(search.toLowerCase());
    const matchPortal = !filterPortal ||
      g.publications.some((p) => p.portal === filterPortal);
    return matchSearch && matchPortal;
  });

  // Stats
  const totalPubs = publications.length;
  const publishedCount = publications.filter((p) => p.status === "PUBLICADA").length;
  const uniqueProperties = propertyMap.size;
  const portalCounts = publications.reduce((acc, p) => {
    acc[p.portal] = (acc[p.portal] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const portalTabs = [
    { id: "", label: "Todos", count: totalPubs },
    ...Object.entries(PORTAL_CONFIG).map(([key, config]) => ({
      id: key,
      label: config.label,
      count: portalCounts[key] || 0,
    })),
  ];

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Megaphone size={24} /> Publicaciones
        </h1>
        <Link href="/dashboard/properties">
          <Button variant="ghost">
            <Building2 size={16} className="mr-1" /> Ir a propiedades
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-600/10">
              <BarChart3 size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total publicaciones</p>
              <p className="text-lg font-bold text-white">{totalPubs}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-600/10">
              <CheckCircle2 size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Activas</p>
              <p className="text-lg font-bold text-white">{publishedCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/10">
              <Building2 size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Propiedades</p>
              <p className="text-lg font-bold text-white">{uniqueProperties}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-600/10">
              <Globe size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Portales usados</p>
              <p className="text-lg font-bold text-white">{Object.keys(portalCounts).length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Tabs tabs={portalTabs} active={filterPortal} onChange={setFilterPortal} />

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar propiedad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Megaphone size={48} className="text-gray-700 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-300 mb-2">
              {totalPubs === 0 ? "Sin publicaciones aún" : "Sin resultados"}
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
              {totalPubs === 0
                ? "Publicá tus propiedades desde el detalle de cada una usando el botón \"Publicar propiedad\"."
                : "No hay publicaciones que coincidan con tu búsqueda."
              }
            </p>
            {totalPubs === 0 && (
              <Link href="/dashboard/properties">
                <Button>
                  <Building2 size={16} className="mr-1" /> Ir a propiedades
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((group) => {
            const { property, publications: pubs } = group;
            const images = property.images ? JSON.parse(property.images) as string[] : [];
            const coverImg = images[property.coverIndex || 0] || images[0];

            return (
              <Card key={property.id} className="!p-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {/* Thumbnail */}
                  {coverImg && (
                    <div className="sm:w-48 h-32 sm:h-auto shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverImg} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <Link href={`/dashboard/properties/${property.id}`} className="text-sm font-semibold text-white hover:text-emerald-400 transition-colors">
                          {property.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="default" className="text-[10px]">{property.propertyType}</Badge>
                          <Badge variant={property.operationType === "VENTA" ? "info" : "success"} className="text-[10px]">
                            {property.operationType}
                          </Badge>
                          {property.price && (
                            <span className="text-xs text-gray-400">
                              {formatCurrency(property.price, property.currency)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link href={`/dashboard/properties/${property.id}`}>
                        <Button variant="ghost" className="!px-2 !py-1 text-xs">
                          <Eye size={12} className="mr-1" /> Ver
                        </Button>
                      </Link>
                    </div>

                    {/* Portal badges */}
                    <div className="flex flex-wrap gap-2">
                      {pubs.map((pub) => {
                        const portalConf = PORTAL_CONFIG[pub.portal] || PORTAL_CONFIG.PORTAL_PROPIO;
                        const statusConf = STATUS_CONFIG[pub.status] || STATUS_CONFIG.BORRADOR;
                        const PortalIcon = portalConf.icon;

                        return (
                          <div
                            key={pub.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${portalConf.bgColor}`}
                          >
                            <PortalIcon size={14} className={portalConf.color} />
                            <span className="text-xs text-gray-300">{portalConf.label}</span>
                            <Badge variant={statusConf.variant} className="text-[10px] !px-1.5">
                              {statusConf.label}
                            </Badge>
                            {pub.publishedAt && (
                              <span className="text-[10px] text-gray-600">
                                {new Date(pub.publishedAt).toLocaleDateString("es-AR")}
                              </span>
                            )}
                            {pub.externalUrl && (
                              <a href={pub.externalUrl} target="_blank" rel="noopener noreferrer"
                                 className="text-gray-500 hover:text-white transition-colors">
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick copy link */}
                    <div className="mt-3 pt-3 border-t border-gray-800 flex items-center gap-3">
                      <button
                        onClick={() => copyLink(`${window.location.origin}/property/${property.id}`, property.id)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-400 transition-colors"
                      >
                        {copiedId === property.id ? (
                          <><Check size={12} className="text-emerald-400" /> Copiado</>
                        ) : (
                          <><Copy size={12} /> Copiar link público</>
                        )}
                      </button>
                      <span className="text-[10px] text-gray-700">
                        {pubs.length} publicación{pubs.length !== 1 ? "es" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
