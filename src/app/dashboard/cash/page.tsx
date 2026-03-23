"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Wallet, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
}

const CATEGORIES = [
  { value: "ALQUILER", label: "Alquiler" },
  { value: "COMISION", label: "Comisión" },
  { value: "EXPENSAS", label: "Expensas" },
  { value: "IMPUESTO", label: "Impuesto" },
  { value: "HONORARIO", label: "Honorario" },
  { value: "MANTENIMIENTO", label: "Mantenimiento" },
  { value: "OTRO", label: "Otro" },
];

export default function CashPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    type: "INGRESO", category: "", description: "", amount: "", currency: "ARS",
    date: new Date().toISOString().split("T")[0],
  });

  const loadTransactions = () => {
    fetch("/api/cash")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setTransactions(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTransactions(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/cash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount), date: new Date(form.date).toISOString() }),
    });
    setShowModal(false);
    setForm({ type: "INGRESO", category: "", description: "", amount: "", currency: "ARS", date: new Date().toISOString().split("T")[0] });
    loadTransactions();
  };

  const ingresos = transactions.filter((t) => t.type === "INGRESO").reduce((a, t) => a + t.amount, 0);
  const egresos = transactions.filter((t) => t.type === "EGRESO").reduce((a, t) => a + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Wallet size={24} /> Caja
        </h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-1" /> Nuevo Movimiento
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <TrendingUp className="text-green-400" size={24} />
            <div>
              <p className="text-xs text-gray-400">Ingresos</p>
              <p className="text-xl font-bold text-green-400">{formatCurrency(ingresos)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <TrendingDown className="text-red-400" size={24} />
            <div>
              <p className="text-xs text-gray-400">Egresos</p>
              <p className="text-xl font-bold text-red-400">{formatCurrency(egresos)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Wallet className="text-emerald-400" size={24} />
            <div>
              <p className="text-xs text-gray-400">Balance</p>
              <p className={`text-xl font-bold ${ingresos - egresos >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatCurrency(ingresos - egresos)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">Fecha</th>
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">Tipo</th>
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">Categoría</th>
                  <th className="text-left py-3 px-3 text-gray-400 font-medium">Descripción</th>
                  <th className="text-right py-3 px-3 text-gray-400 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-800/50">
                    <td className="py-3 px-3 text-gray-300">{formatDate(t.date)}</td>
                    <td className="py-3 px-3">
                      <Badge variant={t.type === "INGRESO" ? "success" : "danger"}>{t.type}</Badge>
                    </td>
                    <td className="py-3 px-3 text-gray-300">{t.category}</td>
                    <td className="py-3 px-3 text-white">{t.description}</td>
                    <td className={`py-3 px-3 text-right font-medium ${t.type === "INGRESO" ? "text-green-400" : "text-red-400"}`}>
                      {t.type === "INGRESO" ? "+" : "-"}{formatCurrency(t.amount, t.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nuevo Movimiento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Tipo"
            options={[{ value: "INGRESO", label: "Ingreso" }, { value: "EGRESO", label: "Egreso" }]}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
          <Select label="Categoría" options={CATEGORIES} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <Input label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Monto" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <Input label="Fecha" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
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
