import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAgencyId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { agencyId: true },
  });
  return user?.agencyId || null;
}

export async function GET() {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json(null, { status: 401 });

  // Get all clients as leads with metrics
  const clients = await prisma.client.findMany({
    where: { agencyId },
    include: {
      appointments: { select: { id: true, type: true, status: true } },
      contracts: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Lead source distribution
  const sourceDistribution = clients.reduce((acc, c) => {
    const source = c.source || "SIN_FUENTE";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Conversion funnel
  const totalLeads = clients.length;
  const withAppointments = clients.filter((c) => c.appointments.length > 0).length;
  const withContracts = clients.filter((c) => c.contracts.length > 0).length;
  const activeContracts = clients.filter((c) =>
    c.contracts.some((ct) => ct.status === "VIGENTE")
  ).length;

  // Monthly leads (last 6 months)
  const now = new Date();
  const monthlyLeads: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const count = clients.filter(
      (c) => new Date(c.createdAt) >= d && new Date(c.createdAt) < nextMonth
    ).length;
    monthlyLeads.push({
      month: d.toLocaleDateString("es-AR", { month: "short", year: "2-digit" }),
      count,
    });
  }

  // Source conversion rates
  const sourceConversion = Object.entries(sourceDistribution).map(([source, total]) => {
    const converted = clients
      .filter((c) => (c.source || "SIN_FUENTE") === source && c.contracts.length > 0)
      .length;
    return {
      source,
      total,
      converted,
      rate: total > 0 ? Math.round((converted / total) * 100) : 0,
    };
  });

  return NextResponse.json({
    totalLeads,
    withAppointments,
    withContracts,
    activeContracts,
    conversionRate: totalLeads > 0 ? Math.round((withContracts / totalLeads) * 100) : 0,
    sourceDistribution,
    monthlyLeads,
    sourceConversion,
  });
}
