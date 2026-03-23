import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ICL historical data (approximate recent values - percentage increases per period)
// In production this would fetch from BCRA API
const ICL_MONTHLY: Record<string, number> = {
  "2024-01": 20.5, "2024-02": 18.2, "2024-03": 15.8, "2024-04": 11.2, "2024-05": 8.5,
  "2024-06": 7.2, "2024-07": 5.8, "2024-08": 4.5, "2024-09": 3.8, "2024-10": 3.2,
  "2024-11": 2.9, "2024-12": 2.5, "2025-01": 2.2, "2025-02": 2.0, "2025-03": 1.8,
  "2025-04": 1.5, "2025-05": 1.3, "2025-06": 1.2,
};

// Casa Propia uses a similar index
const CASA_PROPIA_MONTHLY: Record<string, number> = {
  "2024-01": 18.0, "2024-02": 16.5, "2024-03": 14.2, "2024-04": 10.5, "2024-05": 8.0,
  "2024-06": 6.8, "2024-07": 5.5, "2024-08": 4.2, "2024-09": 3.5, "2024-10": 3.0,
  "2024-11": 2.7, "2024-12": 2.3, "2025-01": 2.0, "2025-02": 1.8, "2025-03": 1.6,
  "2025-04": 1.4, "2025-05": 1.2, "2025-06": 1.1,
};

function getAdjustmentIndex(type: string): Record<string, number> {
  switch (type) {
    case "ICL": return ICL_MONTHLY;
    case "CASA_PROPIA": return CASA_PROPIA_MONTHLY;
    case "IPC": return ICL_MONTHLY; // IPC follows similar pattern
    default: return {};
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(null, { status: 401 });

  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    include: {
      property: { select: { id: true, title: true } },
      client: { select: { firstName: true, lastName: true } },
      payments: { orderBy: { dueDate: "desc" }, take: 12 },
    },
  });

  if (!contract) return NextResponse.json(null, { status: 404 });

  // Calculate adjustment history and next adjustment
  const startDate = new Date(contract.startDate);
  const period = contract.adjustmentPeriod || 12;
  const now = new Date();
  const index = getAdjustmentIndex(contract.adjustmentType || "");

  const adjustments: {
    periodNumber: number;
    date: string;
    baseAmount: number;
    adjustedAmount: number;
    percentChange: number;
    cumPercent: number;
  }[] = [];

  let currentAmount = contract.amount;
  let cumPercent = 0;
  const monthsSinceStart = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
  const totalPeriods = Math.ceil(monthsSinceStart / period) + 1;

  for (let i = 0; i <= totalPeriods && i < 20; i++) {
    const adjDate = new Date(startDate);
    adjDate.setMonth(startDate.getMonth() + i * period);

    if (i === 0) {
      adjustments.push({
        periodNumber: 1,
        date: adjDate.toISOString(),
        baseAmount: contract.amount,
        adjustedAmount: contract.amount,
        percentChange: 0,
        cumPercent: 0,
      });
      continue;
    }

    // Calculate accumulated index change for this period
    let periodChange = 0;
    for (let m = 0; m < period; m++) {
      const monthDate = new Date(startDate);
      monthDate.setMonth(startDate.getMonth() + (i - 1) * period + m);
      const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
      const monthlyRate = index[key] || 2.0; // default 2% if no data
      periodChange += monthlyRate;
    }

    if (contract.adjustmentType === "LIBRE") {
      periodChange = (period === 6 ? 30 : period === 12 ? 60 : 15); // estimate for LIBRE
    }

    const adjustedAmount = Math.round(currentAmount * (1 + periodChange / 100));
    cumPercent += periodChange;

    adjustments.push({
      periodNumber: i + 1,
      date: adjDate.toISOString(),
      baseAmount: currentAmount,
      adjustedAmount,
      percentChange: Math.round(periodChange * 10) / 10,
      cumPercent: Math.round(cumPercent * 10) / 10,
    });

    currentAmount = adjustedAmount;
  }

  // Determine which period we're in
  const currentPeriodIndex = Math.floor(monthsSinceStart / period);
  const nextAdjustmentDate = new Date(startDate);
  nextAdjustmentDate.setMonth(startDate.getMonth() + (currentPeriodIndex + 1) * period);

  return NextResponse.json({
    contract: {
      id: contract.id,
      amount: contract.amount,
      currency: contract.currency,
      adjustmentType: contract.adjustmentType,
      adjustmentPeriod: contract.adjustmentPeriod,
      startDate: contract.startDate,
      endDate: contract.endDate,
      property: contract.property,
      client: contract.client,
    },
    adjustments,
    currentPeriod: currentPeriodIndex + 1,
    currentAmount: adjustments[currentPeriodIndex]?.adjustedAmount || contract.amount,
    nextAdjustmentDate: nextAdjustmentDate.toISOString(),
    nextEstimatedAmount: adjustments[currentPeriodIndex + 1]?.adjustedAmount || null,
  });
}
