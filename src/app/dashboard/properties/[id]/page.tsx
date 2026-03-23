"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, MapPin, Bed, Bath, Maximize, Car, Building2, Ruler,
  Calendar, FileText, User, Phone, Mail, Edit, Trash2, Compass,
  Wifi, Waves, Dumbbell, Shield, TreePine, ChefHat, Wind, Users, Star, Share2, Check,
  Megaphone, Image as ImageIcon,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PhotoGallery, PhotoManager } from "@/components/photo-manager";
import { PublicationGenerator } from "@/components/publication-generator";

const PropertyMap = dynamic(() => import("@/components/property-map"), { ssr: false });

interface PropertyDetail {
  id: string;
  title: string;
  description: string | null;
  propertyType: string;
  operationType: string;
  status: string;
  price: number | null;
  currency: string;
  expensas: number | null;
  province: string | null;
  city: string | null;
  neighborhood: string | null;
  street: string | null;
  streetNumber: string | null;
  floor: string | null;
  apartment: string | null;
  zipCode: string | null;
  lat: number | null;
  lng: number | null;
  totalArea: number | null;
  coveredArea: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  age: number | null;
  floors: number | null;
  orientation: string | null;
  disposition: string | null;
  condition: string | null;
  amenities: string | null;
  images: string | null;
  coverIndex: number;
  portalPublished: boolean;
  createdAt: string;
  owner: { id: string; firstName: string; lastName: string; phone: string | null; email: string | null } | null;
  contracts: {
    id: string;
    contractType: string;
    status: string;
    startDate: string;
    endDate: string | null;
    amount: number;
    client: { firstName: string; lastName: string };
  }[];
  appointments: {
    id: string;
    title: string;
    date: string;
    time: string | null;
    type: string;
    status: string;
    client: { firstName: string; lastName: string } | null;
  }[];
}

const AMENITY_ICONS: Record<string, { icon: any; label: string }> = {
  PILETA: { icon: Waves, label: "Pileta" },
  QUINCHO: { icon: ChefHat, label: "Quincho" },
  PARRILLA: { icon: ChefHat, label: "Parrilla" },
  SUM: { icon: Building2, label: "SUM" },
  SEGURIDAD: { icon: Shield, label: "Seguridad" },
  LAUNDRY: { icon: Wind, label: "Laundry" },
  GYM: { icon: Dumbbell, label: "Gimnasio" },
  BALCON: { icon: Compass, label: "Balcón" },
  TERRAZA: { icon: Compass, label: "Terraza" },
  JARDIN: { icon: TreePine, label: "Jardín" },
  ASCENSOR: { icon: Building2, label: "Ascensor" },
};

const STATUS_COLORS: Record<string, "success" | "warning" | "info" | "danger" | "default"> = {
  DISPONIBLE: "success", RESERVADA: "warning", VENDIDA: "info", ALQUILADA: "info", SUSPENDIDA: "danger",
};

