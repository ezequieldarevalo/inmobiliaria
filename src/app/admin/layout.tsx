"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Users, LayoutDashboard, FileCheck, ArrowLeft } from "lucide-react";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Panel" },
  { href: "/admin/agencies", icon: Building2, label: "Inmobiliarias" },
  { href: "/admin/users", icon: Users, label: "Usuarios" },
  { href: "/admin/plan-requests", icon: FileCheck, label: "Solicitudes" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as { role?: string })?.role !== "SUPERADMIN") router.push("/dashboard");
  }, [status, session, router]);

  if (status === "loading") return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>;
  if ((session?.user as { role?: string })?.role !== "SUPERADMIN") return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-sm font-bold text-emerald-400">SUPERADMIN</h1>
          </div>
          <nav className="flex items-center gap-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${pathname === n.href ? "bg-emerald-600/20 text-emerald-400" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
                <n.icon size={14} /> <span className="hidden sm:inline">{n.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
