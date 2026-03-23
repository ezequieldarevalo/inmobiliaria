import Link from "next/link";
import { Building2, BarChart3, FileText, Users, Calendar, Shield, ArrowRight, Check } from "lucide-react";
import { PLANS, formatPlanPrice, type PlanId } from "@/lib/plans";

const FEATURES = [
  { icon: Building2, title: "Gestión de Propiedades", desc: "Cargá y administrá todas tus propiedades con fotos, datos completos y publicación en portales." },
  { icon: Users, title: "Propietarios y Clientes", desc: "Base de datos organizada de propietarios, inquilinos y compradores con sus preferencias." },
  { icon: FileText, title: "Contratos y Cobros", desc: "Contratos de alquiler con generación automática de cuotas, ajustes ICL/IPC y seguimiento de pagos." },
  { icon: Calendar, title: "Agenda de Visitas", desc: "Organizá tasaciones, visitas, firmas y entregas de llaves en un solo lugar." },
  { icon: BarChart3, title: "Reportes y Caja", desc: "Control de ingresos, egresos, comisiones y reportes para tomar mejores decisiones." },
  { icon: Shield, title: "Seguro y Multi-usuario", desc: "Acceso por roles, datos encriptados y respaldos automáticos en la nube." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center">
              <Building2 size={20} className="text-emerald-400" />
            </div>
            <span className="text-lg font-bold">InmoGestor</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2">
              Iniciar sesión
            </Link>
            <Link href="/register" className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-600/10 border border-emerald-600/30 rounded-full px-4 py-1.5 text-sm text-emerald-400 mb-6">
          <Building2 size={14} /> Software para inmobiliarias
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          Gestioná tu inmobiliaria<br />
          <span className="text-emerald-400">de forma inteligente</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
          Propiedades, contratos, cobros, visitas y reportes. Todo en un solo lugar, desde cualquier dispositivo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-base font-medium transition-colors">
            Empezar ahora <ArrowRight size={18} />
          </Link>
          <Link href="#planes" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-xl text-base font-medium border border-gray-700 transition-colors">
            Ver planes
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Todo lo que necesitás</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/15 flex items-center justify-center mb-4">
                <f.icon size={20} className="text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="planes" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Planes</h2>
        <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto">Elegí el plan que mejor se adapte a tu inmobiliaria. Podés cambiar en cualquier momento.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.values(PLANS) as typeof PLANS[PlanId][]).map((p, i) => (
            <div key={p.id} className={`rounded-2xl p-6 border ${i === 1 ? "border-emerald-500 bg-emerald-600/5 ring-1 ring-emerald-500/20" : "border-gray-800 bg-gray-900"}`}>
              {i === 1 && <div className="text-xs font-medium text-emerald-400 mb-2">Más popular</div>}
              <h3 className="text-lg font-bold text-white">{p.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-white">{formatPlanPrice(p.price)}</span>
                <span className="text-sm text-gray-500">/mes</span>
              </div>
              <ul className="space-y-2 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                    <Check size={14} className="mt-0.5 shrink-0 text-emerald-400" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`block text-center py-2.5 rounded-xl text-sm font-medium transition-colors ${i === 1 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"}`}>
                Elegir {p.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-600/5 border border-emerald-600/30 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">¿Listo para digitalizar tu inmobiliaria?</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto">Empezá gratis con el plan Starter y escalá cuando lo necesites.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-base font-medium transition-colors">
            Crear mi cuenta <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-emerald-400" />
            <span className="text-sm font-semibold">InmoGestor</span>
          </div>
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} InmoGestor. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
