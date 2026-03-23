"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { Building2, Plus, Search, MapPin, Bed, Bath, Maximize } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Property {
  id: string;
  title: string;
  propertyType: string;
  operationType: string;
  status: string;
  price: number | null;
  currency: string;
  province: string | null;
  city: string | null;
  neighborhood: string | null;
  street: string | null;
  streetNumber: string | null;
  totalArea: number | null;
  coveredArea: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garages: number | null;
  owner: { firstName: string; lastName: string } | null;
}

const PROPERTY_TYPES = [
  { value: "CASA", label: "Casa" },
  { value: "DEPARTAMENTO", label: "Departamento" },
  { value: "LOCAL", label: "Local" },
  { value: "TERRENO", label: "Terreno" },
  { value: "OFICINA", label: "Oficina" },
  { value: "GALPON", label: "Galpón" },
  { value: "PH", label: "PH" },
  { value: "COCHERA", label: "Cochera" },
  { value: "CAMPO", label: "Campo" },
];

const OPERATION_TYPES = [
  { value: "VENTA", label: "Venta" },
  { value: "ALQUILER", label: "Alquiler" },
  { value: "ALQUILER_TEMPORAL", label: "Alquiler temporal" },
];

const STATUS_OPTIONS = [
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "RESERVADA", label: "Reservada" },
  { value: "VENDIDA", label: "Vendida" },
  { value: "ALQUILADA", label: "Alquilada" },
  { value: "SUSPENDIDA", label: "Suspendida" },
];

const statusBadge = (s: string) => {
  switch (s) {
    case "DISPONIBLE": return "success";
    case "RESERVADA": return "warning";
    case "VENDIDA": case "ALQUILADA": return "info";
    case "SUSPENDIDA": return "danger";
    default: return "default";
  }
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterOp, setFilterOp] = useState("");
  const [form, setForm] = useState({
    title: "", propertyType: "", operationType: "", status: "DISPONIBLE",
    price: "", currency: "ARS", province: "", city: "", neighborhood: "",
    street: "", streetNumber: "", totalArea: "", coveredArea: "",
    rooms: "", bedrooms: "", bathrooms: "", garages: "", description: "",
  });

  const loadProperties = () => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setProperties(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProperties(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: form.price ? parseFloat(form.price) : null,
        totalArea: form.totalArea ? parseFloat(form.totalArea) : null,
        coveredArea: form.coveredArea ? parseFloat(form.coveredArea) : null,
        rooms: form.rooms ? parseInt(form.rooms) : null,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        garages: form.garages ? parseInt(form.garages) : null,
      }),
    });
    setShowModal(false);
    setForm({
      title: "", propertyType: "", operationType: "", status: "DISPONIBLE",
      price: "", currency: "ARS", province: "", city: "", neighborhood: "",
      street: "", streetNumber: "", totalArea: "", coveredArea: "",
      rooms: "", bedrooms: "", bathrooms: "", garages: "", description: "",
    });
    loadProperties();
  };

  const filtered = properties.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()) ||
      p.neighborhood?.toLowerCase().includes(search.toLowerCase());
    const matchOp = !filterOp || p.operationType === filterOp;
    return matchSearch && matchOp;
  });

  const opTabs = [
    { id: "", label: "Todas", count: properties.length },
    { id: "VENTA", label: "Venta", count: properties.filter((p) => p.operationType === "VENTA").length },
    { id: "ALQUILER", label: "Alquiler", count: properties.filter((p) => p.operationType === "ALQUILER").length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Building2 size={24} /> Propiedades
        </h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-1" /> Nueva Propiedad
        </Button>
      </div>

      <Tabs tabs={opTabs} active={filterOp} onChange={setFilterOp} />

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por título, ciudad o barrio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Building2 size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">No hay propiedades</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white text-sm">{p.title}</h3>
                  {p.street && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {p.street} {p.streetNumber}, {p.city}
                    </p>
                  )}
                </div>
                <Badge variant={statusBadge(p.status) as "success" | "warning" | "info" | "danger" | "default"}>
                  {p.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="default">{p.propertyType}</Badge>
                <Badge variant={p.operationType === "VENTA" ? "info" : "success"}>
                  {p.operationType === "ALQUILER_TEMPORAL" ? "Temporal" : p.operationType}
                </Badge>
              </div>
              {p.price && (
                <p className="text-lg font-bold text-white mb-3">
                  {formatCurrency(p.price, p.currency)}
                  {p.operationType !== "VENTA" && <span className="text-xs text-gray-500 font-normal">/mes</span>}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {p.rooms && <span className="flex items-center gap-1"><Maximize size={12} />{p.rooms} amb</span>}
                {p.bedrooms && <span className="flex items-center gap-1"><Bed size={12} />{p.bedrooms} dorm</span>}
                {p.bathrooms && <span className="flex items-center gap-1"><Bath size={12} />{p.bathrooms} baños</span>}
                {p.totalArea && <span>{p.totalArea} m²</span>}
              </div>
              {p.owner && (
                <p className="text-xs text-gray-500 mt-2">
                  Propietario: {p.owner.firstName} {p.owner.lastName}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nueva Propiedad" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tipo" options={PROPERTY_TYPES} value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} required />
            <Select label="Operación" options={OPERATION_TYPES} value={form.operationType} onChange={(e) => setForm({ ...form, operationType: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Precio" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Select label="Moneda" options={[{ value: "ARS", label: "ARS" }, { value: "USD", label: "USD" }]} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Provincia" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
            <Input label="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Barrio" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Calle" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
              <Input label="Nro" value={form.streetNumber} onChange={(e) => setForm({ ...form, streetNumber: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Input label="Ambientes" type="number" value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} />
            <Input label="Dormitorios" type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
            <Input label="Baños" type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
            <Input label="Cocheras" type="number" value={form.garages} onChange={(e) => setForm({ ...form, garages: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sup. total (m²)" type="number" value={form.totalArea} onChange={(e) => setForm({ ...form, totalArea: e.target.value })} />
            <Input label="Sup. cubierta (m²)" type="number" value={form.coveredArea} onChange={(e) => setForm({ ...form, coveredArea: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
