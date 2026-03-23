import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(null, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { agencyId: true },
  });
  if (!user?.agencyId) return NextResponse.json(null);

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Contracts expiring in 30/60/90 days
  const expiringContracts = await prisma.contract.findMany({
    where: {
      agencyId: user.agencyId,
      status: "VIGENTE",
      endDate: { not: null, lte: in90 },
    },
    include: {
      property: { select: { id: true, title: true, street: true, streetNumber: true } },
      client: { select: { firstName: true, lastName: true, phone: true } },
      owner: { select: { firstName: true, lastName: true, phone: true } },
    },
    orderBy: { endDate: "asc" },
  });

  const contractAlerts = expiringContracts.map((c) => {
    const daysLeft = c.endDate ? Math.ceil((c.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) : 999;
    return {
      id: c.id,
      type: "contract_expiring" as const,
      severity: daysLeft <= 30 ? "critical" : daysLeft <= 60 ? "warning" : "info",
      title: `Contrato vence en ${daysLeft} días`,
      description: `${c.property.title} - ${c.client.firstName} ${c.client.lastName}`,
      date: c.endDate,
      daysLeft,
      meta: {
        propertyId: c.property.id,
        propertyTitle: c.property.title,
        clientName: `${c.client.firstName} ${c.client.lastName}`,
        clientPhone: c.client.phone,
        ownerName: c.owner ? `${c.owner.firstName} ${c.owner.lastName}` : null,
        ownerPhone: c.owner?.phone,
        amount: c.amount,
        currency: c.currency,
        contractType: c.contractType,
      },
    };
  });

  // Overdue payments
  const overduePayments = await prisma.payment.findMany({
    where: {
      contract: { agencyId: user.agencyId },
      status: { in: ["PENDIENTE", "VENCIDO"] },
      dueDate: { lt: now },
    },
    include: {
      contract: {
        include: {
          property: { select: { id: true, title: true } },
          client: { select: { firstName: true, lastName: true, phone: true, email: true } },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const paymentAlerts = overduePayments.map((p) => {
    const daysOverdue = Math.ceil((now.getTime() - p.dueDate.getTime()) / (24 * 60 * 60 * 1000));
    return {
      id: p.id,
      type: "payment_overdue" as const,
      severity: daysOverdue >= 30 ? "critical" : daysOverdue >= 15 ? "warning" : "info",
      title: `Pago vencido hace ${daysOverdue} días`,
      description: `${p.contract.property.title} - ${p.contract.client.firstName} ${p.contract.client.lastName} - ${p.period}`,
      date: p.dueDate,
      daysOverdue,
      meta: {
        propertyId: p.contract.property.id,
        propertyTitle: p.contract.property.title,
        clientName: `${p.contract.client.firstName} ${p.contract.client.lastName}`,
        clientPhone: p.contract.client.phone,
        clientEmail: p.contract.client.email,
        amount: p.amount,
        currency: p.currency,
        period: p.period,
      },
    };
  });

  // Upcoming payments due in next 7 days
  const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingPayments = await prisma.payment.findMany({
    where: {
      contract: { agencyId: user.agencyId },
      status: "PENDIENTE",
      dueDate: { gte: now, lte: in7 },
    },
    include: {
      contract: {
        include: {
          property: { select: { id: true, title: true } },
          client: { select: { firstName: true, lastName: true, phone: true } },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const upcomingPaymentAlerts = upcomingPayments.map((p) => {
    const daysUntil = Math.ceil((p.dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return {
      id: p.id,
      type: "payment_upcoming" as const,
      severity: daysUntil <= 2 ? "warning" : "info",
      title: `Cobro vence en ${daysUntil} días`,
      description: `${p.contract.property.title} - ${p.contract.client.firstName} ${p.contract.client.lastName}`,
      date: p.dueDate,
      meta: {
        propertyId: p.contract.property.id,
        clientName: `${p.contract.client.firstName} ${p.contract.client.lastName}`,
        clientPhone: p.contract.client.phone,
        amount: p.amount,
        currency: p.currency,
        period: p.period,
      },
    };
  });

  // Contracts needing rent adjustment (adjustment date coming up)
  const adjustableContracts = await prisma.contract.findMany({
    where: {
      agencyId: user.agencyId,
      status: "VIGENTE",
      adjustmentType: { not: null },
      adjustmentPeriod: { not: null },
    },
    include: {
      property: { select: { id: true, title: true } },
      client: { select: { firstName: true, lastName: true } },
    },
  });

  const adjustmentAlerts = adjustableContracts
    .map((c) => {
      if (!c.adjustmentPeriod || !c.startDate) return null;
      // Calculate next adjustment date
      const startDate = new Date(c.startDate);
      const monthsSinceStart = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
      const nextAdjustmentMonth = Math.ceil(monthsSinceStart / c.adjustmentPeriod) * c.adjustmentPeriod;
      const nextAdjustmentDate = new Date(startDate);
      nextAdjustmentDate.setMonth(startDate.getMonth() + nextAdjustmentMonth);
      
      const daysUntilAdj = Math.ceil((nextAdjustmentDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      if (daysUntilAdj > 30 || daysUntilAdj < 0) return null;

      return {
        id: `adj-${c.id}`,
        type: "adjustment_due" as const,
        severity: daysUntilAdj <= 7 ? "warning" : "info",
        title: `Ajuste de alquiler en ${daysUntilAdj} días`,
        description: `${c.property.title} - ${c.client.firstName} ${c.client.lastName} (${c.adjustmentType})`,
        date: nextAdjustmentDate,
        meta: {
          propertyId: c.property.id,
          contractId: c.id,
          adjustmentType: c.adjustmentType,
          currentAmount: c.amount,
          currency: c.currency,
        },
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  // Today's appointments
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowEnd = new Date(todayStart.getTime() + 48 * 60 * 60 * 1000);

  const todayAppointments = await prisma.appointment.findMany({
    where: {
      agencyId: user.agencyId,
      date: { gte: todayStart, lt: tomorrowEnd },
      status: { in: ["PENDIENTE", "CONFIRMADA"] },
    },
    include: {
      property: { select: { id: true, title: true } },
      client: { select: { firstName: true, lastName: true, phone: true } },
    },
    orderBy: { date: "asc" },
  });

  const appointmentAlerts = todayAppointments.map((a) => {
    const isToday = a.date < todayEnd;
    return {
      id: a.id,
      type: "appointment" as const,
      severity: isToday ? "warning" : "info",
      title: isToday ? `Visita hoy ${a.time || ""}` : `Visita mañana ${a.time || ""}`,
      description: `${a.property?.title || a.title} ${a.client ? `- ${a.client.firstName} ${a.client.lastName}` : ""}`,
      date: a.date,
      meta: {
        propertyId: a.property?.id,
        clientName: a.client ? `${a.client.firstName} ${a.client.lastName}` : null,
        clientPhone: a.client?.phone,
        type: a.type,
        time: a.time,
      },
    };
  });

  return NextResponse.json({
    contractAlerts,
    paymentAlerts,
    upcomingPaymentAlerts,
    adjustmentAlerts,
    appointmentAlerts,
    summary: {
      critical: [...contractAlerts, ...paymentAlerts].filter((a) => a.severity === "critical").length,
      warnings: [...contractAlerts, ...paymentAlerts, ...upcomingPaymentAlerts, ...adjustmentAlerts, ...appointmentAlerts].filter((a) => a.severity === "warning").length,
      total: contractAlerts.length + paymentAlerts.length + upcomingPaymentAlerts.length + adjustmentAlerts.length + appointmentAlerts.length,
    },
  });
}
