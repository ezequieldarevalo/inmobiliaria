"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Megaphone, ShoppingBag, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function IntegrationsPage() {
  const portals = [
    { name: "ZonaProp", icon: Globe, desc: "Principal portal inmobiliario de Argentina", color: "text-blue-400", bgColor: "bg-blue-400/10" },
    { name: "MercadoLibre", icon: ShoppingBag, desc: "Marketplace con sección de inmuebles", color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
    { name: "Argenprop", icon: Globe, desc: "Portal inmobiliario argentino", color: "text-orange-400", bgColor: "bg-orange-400/10" },
    { name: "WhatsApp", icon: MessageCircle, desc: "Publicá y compartí por WhatsApp", color: "text-green-400", bgColor: "bg-green-400/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Globe size={24} /> Integraciones
        </h1>
        <Link href="/dashboard/publications">
          <Button>
            <Megaphone size={16} className="mr-1" /> Ver publicaciones
          </Button>
        </Link>
      </div>

      <Card>
        <div className="text-center py-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Publicá en portales desde cada propiedad</h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Desde el detalle de cada propiedad, usá el botón &quot;Publicar propiedad&quot; para generar títulos, descripciones y copiar contenido listo para publicar en los portales.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {portals.map((portal) => (
          <Card key={portal.name} className="hover:border-gray-600 transition-colors">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${portal.bgColor}`}>
                <portal.icon size={24} className={portal.color} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">{portal.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{portal.desc}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                    Publicación manual optimizada
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="!bg-emerald-600/5 !border-emerald-600/20">
        <div className="flex items-center gap-3">
          <ArrowRight size={16} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm text-emerald-400 font-medium">Workflow optimizado</p>
            <p className="text-xs text-gray-500">
              Cargás una propiedad una vez → generás título y descripción → copiás y publicás en cada portal → trackeás desde &quot;Publicaciones&quot;.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
