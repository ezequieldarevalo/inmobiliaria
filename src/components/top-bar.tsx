"use client";

import { useSession } from "next-auth/react";

export function TopBar() {
  const { data: session } = useSession();
  return (
    <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
      <div className="ml-12 md:ml-0" />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-white">{session?.user?.name || "Usuario"}</p>
          <p className="text-xs text-gray-500">{session?.user?.email}</p>
        </div>
        <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {(session?.user?.name || "U")[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}
