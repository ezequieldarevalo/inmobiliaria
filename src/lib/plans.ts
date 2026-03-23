export type PlanId = "STARTER" | "PROFESIONAL" | "PREMIUM" | "ENTERPRISE";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  price: number;
  features: string[];
  maxProperties: number;
  routes: string[];
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  STARTER: {
    id: "STARTER",
    name: "Starter",
    price: 50000,
    maxProperties: 20,
    features: [
      "Hasta 20 propiedades",
      "Gestión de propietarios",
      "Gestión de interesados",
      "Agenda de visitas",
      "Dashboard básico",
    ],
    routes: [
      "/dashboard",
      "/dashboard/properties",
      "/dashboard/owners",
      "/dashboard/clients",
      "/dashboard/appointments",
      "/dashboard/settings",
    ],
  },
  PROFESIONAL: {
    id: "PROFESIONAL",
    name: "Profesional",
    price: 90000,
    maxProperties: 100,
    features: [
      "Hasta 100 propiedades",
      "Todo lo de Starter",
      "Contratos y alquileres",
      "Cobro de alquileres",
      "Ajustes automáticos (ICL/IPC)",
      "Reportes",
    ],
    routes: [
      "/dashboard",
      "/dashboard/properties",
      "/dashboard/owners",
      "/dashboard/clients",
      "/dashboard/appointments",
      "/dashboard/contracts",
      "/dashboard/payments",
      "/dashboard/reports",
      "/dashboard/settings",
    ],
  },
  PREMIUM: {
    id: "PREMIUM",
    name: "Premium",
    price: 140000,
    maxProperties: 500,
    features: [
      "Hasta 500 propiedades",
      "Todo lo de Profesional",
      "Caja y movimientos",
      "Liquidaciones a propietarios",
      "Calendario completo",
    ],
    routes: [
      "/dashboard",
      "/dashboard/properties",
      "/dashboard/owners",
      "/dashboard/clients",
      "/dashboard/appointments",
      "/dashboard/contracts",
      "/dashboard/payments",
      "/dashboard/cash",
      "/dashboard/reports",
      "/dashboard/calendar",
      "/dashboard/settings",
    ],
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 200000,
    maxProperties: -1, // unlimited
    features: [
      "Propiedades ilimitadas",
      "Todo lo de Premium",
      "Multi-sucursal",
      "Publicación en portales",
      "API de integración",
      "Soporte prioritario",
    ],
    routes: [
      "/dashboard",
      "/dashboard/properties",
      "/dashboard/owners",
      "/dashboard/clients",
      "/dashboard/appointments",
      "/dashboard/contracts",
      "/dashboard/payments",
      "/dashboard/cash",
      "/dashboard/reports",
      "/dashboard/calendar",
      "/dashboard/integrations",
      "/dashboard/settings",
    ],
  },
};

export function getPlan(planId: string): PlanDefinition {
  return PLANS[planId as PlanId] || PLANS.STARTER;
}

export function isRouteAllowed(planId: string, route: string): boolean {
  const plan = getPlan(planId);
  return plan.routes.some((r) => route === r || route.startsWith(r + "/"));
}

export function isPlanAtLeast(current: string, minimum: PlanId): boolean {
  const order: PlanId[] = ["STARTER", "PROFESIONAL", "PREMIUM", "ENTERPRISE"];
  return order.indexOf(current as PlanId) >= order.indexOf(minimum);
}

export function formatPlanPrice(price: number): string {
  return `$${price.toLocaleString("es-AR")}`;
}
