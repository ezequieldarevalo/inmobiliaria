"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, MapPin } from "lucide-react";

interface Agency {
  id: string;
  name: string;
  email: string | null;
  plan: string;
  province: string | null;
  city: string | null;
  createdAt: string;
  _count?: { users: number; properties: number; contracts: number };
}

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);

  useEffect(() => {
    fetch("/api/admin/agencies").then((r) => r.json()).then((d) => Array.isArray(d) && setAgencies(d)).catch(() => {});
  }, []);

  const handleChangePlan = async (agencyId: string, plan: string) => {
    await fetch("/api/admin/agencies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agencyId, plan }),
    });
    setAgencies((prev) => prev.map((a) => (a.id === agencyId ? { ...a, plan } : a)));
  };

  const planColors: Record<string, "success" | "info" | "warning" | "danger"> = {
    STARTER: "info", PROFESIONAL: "success", PREMIUM: "warning", ENTERPRISE: "danger",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Inmobiliarias ({agencies.length})</h1>
      <div className="grid gap-4">
        {agencies.map((a) => (
          <Card key={a.id}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/15 flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{a.name}</h3>
                  <p className="text-xs text-gray-500">{a.email}</p>
                  {(a.province || a.city) && (
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin size={10} /> {[a.city, a.province].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-xs text-gray-500">
                  <p>{a._count?.properties || 0} props</p>
                  <p>{a._count?.users || 0} usuarios</p>
                </div>
                <select value={a.plan} onChange={(e) => handleChangePlan(a.id, e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 outline-none">
                  <option value="STARTER">Starter</option>
                  <option value="PROFESIONAL">Profesional</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>
            </div>
          </Card>
        ))}
        {agencies.length === 0 && <p className="text-gray-600 text-sm text-center py-8">No hay inmobiliarias registradas</p>}
      </div>
    </div>
  );
}
