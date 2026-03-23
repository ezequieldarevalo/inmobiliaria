"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Check, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string | null;
  duration: number | null;
  status: string;
  type: string;
  notes: string | null;
  property: { title: string; street: string | null; streetNumber: string | null } | null;
  client: { firstName: string; lastName: string; phone: string | null } | null;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = () => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setAppointments(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAppointments(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/appointments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadAppointments();
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "CONFIRMADA": return "success";
      case "PENDIENTE": return "warning";
      case "REALIZADA": return "info";
      case "CANCELADA": return "danger";
      default: return "default";
    }
  };

  const upcoming = appointments.filter((a) => new Date(a.date) >= new Date() && a.status !== "CANCELADA");
  const past = appointments.filter((a) => new Date(a.date) < new Date() || a.status === "CANCELADA");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Calendar size={24} /> Agenda
        </h1>
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando...</p>
      ) : upcoming.length === 0 && past.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Calendar size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">No hay citas programadas</p>
          </div>
        </Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-emerald-400">Próximas ({upcoming.length})</h2>
              {upcoming.map((a) => (
                <Card key={a.id}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{a.title}</h3>
                        <Badge variant={statusBadge(a.status) as "success" | "warning" | "info" | "danger" | "default"}>{a.status}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(a.date)} {a.time || ""}</span>
                        {a.property && <span className="flex items-center gap-1"><MapPin size={12} /> {a.property.title}</span>}
                        {a.client && <span className="flex items-center gap-1"><User size={12} /> {a.client.firstName} {a.client.lastName}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {a.status === "PENDIENTE" && (
                        <Button size="sm" onClick={() => updateStatus(a.id, "CONFIRMADA")} className="bg-green-600 hover:bg-green-700">
                          <Check size={14} className="mr-1" /> Confirmar
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(a.id, "CANCELADA")} className="text-red-400">
                        <X size={14} className="mr-1" /> Cancelar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-400">Pasadas ({past.length})</h2>
              {past.map((a) => (
                <Card key={a.id} className="opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white text-sm">{a.title}</h3>
                      <p className="text-xs text-gray-500">{formatDate(a.date)} — {a.property?.title}</p>
                    </div>
                    <Badge variant={statusBadge(a.status) as "success" | "warning" | "info" | "danger" | "default"}>{a.status}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
