import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(null, { status: 401 });

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      owner: true,
      contracts: { include: { client: true }, orderBy: { createdAt: "desc" } },
      appointments: { include: { client: true }, orderBy: { date: "desc" }, take: 10 },
    },
  });
  return NextResponse.json(property);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(null, { status: 401 });

  const data = await req.json();
  const { id: _id, agencyId: _agencyId, createdAt: _c, updatedAt: _u, owner: _o, contracts: _co, appointments: _a, ...updateData } = data;
  const property = await prisma.property.update({
    where: { id: params.id },
    data: updateData,
  });
  return NextResponse.json(property);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(null, { status: 401 });

  await prisma.property.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
