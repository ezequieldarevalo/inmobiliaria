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

  const transactions = await prisma.transaction.findMany({
    where: { agencyId },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const transaction = await prisma.transaction.create({ data: { ...data, agencyId } });
  return NextResponse.json(transaction);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
