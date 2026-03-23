"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";

interface PlanRequest {
  id: string;
  currentPlan: string;
  requestedPlan: string;
  status: string;
  createdAt: string;
  agency: { name: string };
  user: { name: string | null; email: string };
}

export default function AdminPlanRequestsPage() {
  const [requests, setRequests] = useState<PlanRequest[]>([]);

  useEffect(() => {
    fetch("/api/admin/plan-requests").then((r) => r.json()).then((d) => Array.isArray(d) && setRequests(d)).catch(() => {});
  }, []);

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    const res = await fetch("/api/admin/plan-requests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id, status: action }),
    });
    if (res.ok) {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: action } : r)));
    }
  };

  const statusBadge: Record<string, { variant: "warning" | "success" | "danger"; label: string }> = {
    PENDING: { variant: "warning", label: "Pendiente" },
    APPROVED: { variant: "success", label: "Aprobada" },
    REJECTED: { variant: "danger", label: "Rechazada" },
  };

  const pending = requests.filter((r) => r.status === "PENDING");
  const resolved = requests.filter((r) => r.status !== "PENDING");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Solicitudes de Cambio de Plan</h1>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-yellow-400 flex items-center gap-1"><Clock size={14} /> Pendientes ({pending.length})</h2>
          {pending.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{r.agency.name}</p>
                  <p className="text-xs text-gray-500">{r.user.name || r.user.email} — {new Date(r.createdAt).toLocaleDateString("es-AR")}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="info" className="text-xs">{r.currentPlan}</Badge>
                    <ArrowRight size={12} className="text-gray-600" />
                    <Badge variant="success" className="text-xs">{r.requestedPlan}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(r.id, "APPROVED")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-colors">
                    <CheckCircle size={14} /> Aprobar
                  </button>
                  <button onClick={() => handleAction(r.id, "REJECTED")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors">
                    <XCircle size={14} /> Rechazar
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500">Resueltas ({resolved.length})</h2>
          {resolved.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{r.agency.name}</p>
                  <p className="text-xs text-gray-600">{r.currentPlan} → {r.requestedPlan}</p>
                </div>
                <Badge variant={statusBadge[r.status]?.variant || "info"} className="text-xs">
                  {statusBadge[r.status]?.label || r.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {requests.length === 0 && <p className="text-gray-600 text-sm text-center py-8">No hay solicitudes</p>}
    </div>
  );
}
