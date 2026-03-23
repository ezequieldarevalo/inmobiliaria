import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(null, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { agencyId: true },
  });
  if (!user?.agencyId) return NextResponse.json(null);

  const agency = await prisma.agency.findUnique({
    where: { id: user.agencyId },
  });

  const pendingRequest = await prisma.planChangeRequest.findFirst({
    where: { agencyId: user.agencyId, status: "PENDING" },
  });

  const history = await prisma.planChangeRequest.findMany({
    where: { agencyId: user.agencyId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({
    currentPlan: agency?.plan || "STARTER",
    pendingRequest,
    history,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(null, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { agency: true },
  });
  if (!user?.agency) return NextResponse.json({ error: "Sin agencia" }, { status: 400 });

  const { requestedPlan } = await req.json();

  const existing = await prisma.planChangeRequest.findFirst({
    where: { agencyId: user.agency.id, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya tenés una solicitud pendiente" }, { status: 400 });
  }

  const request = await prisma.planChangeRequest.create({
    data: {
      agencyId: user.agency.id,
      currentPlan: user.agency.plan,
      requestedPlan,
      paymentAlias: "total.abundance.cp",
    },
  });

  return NextResponse.json(request);
}
