"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users, Plus, Phone, Mail } from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  clientType: string;
  source: string | null;
  searchType: string | null;
  searchZone: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  notes: string | null;
}

const CLIENT_TYPES = [
  { value: "INTERESADO", label: "Interesado" },
  { value: "INQUILINO", label: "Inquilino" },
  { value: "COMPRADOR", label: "Comprador" },
  { value: "GARANTE", label: "Garante" },
];

const SOURCES = [
  { value: "PORTAL", label: "Portal" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "REFERIDO", label: "Referido" },
  { value: "CARTEL", label: "Cartel" },
  { value: "OTRO", label: "Otro" },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", dni: "",
    clientType: "INTERESADO", source: "", searchType: "", searchZone: "",
    budgetMin: "", budgetMax: "", notes: "",
  });

  const loadClients = () => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setClients(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadClients(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        budgetMin: form.budgetMin ? parseFloat(form.budgetMin) : null,
        budgetMax: form.budgetMax ? parseFloat(form.budgetMax) : null,
      }),
    });
    setShowModal(false);
    setForm({ firstName: "", lastName: "", email: "", phone: "", dni: "", clientType: "INTERESADO", source: "", searchType: "", searchZone: "", budgetMin: "", budgetMax: "", notes: "" });
    loadClients();
  };

  const filtered = clients.filter((c) =>
    !search || `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  const typeBadge = (t: string) => {
    switch (t) {
      case "INQUILINO": return "info";
      case "COMPRADOR": return "success";
      case "GARANTE": return "warning";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Users size={24} /> Interesados / Clientes
        </h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-1" /> Nuevo
        </Button>
      </div>

      <Input placeholder="Buscar clientes..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : filtered.length === 0 ? (
        <Card><div className="text-center py-8"><Users size={40} className="text-gray-700 mx-auto mb-3" /><p className="text-gray-400">No hay clientes</p></div></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Link key={c.id} href={`/dashboard/clients/${c.id}`}>
            <Card className="hover:border-emerald-500/30 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-white">{c.firstName} {c.lastName}</h3>
                <Badge variant={typeBadge(c.clientType) as "success" | "warning" | "info" | "default"}>{c.clientType}</Badge>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                {c.phone && <p className="text-gray-400 flex items-center gap-2"><Phone size={12} /> {c.phone}</p>}
                {c.email && <p className="text-gray-400 flex items-center gap-2"><Mail size={12} /> {c.email}</p>}
                {c.source && <p className="text-xs text-gray-500">Origen: {c.source}</p>}
                {c.searchZone && <p className="text-xs text-gray-500">Busca en: {c.searchZone}</p>}
              </div>
            </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nuevo Cliente">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <Input label="Apellido" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tipo" options={CLIENT_TYPES} value={form.clientType} onChange={(e) => setForm({ ...form, clientType: e.target.value })} />
            <Select label="Origen" options={SOURCES} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </div>
          <Input label="Zona de búsqueda" value={form.searchZone} onChange={(e) => setForm({ ...form, searchZone: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
