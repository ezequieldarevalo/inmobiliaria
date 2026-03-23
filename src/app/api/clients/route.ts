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

  const clients = await prisma.client.findMany({
    where: { agencyId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const client = await prisma.client.create({ data: { ...data, agencyId } });
  return NextResponse.json(client);
}

export async function PUT(req: Request) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const { id, agencyId: _a, createdAt: _c, updatedAt: _u, ...updateData } = data;
  const client = await prisma.client.update({ where: { id }, data: updateData });
  return NextResponse.json(client);
}

export async function DELETE(req: Request) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
