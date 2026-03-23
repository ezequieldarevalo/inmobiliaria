import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(null, { status: 401 });

  const owner = await prisma.owner.findUnique({
    where: { id: params.id },
    include: {
      properties: {
        select: {
          id: true, title: true, status: true, operationType: true,
          street: true, streetNumber: true, neighborhood: true, city: true,
          price: true, currency: true,
        },
      },
      contracts: {
        include: {
          property: { select: { id: true, title: true } },
          client: { select: { firstName: true, lastName: true } },
          payments: {
            orderBy: { dueDate: "desc" },
          },
        },
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!owner) return NextResponse.json(null, { status: 404 });

  // Calculate liquidation summary
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const activeContracts = owner.contracts.filter((c) => c.status === "VIGENTE");
  
  // Monthly liquidation breakdown
  const monthlyData: Record<string, { income: number; commission: number; net: number; details: any[] }> = {};
  
  for (const contract of activeContracts) {
    const commissionRate = (contract.commissionPercent || 0) / 100;
    
    for (const payment of contract.payments) {
      if (payment.status !== "PAGADO") continue;
      const month = payment.period;
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, commission: 0, net: 0, details: [] };
      }
      const income = payment.paidAmount || payment.amount;
      const commission = Math.round(income * commissionRate);
      monthlyData[month].income += income;
      monthlyData[month].commission += commission;
      monthlyData[month].net += income - commission;
      monthlyData[month].details.push({
        property: contract.property.title,
        client: `${contract.client.firstName} ${contract.client.lastName}`,
        amount: income,
        commission,
        net: income - commission,
      });
    }
  }

  // Sort months descending
  const liquidation = Object.entries(monthlyData)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, data]) => ({ month, ...data }));

  // Totals
  const totalIncome = liquidation.reduce((sum, m) => sum + m.income, 0);
  const totalCommission = liquidation.reduce((sum, m) => sum + m.commission, 0);
  const totalNet = liquidation.reduce((sum, m) => sum + m.net, 0);

  // Pending payments (money owed to owner)
  const pendingPayments = activeContracts.flatMap((c) =>
    c.payments
      .filter((p) => p.status === "PENDIENTE" || p.status === "VENCIDO")
      .map((p) => ({
        ...p,
        propertyTitle: c.property.title,
        clientName: `${c.client.firstName} ${c.client.lastName}`,
      }))
  );

  return NextResponse.json({
    ...owner,
    summary: {
      totalProperties: owner.properties.length,
      activeContracts: activeContracts.length,
      totalIncome,
      totalCommission,
      totalNet,
      pendingPayments: pendingPayments.length,
      pendingAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
    },
    liquidation,
    pendingPayments,
  });
}
