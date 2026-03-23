"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Building2, Users, FileCheck, TrendingUp } from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState({ agencies: 0, users: 0, pendingRequests: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/agencies").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/plan-requests").then((r) => r.json()),
    ]).then(([agencies, users, requests]) => {
      setStats({
        agencies: Array.isArray(agencies) ? agencies.length : 0,
        users: Array.isArray(users) ? users.length : 0,
        pendingRequests: Array.isArray(requests) ? requests.filter((r: { status: string }) => r.status === "PENDING").length : 0,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: "Inmobiliarias", value: stats.agencies, icon: Building2, color: "text-emerald-400" },
    { label: "Usuarios", value: stats.users, icon: Users, color: "text-blue-400" },
    { label: "Solicitudes Pendientes", value: stats.pendingRequests, icon: FileCheck, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Panel de Administración</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold mt-1">{c.value}</p>
              </div>
              <c.icon size={24} className={c.color} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
