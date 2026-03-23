"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Plus, Phone, Mail } from "lucide-react";

interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dni: string | null;
  cuit: string | null;
  bankAlias: string | null;
  bankCbu: string | null;
  properties: { id: string; title: string; status: string }[];
}

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", dni: "", cuit: "",
    bankAlias: "", bankCbu: "", notes: "",
  });

  const loadOwners = () => {
    fetch("/api/owners")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setOwners(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOwners(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/owners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    setForm({ firstName: "", lastName: "", email: "", phone: "", dni: "", cuit: "", bankAlias: "", bankCbu: "", notes: "" });
    loadOwners();
  };

  const filtered = owners.filter((o) =>
    !search || `${o.firstName} ${o.lastName} ${o.email} ${o.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <UserCheck size={24} /> Propietarios
        </h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-1" /> Nuevo Propietario
        </Button>
      </div>

      <Input placeholder="Buscar propietarios..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : filtered.length === 0 ? (
        <Card><div className="text-center py-8"><UserCheck size={40} className="text-gray-700 mx-auto mb-3" /><p className="text-gray-400">No hay propietarios</p></div></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((o) => (
            <Card key={o.id}>
              <h3 className="font-semibold text-white">{o.firstName} {o.lastName}</h3>
              <div className="mt-2 space-y-1 text-sm">
                {o.phone && <p className="text-gray-400 flex items-center gap-2"><Phone size={12} /> {o.phone}</p>}
                {o.email && <p className="text-gray-400 flex items-center gap-2"><Mail size={12} /> {o.email}</p>}
                {o.dni && <p className="text-gray-500 text-xs">DNI: {o.dni}</p>}
                {o.bankAlias && <p className="text-gray-500 text-xs">Alias: {o.bankAlias}</p>}
              </div>
              {o.properties.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <p className="text-xs text-gray-500 mb-1">Propiedades ({o.properties.length})</p>
                  {o.properties.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-300">{p.title}</span>
                      <Badge variant={p.status === "DISPONIBLE" ? "success" : "default"} className="text-xs">{p.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nuevo Propietario">
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
            <Input label="DNI" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
            <Input label="CUIT" value={form.cuit} onChange={(e) => setForm({ ...form, cuit: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Alias bancario" value={form.bankAlias} onChange={(e) => setForm({ ...form, bankAlias: e.target.value })} />
            <Input label="CBU" value={form.bankCbu} onChange={(e) => setForm({ ...form, bankCbu: e.target.value })} />
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
