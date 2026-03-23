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
  if (!agencyId) return NextResponse.json([], { status: 401 });

  const contracts = await prisma.contract.findMany({
    where: { agencyId },
    include: {
      property: { select: { title: true, street: true, streetNumber: true } },
      client: { select: { firstName: true, lastName: true } },
      owner: { select: { firstName: true, lastName: true } },
      _count: { select: { payments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contracts);
}

export async function POST(req: Request) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const contract = await prisma.contract.create({
    data: { ...data, agencyId },
  });

  // If rent, generate payment schedule
  if (data.contractType === "ALQUILER" && data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const payments = [];
    const current = new Date(start);

    while (current < end) {
      payments.push({
        contractId: contract.id,
        period: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`,
        dueDate: new Date(current),
        amount: data.amount,
        currency: data.currency || "ARS",
      });
      current.setMonth(current.getMonth() + 1);
    }

    if (payments.length > 0) {
      await prisma.payment.createMany({ data: payments });
    }
  }

  return NextResponse.json(contract);
}

export async function PUT(req: Request) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const { id, agencyId: _a, createdAt: _c, updatedAt: _u, property: _p, client: _cl, owner: _o, _count: _co, payments: _pa, ...updateData } = data;
  const contract = await prisma.contract.update({ where: { id }, data: updateData });
  return NextResponse.json(contract);
}
