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

  const appointments = await prisma.appointment.findMany({
    where: { agencyId },
    include: {
      property: { select: { title: true, street: true, streetNumber: true } },
      client: { select: { firstName: true, lastName: true, phone: true } },
    },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const appointment = await prisma.appointment.create({ data: { ...data, agencyId } });
  return NextResponse.json(appointment);
}

export async function PUT(req: Request) {
  const data = await req.json();
  const { id, agencyId: _a, createdAt: _c, updatedAt: _u, property: _p, client: _cl, ...updateData } = data;
  const appointment = await prisma.appointment.update({ where: { id }, data: updateData });
  return NextResponse.json(appointment);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
