import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(null, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { agency: true },
  });
  if (!user?.agency) return NextResponse.json(null);

  const agencyId = user.agency.id;
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [properties, clients, contracts, appointments, recentPayments, transactions, allProperties] = await Promise.all([
    prisma.property.count({ where: { agencyId } }),
    prisma.client.count({ where: { agencyId } }),
    prisma.contract.count({ where: { agencyId, status: "VIGENTE" } }),
    prisma.appointment.count({
      where: { agencyId, date: { gte: new Date() }, status: { in: ["PENDIENTE", "CONFIRMADA"] } },
    }),
    prisma.payment.findMany({
      where: { contract: { agencyId }, status: "PENDIENTE" },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { contract: { include: { property: true, client: true } } },
    }),
    prisma.transaction.findMany({
      where: { agencyId, date: { gte: sixMonthsAgo } },
      select: { type: true, amount: true, date: true },
      orderBy: { date: "asc" },
    }),
    prisma.property.findMany({
      where: { agencyId },
      select: { status: true, operationType: true },
    }),
  ]);

  const overduePayments = await prisma.payment.count({
    where: { contract: { agencyId }, status: "PENDIENTE", dueDate: { lt: new Date() } },
  });

  // Monthly revenue for chart
  const monthlyRevenue: { month: string; ingresos: number; egresos: number }[] = [];
  const monthMap = new Map<string, { ingresos: number; egresos: number }>();
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const existing = monthMap.get(key) || { ingresos: 0, egresos: 0 };
    if (t.type === "INGRESO") existing.ingresos += t.amount;
    else existing.egresos += t.amount;
    monthMap.set(key, existing);
  });
  Array.from(monthMap.keys()).sort().forEach((m) => {
    monthlyRevenue.push({ month: m, ...monthMap.get(m)! });
  });

  // Property status breakdown
  const propertyStatusBreakdown: Record<string, number> = {};
  allProperties.forEach((p) => {
    propertyStatusBreakdown[p.status] = (propertyStatusBreakdown[p.status] || 0) + 1;
  });

  // Occupancy
  const totalRentable = allProperties.filter((p) => p.operationType === "ALQUILER").length;
  const occupied = allProperties.filter((p) => p.status === "ALQUILADA").length;
  const occupancyRate = totalRentable > 0 ? Math.round((occupied / totalRentable) * 100) : 0;

  return NextResponse.json({
    properties,
    clients,
    activeContracts: contracts,
    upcomingAppointments: appointments,
    overduePayments,
    recentPayments,
    monthlyRevenue,
    propertyStatusBreakdown,
    occupancyRate,
  });
}
