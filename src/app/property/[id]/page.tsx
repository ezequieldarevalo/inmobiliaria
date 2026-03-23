"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  MapPin, Bed, Bath, Maximize, Car, Building2, Ruler,
  Compass, Phone, Mail, MessageCircle,
} from "lucide-react";

const PropertyMap = dynamic(() => import("@/components/property-map"), { ssr: false });

const AMENITY_LABELS: Record<string, string> = {
  PILETA: "Pileta", QUINCHO: "Quincho", PARRILLA: "Parrilla", SUM: "SUM",
  SEGURIDAD: "Seguridad", GYM: "Gimnasio", BALCON: "Balcón", TERRAZA: "Terraza",
  JARDIN: "Jardín", ASCENSOR: "Ascensor", LAUNDRY: "Laundry",
};

const CONDITION_LABELS: Record<string, string> = {
  EXCELENTE: "Excelente", MUY_BUENO: "Muy bueno", BUENO: "Bueno", REGULAR: "Regular",
  A_RECICLAR: "A reciclar", EN_CONSTRUCCION: "En construcción", A_ESTRENAR: "A estrenar", POZO: "Pozo",
};

function formatCurrency(amount: number, currency: string = "ARS") {
  return currency === "USD" ? `US$ ${amount.toLocaleString("es-AR")}` : `$ ${amount.toLocaleString("es-AR")}`;
}

export default function PublicPropertyPage() {
  const params = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/share/property/${params.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then(setProperty)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Building2 size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Propiedad no disponible</p>
        </div>
      </div>
    );
  }

  const amenities = property.amenities?.split(",").filter(Boolean) || [];
  const address = [property.street, property.streetNumber].filter(Boolean).join(" ");
  const location = [property.neighborhood, property.city, property.province].filter(Boolean);

  const specs = [
    { icon: Maximize, label: "Ambientes", value: property.rooms },
    { icon: Bed, label: "Dormitorios", value: property.bedrooms },
    { icon: Bath, label: "Baños", value: property.bathrooms },
    { icon: Car, label: "Cocheras", value: property.garages },
    { icon: Ruler, label: "Sup. total", value: property.totalArea ? `${property.totalArea} m²` : null },
    { icon: Ruler, label: "Sup. cubierta", value: property.coveredArea ? `${property.coveredArea} m²` : null },
    { icon: Building2, label: "Antigüedad", value: property.age != null ? (property.age === 0 ? "A estrenar" : `${property.age} años`) : null },
    { icon: Compass, label: "Orientación", value: property.orientation },
  ].filter((s) => s.value);

  const waPhone = property.agency?.phone?.replace(/\D/g, "");
  const waMessage = `Hola, estoy interesado/a en la propiedad "${property.title}" (${property.operationType}) ubicada en ${address}, ${location.join(", ")}. ¿Podría darme más información?`;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Building2 size={16} />
            </div>
            <span className="text-sm font-bold">{property.agency?.name || "InmoGestor"}</span>
          </div>
          <div className="flex items-center gap-2">
            {property.agency?.phone && (
              <a href={`tel:${property.agency.phone}`} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors">
                <Phone size={16} />
              </a>
            )}
            {waPhone && (
              <a href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`}
                 target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
                <MessageCircle size={16} /> Consultar
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Title + badges */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-400 text-sm font-medium border border-emerald-600/30">
                {property.operationType === "ALQUILER_TEMPORAL" ? "Alquiler temporal" : property.operationType}
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-sm border border-gray-700">
                {property.propertyType}
              </span>
              {property.condition && (
                <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-sm border border-gray-700">
                  {CONDITION_LABELS[property.condition] || property.condition}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">{property.title}</h1>
            {(address || location.length > 0) && (
              <p className="text-gray-400 flex items-center gap-1 mt-2">
                <MapPin size={16} /> {address}{address && location.length > 0 ? ", " : ""}{location.join(", ")}
              </p>
            )}
          </div>

          {/* Price */}
          {property.price && (
            <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-2xl px-6 py-4 inline-block">
              <p className="text-3xl font-bold text-emerald-400">
                {formatCurrency(property.price, property.currency)}
                {property.operationType !== "VENTA" && <span className="text-base text-gray-400 font-normal">/mes</span>}
              </p>
              {property.expensas && <p className="text-sm text-gray-500 mt-1">+ {formatCurrency(property.expensas, "ARS")} expensas</p>}
            </div>
          )}

          {/* Specs */}
          {specs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center gap-3 p-4 rounded-xl bg-gray-900 border border-gray-800">
                  <s.icon size={20} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="text-sm font-medium">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {property.description && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">Descripción</h2>
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a: string) => (
                  <span key={a} className="px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-300 text-sm border border-emerald-600/20">
                    {AMENITY_LABELS[a] || a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {property.lat && property.lng && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-emerald-400" /> Ubicación
              </h2>
              <PropertyMap
                markers={[{ lat: property.lat, lng: property.lng, title: property.title }]}
                center={[property.lat, property.lng]}
                zoom={15}
                height="300px"
                singleMarker
              />
            </div>
          )}

          {/* CTA */}
          {waPhone && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-400 mb-3">¿Te interesa esta propiedad?</p>
              <a href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`}
                 target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors">
                <MessageCircle size={20} /> Consultar por WhatsApp
              </a>
              {property.agency?.email && (
                <p className="text-xs text-gray-500 mt-3">
                  O escribinos a <a href={`mailto:${property.agency.email}`} className="text-emerald-400 hover:underline">{property.agency.email}</a>
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-800 py-6 text-center mt-12">
        <p className="text-xs text-gray-600">Publicado con InmoGestor</p>
      </footer>
    </div>
  );
}
