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

  const [
    properties,
    contracts,
    payments,
    transactions,
    appointments,
    clients,
  ] = await Promise.all([
    prisma.property.findMany({
      where: { agencyId },
      select: { propertyType: true, operationType: true, status: true, price: true, currency: true, neighborhood: true },
    }),
    prisma.contract.findMany({
      where: { agencyId },
      select: { contractType: true, status: true, amount: true, currency: true, startDate: true, endDate: true },
    }),
    prisma.payment.findMany({
      where: { contract: { agencyId } },
      select: { period: true, amount: true, status: true, dueDate: true, paidDate: true, currency: true },
    }),
    prisma.transaction.findMany({
      where: { agencyId, date: { gte: sixMonthsAgo } },
      select: { type: true, category: true, amount: true, date: true },
      orderBy: { date: "asc" },
    }),
    prisma.appointment.findMany({
      where: { agencyId },
      select: { type: true, status: true, date: true },
    }),
    prisma.client.findMany({
      where: { agencyId },
      select: { clientType: true, source: true, createdAt: true },
    }),
  ]);

  // Properties by type
  const propertiesByType: Record<string, number> = {};
  const propertiesByOperation: Record<string, number> = {};
  const propertiesByStatus: Record<string, number> = {};
  const propertiesByNeighborhood: Record<string, number> = {};
  properties.forEach((p) => {
    propertiesByType[p.propertyType] = (propertiesByType[p.propertyType] || 0) + 1;
    propertiesByOperation[p.operationType] = (propertiesByOperation[p.operationType] || 0) + 1;
    propertiesByStatus[p.status] = (propertiesByStatus[p.status] || 0) + 1;
    if (p.neighborhood) {
      propertiesByNeighborhood[p.neighborhood] = (propertiesByNeighborhood[p.neighborhood] || 0) + 1;
    }
  });

  // Occupancy rate
  const totalRentable = properties.filter((p) => p.operationType === "ALQUILER").length;
  const occupied = properties.filter((p) => p.status === "ALQUILADA").length;
  const occupancyRate = totalRentable > 0 ? Math.round((occupied / totalRentable) * 100) : 0;

  // Monthly revenue (transactions grouped by month)
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
  const sortedMonths = Array.from(monthMap.keys()).sort();
  sortedMonths.forEach((m) => {
    monthlyRevenue.push({ month: m, ...monthMap.get(m)! });
  });

  // Payment stats
  const totalPayments = payments.length;
  const paidPayments = payments.filter((p) => p.status === "PAGADO").length;
  const pendingPayments = payments.filter((p) => p.status === "PENDIENTE").length;
  const overduePayments = payments.filter((p) => p.status === "PENDIENTE" && new Date(p.dueDate) < now).length;
  const paymentCollectionRate = totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0;

  // Total income/expense
  const totalIncome = transactions.filter((t) => t.type === "INGRESO").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "EGRESO").reduce((s, t) => s + t.amount, 0);

  // By category
  const byCategory: Record<string, number> = {};
  transactions.forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  // Clients by source
  const clientsBySource: Record<string, number> = {};
  clients.forEach((c) => {
    const src = c.source || "SIN_FUENTE";
    clientsBySource[src] = (clientsBySource[src] || 0) + 1;
  });

  // Appointments by type
  const appointmentsByType: Record<string, number> = {};
  appointments.forEach((a) => {
    appointmentsByType[a.type] = (appointmentsByType[a.type] || 0) + 1;
  });

  // Contracts
  const activeContracts = contracts.filter((c) => c.status === "VIGENTE").length;
  const expiringContracts = contracts.filter((c) => {
    if (c.status !== "VIGENTE" || !c.endDate) return false;
    const daysLeft = (new Date(c.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysLeft >= 0 && daysLeft <= 90;
  }).length;

  return NextResponse.json({
    summary: {
      totalProperties: properties.length,
      totalContracts: contracts.length,
      activeContracts,
      expiringContracts,
      occupancyRate,
      paymentCollectionRate,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      totalClients: clients.length,
      pendingPayments,
      overduePayments,
    },
    propertiesByType,
    propertiesByOperation,
    propertiesByStatus,
    propertiesByNeighborhood,
    monthlyRevenue,
    byCategory,
    clientsBySource,
    appointmentsByType,
  });
}
