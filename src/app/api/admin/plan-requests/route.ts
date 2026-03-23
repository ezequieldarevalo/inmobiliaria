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

  const requests = await prisma.planChangeRequest.findMany({
    include: { agency: { select: { id: true, name: true, plan: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

export async function PUT(req: Request) {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { requestId, action } = await req.json();
  const request = await prisma.planChangeRequest.update({
    where: { id: requestId },
    data: { status: action, reviewedAt: new Date() },
  });

  if (action === "APPROVED") {
    await prisma.agency.update({
      where: { id: request.agencyId },
      data: { plan: request.requestedPlan },
    });
  }

  return NextResponse.json(request);
}
