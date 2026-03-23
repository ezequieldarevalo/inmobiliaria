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

  const [properties, clients, contracts, appointments, recentPayments] = await Promise.all([
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
  ]);

  const overduePayments = await prisma.payment.count({
    where: { contract: { agencyId }, status: "PENDIENTE", dueDate: { lt: new Date() } },
  });

  return NextResponse.json({
    properties,
    clients,
    activeContracts: contracts,
    upcomingAppointments: appointments,
    overduePayments,
    recentPayments,
  });
}