const CONDITION_LABELS: Record<string, string> = {
  EXCELENTE: "Excelente", MUY_BUENO: "Muy bueno", BUENO: "Bueno", REGULAR: "Regular",
  A_RECICLAR: "A reciclar", EN_CONSTRUCCION: "En construcción", A_ESTRENAR: "A estrenar", POZO: "Pozo",
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchedClients, setMatchedClients] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [savingPhotos, setSavingPhotos] = useState(false);

  useEffect(() => {
    fetch(`/api/properties/${params.id}`)
      .then((r) => r.json())
      .then(setProperty)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (property?.id) {
      fetch(`/api/match/property/${property.id}`)
        .then((r) => r.json())
        .then((data) => Array.isArray(data) ? setMatchedClients(data) : setMatchedClients([]))
        .catch(() => {});
    }
  }, [property?.id]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;
  if (!property) return <div className="text-center py-20"><p className="text-gray-500">Propiedad no encontrada</p></div>;

  const amenityList = property.amenities?.split(",").filter(Boolean) || [];
  const fullAddress = [property.street, property.streetNumber].filter(Boolean).join(" ");
  const locationParts = [property.neighborhood, property.city, property.province].filter(Boolean);

  const specs = [
    { icon: Maximize, label: "Ambientes", value: property.rooms },
    { icon: Bed, label: "Dormitorios", value: property.bedrooms },
    { icon: Bath, label: "Baños", value: property.bathrooms },
    { icon: Car, label: "Cocheras", value: property.garages },
    { icon: Ruler, label: "Sup. total", value: property.totalArea ? `${property.totalArea} m²` : null },
    { icon: Ruler, label: "Sup. cubierta", value: property.coveredArea ? `${property.coveredArea} m²` : null },
    { icon: Building2, label: "Antigüedad", value: property.age != null ? (property.age === 0 ? "A estrenar" : `${property.age} años`) : null },
    { icon: Building2, label: "Pisos", value: property.floors },
    { icon: Compass, label: "Orientación", value: property.orientation },
    { icon: Compass, label: "Disposición", value: property.disposition },
  ].filter((s) => s.value != null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => router.back()} className="mt-1 p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{property.title}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
              {fullAddress && <span className="flex items-center gap-1"><MapPin size={14} /> {fullAddress}</span>}
              {locationParts.length > 0 && <span>· {locationParts.join(", ")}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const url = `${window.location.origin}/property/${property.id}`;
            navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
          }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:text-white hover:border-gray-600 transition-colors">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
            {copied ? "Copiado" : "Compartir"}
          </button>
          <Badge variant={STATUS_COLORS[property.status] || "default"} className="text-xs">{property.status}</Badge>
        </div>
      </div>

      {/* Price + Operation */}
      <div className="flex flex-wrap items-center gap-4">
        {property.price && (
          <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-xl px-5 py-3">
            <p className="text-2xl font-bold text-emerald-400">
              {formatCurrency(property.price, property.currency)}
              {property.operationType !== "VENTA" && <span className="text-sm text-gray-400 font-normal">/mes</span>}
            </p>
            {property.expensas && <p className="text-xs text-gray-500 mt-0.5">+ {formatCurrency(property.expensas, "ARS")} expensas</p>}
          </div>
        )}
        <Badge variant="default" className="text-sm px-3 py-1.5">{property.propertyType}</Badge>
        <Badge variant={property.operationType === "VENTA" ? "info" : "success"} className="text-sm px-3 py-1.5">
          {property.operationType === "ALQUILER_TEMPORAL" ? "Alquiler temporal" : property.operationType}
        </Badge>
        {property.condition && <Badge variant="default" className="text-sm px-3 py-1.5">{CONDITION_LABELS[property.condition] || property.condition}</Badge>}
        {property.portalPublished && <Badge variant="warning" className="text-xs">Publicada en portales</Badge>}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowPhotos(!showPhotos)}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border transition-colors ${
            showPhotos ? "bg-emerald-600/20 border-emerald-600/40 text-emerald-400" : "bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:border-gray-600"
          }`}
        >
          <ImageIcon size={16} /> Fotos {(() => { try { const imgs = property.images ? JSON.parse(property.images) : []; return `(${imgs.length})`; } catch { return "(0)"; } })()}
        </button>
        <button
          onClick={() => setShowPublish(!showPublish)}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border transition-colors ${
            showPublish ? "bg-yellow-600/20 border-yellow-600/40 text-yellow-400" : "bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:border-gray-600"
          }`}
        >
          <Megaphone size={16} /> Publicar propiedad
        </button>
      </div>

      {/* Photo Gallery / Manager */}
      {showPhotos && (
        <Card>
          <PhotoManager
            images={(() => { try { return property.images ? JSON.parse(property.images) : []; } catch { return []; } })()}
            coverIndex={property.coverIndex || 0}
            onChange={async (imgs, ci) => {
              setSavingPhotos(true);
              try {
                await fetch(`/api/properties/${property.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ images: JSON.stringify(imgs), coverIndex: ci }),
                });
                setProperty({ ...property, images: JSON.stringify(imgs), coverIndex: ci });
              } catch {}
              setSavingPhotos(false);
            }}
          />
          {savingPhotos && <p className="text-xs text-emerald-400 mt-2">Guardando...</p>}
        </Card>
      )}

      {/* Photo Gallery Preview (when not in edit mode) */}
      {!showPhotos && (() => { try { const imgs = property.images ? JSON.parse(property.images) as string[] : []; return imgs.length > 0 ? (
        <PhotoGallery images={imgs} coverIndex={property.coverIndex || 0} />
      ) : null; } catch { return null; } })()}

      {/* Publication Generator */}
      {showPublish && (
        <PublicationGenerator property={property} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {property.description && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-300 mb-3">Descripción</h2>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{property.description}</p>
            </Card>
          )}

          {/* Specs grid */}
          {specs.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-300 mb-4">Características</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {specs.map((s) => (
                  <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                    <s.icon size={18} className="text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className="text-sm font-medium text-white">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Amenities */}
          {amenityList.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-300 mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {amenityList.map((a) => {
                  const info = AMENITY_ICONS[a];
                  const Icon = info?.icon || Building2;
                  return (
                    <div key={a} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/10 border border-emerald-600/20 text-sm text-emerald-300">
                      <Icon size={14} /> {info?.label || a}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Map */}
          {property.lat && property.lng && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-emerald-400" /> Ubicación
              </h2>
              <PropertyMap
                markers={[{ lat: property.lat, lng: property.lng, title: property.title }]}
                center={[property.lat, property.lng]}
                zoom={16}
                height="350px"
                singleMarker
              />
              {fullAddress && (
                <p className="text-xs text-gray-500 mt-3">
                  {fullAddress}{property.floor ? ` ${property.floor}° ${property.apartment || ""}` : ""}, {locationParts.join(", ")}
                </p>
              )}
            </Card>
          )}

          {/* Contracts */}
          {property.contracts.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <FileText size={16} className="text-blue-400" /> Contratos ({property.contracts.length})
              </h2>
              <div className="space-y-3">
                {property.contracts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={c.status === "VIGENTE" ? "success" : "default"} className="text-xs">{c.status}</Badge>
                        <span className="text-xs text-gray-500">{c.contractType}</span>
                      </div>
                      <p className="text-sm text-white">{c.client.firstName} {c.client.lastName}</p>
                      <p className="text-xs text-gray-500">{formatDate(c.startDate)} → {c.endDate ? formatDate(c.endDate) : "Sin fin"}</p>
                    </div>
                    <p className="text-sm font-bold text-white">{formatCurrency(c.amount, "ARS")}/mes</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Matched interested clients */}
          {matchedClients.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <Users size={16} className="text-purple-400" /> Interesados que coinciden ({matchedClients.length})
              </h2>
              <div className="space-y-3">
                {matchedClients.map((m: any) => (
                  <Link key={m.client.id} href={`/dashboard/clients/${m.client.id}`} className="block">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-gray-800 hover:border-purple-500/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-white truncate">{m.client.firstName} {m.client.lastName}</p>
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
                        {(m.client.phone || m.client.email) && (
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                            {m.client.phone && <span className="flex items-center gap-1"><Phone size={10} /> {m.client.phone}</span>}
                            {m.client.email && <span className="flex items-center gap-1"><Mail size={10} /> {m.client.email}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Owner card */}
          {property.owner && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <User size={16} className="text-yellow-400" /> Propietario
              </h3>
              <p className="text-white font-medium">{property.owner.firstName} {property.owner.lastName}</p>
              {property.owner.phone && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-2"><Phone size={12} /> {property.owner.phone}</p>
              )}
              {property.owner.email && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Mail size={12} /> {property.owner.email}</p>
              )}
            </Card>
          )}

          {/* Upcoming appointments */}
          {property.appointments.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-cyan-400" /> Visitas ({property.appointments.length})
              </h3>
              <div className="space-y-2">
                {property.appointments.slice(0, 5).map((a) => (
                  <div key={a.id} className="p-2.5 rounded-lg bg-gray-800/50 border border-gray-800">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={a.status === "CONFIRMADA" ? "success" : a.status === "CANCELADA" ? "danger" : "warning"} className="text-[10px]">{a.status}</Badge>
                      <span className="text-[10px] text-gray-600">{a.type}</span>
                    </div>
                    <p className="text-xs text-white">{a.title}</p>
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
              <div className="flex justify-between"><span className="text-gray-500">Creada</span><span className="text-gray-300">{formatDate(property.createdAt)}</span></div>
              {property.floor && <div className="flex justify-between"><span className="text-gray-500">Piso</span><span className="text-gray-300">{property.floor}° {property.apartment || ""}</span></div>}
              {property.zipCode && <div className="flex justify-between"><span className="text-gray-500">CP</span><span className="text-gray-300">{property.zipCode}</span></div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
