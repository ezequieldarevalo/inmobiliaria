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

  const payments = await prisma.payment.findMany({
    where: { contract: { agencyId } },
    include: {
      contract: {
        include: {
          property: { select: { title: true } },
          client: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });
  return NextResponse.json(payments);
}

export async function PUT(req: Request) {
  const data = await req.json();
  const { id, ...updateData } = data;
  const payment = await prisma.payment.update({ where: { id }, data: updateData });
  return NextResponse.json(payment);
}
