"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Crown, ArrowRight, Clock, Copy, Check } from "lucide-react";
import { PLANS, getPlan, formatPlanPrice, type PlanId } from "@/lib/plans";

const PAYMENT_ALIAS = "total.abundance.cp";

interface Agency {
  id: string;
  name: string;
  email: string | null;
  cuit: string | null;
  phone: string | null;
  province: string | null;
  city: string | null;
  street: string | null;
  streetNumber: string | null;
  matricula: string | null;
  schedule: string | null;
  description: string | null;
  plan: string;
}

function PlanSection({ agency }: { agency: Agency | null }) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<{ requestedPlan: string } | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/plan/upgrade")
      .then((r) => r.json())
      .then((data) => { if (data?.pendingRequest) setPendingRequest(data.pendingRequest); })
      .catch(() => {});
  }, []);

  const handleUpgradeClick = (planId: PlanId) => {
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  const handleConfirmRequest = async () => {
    if (!selectedPlan) return;
    const res = await fetch("/api/plan/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestedPlan: selectedPlan }),
    });
    if (res.ok) {
      setRequestSent(true);
      setShowPayment(false);
      setPendingRequest({ requestedPlan: selectedPlan });
    }
  };

  const copyAlias = () => {
    navigator.clipboard.writeText(PAYMENT_ALIAS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentPlan = agency?.plan || "STARTER";

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Crown size={20} className="text-yellow-500" /> Plan Actual
            </h2>
            <p className="text-gray-400 text-sm mt-1">Tu plan determina las funcionalidades disponibles</p>
          </div>
          <div className="flex items-center gap-2">
            {pendingRequest && (
              <Badge variant="warning" className="text-xs flex items-center gap-1">
                <Clock size={12} /> Cambio pendiente
              </Badge>
            )}
            <Badge variant="info" className="text-sm px-3 py-1.5">{getPlan(currentPlan).name}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.values(PLANS) as typeof PLANS[PlanId][]).map((p) => {
            const isCurrent = currentPlan === p.id;
            const isUpgrade = Object.keys(PLANS).indexOf(p.id) > Object.keys(PLANS).indexOf(currentPlan);
            return (
              <div key={p.id} className={`rounded-xl p-4 border ${isCurrent ? "border-emerald-500 bg-emerald-600/10" : "border-gray-700 bg-gray-800/50"}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{p.name}</h3>
                  {isCurrent && <Badge variant="success" className="text-xs">Actual</Badge>}
                </div>
                <p className="text-xl font-bold text-white">{formatPlanPrice(p.price)}</p>
                <p className="text-xs text-gray-500 mb-3">/mes</p>
                <ul className="space-y-1.5 mb-4">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-400">
                      <Check size={12} className={`mt-0.5 shrink-0 ${isCurrent ? "text-emerald-400" : "text-gray-600"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                {isUpgrade && !pendingRequest && (
                  <button onClick={() => handleUpgradeClick(p.id)} className="w-full py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1">
                    Cambiar a {p.name} <ArrowRight size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {showPayment && selectedPlan && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowPayment(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Cambiar a {getPlan(selectedPlan).name}</h3>
            <p className="text-sm text-gray-400 mb-6">Realizá una transferencia al siguiente alias:</p>
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">Monto mensual</p>
              <p className="text-2xl font-bold text-white">{formatPlanPrice(getPlan(selectedPlan).price)}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">Alias de transferencia</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-mono text-emerald-400 font-bold">{PAYMENT_ALIAS}</p>
                <button onClick={copyAlias} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-gray-700 px-2 py-1 rounded">
                  <Copy size={12} /> {copied ? "¡Copiado!" : "Copiar"}
                </button>
              </div>
            </div>
            <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-4 mb-6">
              <p className="text-xs text-yellow-400">Una vez realizada la transferencia, hacé click en &quot;Solicitar cambio&quot;. Verificaremos el pago y activaremos tu plan.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPayment(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700">Cancelar</button>
              <button onClick={handleConfirmRequest} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white">Solicitar cambio</button>
            </div>
          </div>
        </div>
      )}

      {requestSent && (
        <Card>
          <div className="flex items-center gap-3 text-green-400">
            <Check size={20} />
            <div>
              <p className="font-medium">¡Solicitud enviada!</p>
              <p className="text-sm text-gray-400">Te notificaremos cuando sea aprobada.</p>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

export default function SettingsPage() {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", cuit: "", phone: "", province: "", city: "",
    street: "", streetNumber: "", matricula: "", schedule: "", description: "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/agency")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setAgency(data);
          setForm({
            name: data.name || "", email: data.email || "", cuit: data.cuit || "",
            phone: data.phone || "", province: data.province || "", city: data.city || "",
            street: data.street || "", streetNumber: data.streetNumber || "",
            matricula: data.matricula || "", schedule: data.schedule || "",
            description: data.description || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/agency", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Configuración</h1>

      <PlanSection agency={agency} />

      <Card>
        <h2 className="text-lg font-semibold mb-4">Datos de la Inmobiliaria</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="CUIT" value={form.cuit} onChange={(e) => setForm({ ...form, cuit: e.target.value })} />
            <Input label="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Input label="Matrícula inmobiliaria" value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Provincia" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
            <Input label="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Calle" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
            <Input label="Número" value={form.streetNumber} onChange={(e) => setForm({ ...form, streetNumber: e.target.value })} />
          </div>
          <Button type="submit" disabled={loading}>
            <Save size={16} className="mr-1" /> {saved ? "¡Guardado!" : "Guardar cambios"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
