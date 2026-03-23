"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Building2,
  Home,
  Users,
  UserCheck,
  FileText,
  CreditCard,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
  Shield,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/alerts", icon: Bell, label: "Alertas" },
  { href: "/dashboard/properties", icon: Building2, label: "Propiedades" },
  { href: "/dashboard/owners", icon: UserCheck, label: "Propietarios" },
  { href: "/dashboard/clients", icon: Users, label: "Interesados" },
  { href: "/dashboard/appointments", icon: Calendar, label: "Agenda" },
  { href: "/dashboard/contracts", icon: FileText, label: "Contratos" },
  { href: "/dashboard/payments", icon: CreditCard, label: "Cobros" },
  { href: "/dashboard/cash", icon: Wallet, label: "Caja" },
  { href: "/dashboard/reports", icon: BarChart3, label: "Reportes" },
  { href: "/dashboard/settings", icon: Settings, label: "Configuración" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const isSuperAdmin = (session?.user as { role?: string })?.role === "SUPERADMIN";

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden bg-gray-800 p-2 rounded-lg text-gray-400"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col py-4 transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">InmoGestor</p>
              <p className="text-xs text-gray-500">Gestión Inmobiliaria</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2 px-3 mb-2">
          {isSuperAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors text-sm"
            >
              <Shield size={18} />
              Admin Console
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm w-full"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
