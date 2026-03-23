"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Trash2 } from "lucide-react";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  agency?: { name: string } | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then((d) => Array.isArray(d) && setUsers(d)).catch(() => {});
  }, []);

  const handleChangeRole = async (userId: string, role: string) => {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const roleColors: Record<string, "info" | "success" | "danger"> = {
    USER: "info", ADMIN: "success", SUPERADMIN: "danger",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Usuarios ({users.length})</h1>
      <div className="grid gap-3">
        {users.map((u) => (
          <Card key={u.id}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center">
                  <User size={16} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{u.name || "Sin nombre"}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                  {u.agency && <p className="text-xs text-gray-600">{u.agency.name}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select value={u.role} onChange={(e) => handleChangeRole(u.id, e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 outline-none">
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERADMIN">SuperAdmin</option>
                </select>
                {u.role !== "SUPERADMIN" && (
                  <button onClick={() => handleDelete(u.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {users.length === 0 && <p className="text-gray-600 text-sm text-center py-8">No hay usuarios</p>}
      </div>
    </div>
  );
}
