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
  return NextResponse.json(user?.agency || null);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(null, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { agencyId: true },
  });
  if (!user?.agencyId) return NextResponse.json({ error: "Sin agencia" }, { status: 400 });

  const data = await req.json();
  const agency = await prisma.agency.update({
    where: { id: user.agencyId },
    data,
  });
  return NextResponse.json(agency);
}
