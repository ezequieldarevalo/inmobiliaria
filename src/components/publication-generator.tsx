"use client";

import { useState } from "react";
import {
  Sparkles, Copy, Check, ExternalLink, MessageCircle,
  CheckCircle2, Circle, Globe, ShoppingBag, Megaphone,
  Eye, FileText, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PropertyData {
  id: string;
  title: string;
  description?: string | null;
  propertyType: string;
  operationType: string;
  status: string;
  price?: number | null;
  currency?: string;
  expensas?: number | null;
  province?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  street?: string | null;
  streetNumber?: string | null;
  totalArea?: number | null;
  coveredArea?: number | null;
  rooms?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  garages?: number | null;
  age?: number | null;
  condition?: string | null;
  amenities?: string | null;
  images?: string | null;
  coverIndex?: number;
  floor?: string | null;
  apartment?: string | null;
}

interface PublicationChecklist {
  zonaprop: boolean;
  mercadolibre: boolean;
  argenprop: boolean;
  whatsapp: boolean;
  portalPropio: boolean;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  CASA: "Casa",
  DEPARTAMENTO: "Departamento",
  LOCAL: "Local comercial",
  TERRENO: "Terreno",
  OFICINA: "Oficina",
  GALPON: "Galpón",
  PH: "PH",
  COCHERA: "Cochera",
  CAMPO: "Campo",
};

const OPERATION_LABELS: Record<string, string> = {
  VENTA: "Venta",
  ALQUILER: "Alquiler",
  ALQUILER_TEMPORAL: "Alquiler temporal",
};

const CONDITION_LABELS: Record<string, string> = {
  EXCELENTE: "excelente estado",
  MUY_BUENO: "muy buen estado",
  BUENO: "buen estado",
  A_ESTRENAR: "a estrenar",
  EN_CONSTRUCCION: "en construcción",
  POZO: "en pozo",
};

const AMENITY_LABELS: Record<string, string> = {
  PILETA: "pileta",
  QUINCHO: "quincho",
  PARRILLA: "parrilla",
  SUM: "SUM",
  SEGURIDAD: "seguridad 24hs",
  GYM: "gimnasio",
  BALCON: "balcón",
  TERRAZA: "terraza",
  JARDIN: "jardín",
  ASCENSOR: "ascensor",
  LAUNDRY: "lavadero",
};

function formatCurrency(amount: number, currency: string = "ARS") {
  return currency === "USD" ? `US$ ${amount.toLocaleString("es-AR")}` : `$ ${amount.toLocaleString("es-AR")}`;
}

function generateOptimizedTitle(p: PropertyData): string {
  const parts: string[] = [];
  const type = PROPERTY_TYPE_LABELS[p.propertyType] || p.propertyType;

  if (p.rooms) {
    parts.push(`${type} ${p.rooms} amb.`);
  } else {
    parts.push(type);
  }

  if (p.condition === "A_ESTRENAR") parts.push("a estrenar");

  if (p.neighborhood) {
    parts.push(`en ${p.neighborhood}`);
  } else if (p.city) {
    parts.push(`en ${p.city}`);
  }

  if (p.coveredArea) {
    parts.push(`- ${p.coveredArea}m²`);
  }

  if (p.amenities) {
    const amenList = p.amenities.split(",").filter(Boolean);
    if (amenList.includes("PILETA")) parts.push("c/pileta");
    if (amenList.includes("BALCON")) parts.push("c/balcón");
    if (amenList.includes("JARDIN")) parts.push("c/jardín");
    if (amenList.includes("TERRAZA")) parts.push("c/terraza");
  }

  return parts.join(" ");
}

function generateProfessionalDescription(p: PropertyData): string {
  const lines: string[] = [];
  const type = PROPERTY_TYPE_LABELS[p.propertyType] || p.propertyType;
  const op = p.operationType === "VENTA" ? "venta" : "alquiler";

  // Opening line
  let opening = `${type} en ${op}`;
  if (p.neighborhood && p.city) {
    opening += ` en ${p.neighborhood}, ${p.city}`;
  } else if (p.city) {
    opening += ` en ${p.city}`;
  }
  opening += ".";
  lines.push(opening);

  // Location details
  if (p.street) {
    let loc = `Ubicación: ${p.street} ${p.streetNumber || ""}`;
    if (p.floor) loc += `, piso ${p.floor}`;
    if (p.apartment) loc += ` depto ${p.apartment}`;
    loc += ".";
    lines.push(loc);
  }

  lines.push("");

  // Specs
  const specParts: string[] = [];
  if (p.rooms) specParts.push(`${p.rooms} ambientes`);
  if (p.bedrooms) specParts.push(`${p.bedrooms} dormitorio${p.bedrooms > 1 ? "s" : ""}`);
  if (p.bathrooms) specParts.push(`${p.bathrooms} baño${p.bathrooms > 1 ? "s" : ""}`);
  if (p.garages) specParts.push(`${p.garages} cochera${p.garages > 1 ? "s" : ""}`);
  if (specParts.length > 0) {
    lines.push(`▸ ${specParts.join(" | ")}`);
  }

  // Surface
  const surfParts: string[] = [];
  if (p.totalArea) surfParts.push(`${p.totalArea}m² totales`);
  if (p.coveredArea) surfParts.push(`${p.coveredArea}m² cubiertos`);
  if (surfParts.length > 0) {
    lines.push(`▸ Superficie: ${surfParts.join(" / ")}`);
  }

  // Condition + Age
  if (p.condition) {
    const condLabel = CONDITION_LABELS[p.condition];
    if (condLabel) {
      lines.push(`▸ Estado: ${condLabel}${p.age ? ` (${p.age} años)` : ""}`);
    }
  } else if (p.age != null) {
    lines.push(`▸ Antigüedad: ${p.age === 0 ? "a estrenar" : `${p.age} años`}`);
  }

  // Amenities
  if (p.amenities) {
    const amenList = p.amenities.split(",").filter(Boolean);
    const labels = amenList.map(a => AMENITY_LABELS[a]).filter(Boolean);
    if (labels.length > 0) {
      lines.push("");
      lines.push(`Amenities: ${labels.join(", ")}.`);
    }
  }

  lines.push("");

  // Price
  if (p.price) {
    lines.push(`💰 Precio: ${formatCurrency(p.price, p.currency || "ARS")}${p.operationType !== "VENTA" ? "/mes" : ""}`);
    if (p.expensas) {
      lines.push(`   Expensas: ${formatCurrency(p.expensas, "ARS")}`);
    }
  }

  lines.push("");
  lines.push("📲 Consultá ahora por más información.");

  return lines.join("\n");
}

function generateWhatsAppMessage(p: PropertyData, shareUrl: string): string {
  const type = PROPERTY_TYPE_LABELS[p.propertyType] || p.propertyType;
  const lines: string[] = [];

  lines.push(`🏠 *${type} en ${p.operationType === "VENTA" ? "venta" : "alquiler"}*`);
  if (p.neighborhood || p.city) {
    lines.push(`📍 ${[p.neighborhood, p.city].filter(Boolean).join(", ")}`);
  }
  if (p.price) {
    lines.push(`💰 ${formatCurrency(p.price, p.currency || "ARS")}${p.operationType !== "VENTA" ? "/mes" : ""}`);
  }

  const specs: string[] = [];
  if (p.rooms) specs.push(`${p.rooms} amb`);
  if (p.coveredArea) specs.push(`${p.coveredArea}m²`);
  if (specs.length) lines.push(`📐 ${specs.join(" · ")}`);

  lines.push("");
  lines.push(`👉 Más info: ${shareUrl}`);

  return lines.join("\n");
}

export function PublicationGenerator({ property }: { property: PropertyData }) {
  const [generatedTitle, setGeneratedTitle] = useState(() => generateOptimizedTitle(property));
  const [generatedDesc, setGeneratedDesc] = useState(() => generateProfessionalDescription(property));
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [checklist, setChecklist] = useState<PublicationChecklist>({
    zonaprop: false,
    mercadolibre: false,
    argenprop: false,
    whatsapp: false,
    portalPropio: false,
  });
  const [saving, setSaving] = useState(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/property/${property.id}` : "";

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAll = async () => {
    const full = `${generatedTitle}\n\n${generatedDesc}\n\n🔗 ${shareUrl}`;
    await copyToClipboard(full, "all");
  };

  const regenerate = () => {
    setGeneratedTitle(generateOptimizedTitle(property));
    setGeneratedDesc(generateProfessionalDescription(property));
  };

  const toggleCheck = (key: keyof PublicationChecklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePublish = async (portal: string) => {
    setSaving(true);
    try {
      await fetch("/api/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          portal,
          status: "PUBLICADA",
          generatedTitle,
          generatedDesc,
        }),
      });
      toggleCheck(portal.toLowerCase().replace("_", "") as keyof PublicationChecklist);
    } catch {}
    setSaving(false);
  };

  const portals = [
    { key: "zonaprop" as const, label: "ZonaProp", icon: Globe, url: "https://www.zonaprop.com.ar/publicar", color: "text-blue-400" },
    { key: "mercadolibre" as const, label: "MercadoLibre", icon: ShoppingBag, url: "https://www.mercadolibre.com.ar/publicar", color: "text-yellow-400" },
    { key: "argenprop" as const, label: "Argenprop", icon: Globe, url: "https://www.argenprop.com/publicar", color: "text-orange-400" },
    { key: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle, url: null, color: "text-green-400" },
    { key: "portalPropio" as const, label: "Link Público", icon: Megaphone, url: null, color: "text-emerald-400" },
  ];

  const completedCount = Object.values(checklist).filter(Boolean).length;

  const images = property.images ? JSON.parse(property.images) as string[] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-400" /> Publicación Inteligente
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={regenerate} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            <RefreshCw size={12} /> Regenerar
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
            <Eye size={12} /> {showPreview ? "Ocultar" : "Preview"}
          </button>
        </div>
      </div>

      {/* Generated Title */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-500 font-medium">Título optimizado</label>
          <button
            onClick={() => copyToClipboard(generatedTitle, "title")}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
          >
            {copiedField === "title" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copiedField === "title" ? "Copiado" : "Copiar"}
          </button>
        </div>
        <textarea
          value={generatedTitle}
          onChange={(e) => setGeneratedTitle(e.target.value)}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          rows={2}
        />
      </Card>

      {/* Generated Description */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-500 font-medium">Descripción profesional</label>
          <button
            onClick={() => copyToClipboard(generatedDesc, "desc")}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
          >
            {copiedField === "desc" ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copiedField === "desc" ? "Copiado" : "Copiar"}
          </button>
        </div>
        <textarea
          value={generatedDesc}
          onChange={(e) => setGeneratedDesc(e.target.value)}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono"
          rows={12}
        />
      </Card>

      {/* Copy all + share URL */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={copyAll} className="flex-1">
          {copiedField === "all" ? <Check size={16} className="mr-1" /> : <Copy size={16} className="mr-1" />}
          {copiedField === "all" ? "¡Copiado!" : "Copiar todo"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => copyToClipboard(shareUrl, "url")}
          className="flex-1"
        >
          {copiedField === "url" ? <Check size={16} className="mr-1 text-emerald-400" /> : <Megaphone size={16} className="mr-1" />}
          {copiedField === "url" ? "¡Link copiado!" : "Copiar link público"}
        </Button>
      </div>

      {/* Checklist */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <FileText size={14} /> Checklist de publicación
          </h3>
          <Badge variant={completedCount === portals.length ? "success" : completedCount > 0 ? "warning" : "default"}>
            {completedCount}/{portals.length}
          </Badge>
        </div>
        <div className="space-y-2">
          {portals.map((portal) => (
            <div
              key={portal.key}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                checklist[portal.key]
                  ? "bg-emerald-600/5 border-emerald-600/30"
                  : "bg-gray-800/30 border-gray-800 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <button onClick={() => toggleCheck(portal.key)} className="shrink-0">
                  {checklist[portal.key] ? (
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  ) : (
                    <Circle size={20} className="text-gray-600" />
                  )}
                </button>
                <portal.icon size={16} className={portal.color} />
                <span className={`text-sm ${checklist[portal.key] ? "text-white" : "text-gray-400"}`}>
                  {portal.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {portal.key === "whatsapp" ? (
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(generateWhatsAppMessage(property, shareUrl))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors"
                  >
                    <MessageCircle size={12} /> Enviar
                  </a>
                ) : portal.key === "portalPropio" ? (
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
                  >
                    <ExternalLink size={12} /> Ver
                  </a>
                ) : portal.url ? (
                  <>
                    <button
                      onClick={() => handlePublish(portal.key.toUpperCase())}
                      disabled={saving}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={12} /> Marcar
                    </button>
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <ExternalLink size={12} /> Ir
                    </a>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Portal Preview */}
      {showPreview && (
        <Card className="!bg-white !border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">Preview tipo portal</h3>
          <div className="space-y-4">
            {/* Gallery preview */}
            {images.length > 0 && (
              <div className="aspect-[16/9] rounded-lg overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[property.coverIndex || 0] || images[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {/* Price */}
            {property.price && (
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(property.price, property.currency || "ARS")}
                {property.operationType !== "VENTA" && <span className="text-base text-gray-500 font-normal"> /mes</span>}
              </p>
            )}
            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-800">{generatedTitle}</h2>
            {/* Location */}
            <p className="text-sm text-gray-500">
              📍 {[property.street, property.streetNumber].filter(Boolean).join(" ")}
              {property.neighborhood ? `, ${property.neighborhood}` : ""}
              {property.city ? `, ${property.city}` : ""}
            </p>
            {/* Specs row */}
            <div className="flex gap-6 text-sm text-gray-600">
              {property.totalArea && <span>{property.totalArea} m² tot.</span>}
              {property.coveredArea && <span>{property.coveredArea} m² cub.</span>}
              {property.rooms && <span>{property.rooms} amb.</span>}
              {property.bedrooms && <span>{property.bedrooms} dorm.</span>}
              {property.bathrooms && <span>{property.bathrooms} baños</span>}
            </div>
            {/* Description */}
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{generatedDesc}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
