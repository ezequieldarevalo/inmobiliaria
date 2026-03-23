import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;
  return (session.user as { role: string }).role === "SUPERADMIN";
}

export async function GET() {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const agencies = await prisma.agency.findMany({
    include: {
      users: { select: { id: true, email: true, name: true, role: true } },
      _count: { select: { properties: true, contracts: true, planRequests: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(agencies);
}

export async function PUT(req: Request) {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { agencyId, plan } = await req.json();
  const agency = await prisma.agency.update({ where: { id: agencyId }, data: { plan } });
  return NextResponse.json(agency);
}
