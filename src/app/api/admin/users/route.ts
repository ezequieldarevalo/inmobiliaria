import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;
  const role = (session.user as { role: string }).role;
  return role === "SUPERADMIN";
}

export async function GET() {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    include: { agency: { select: { id: true, name: true, plan: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function PUT(req: Request) {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, role } = await req.json();
  const user = await prisma.user.update({ where: { id: userId }, data: { role } });
  return NextResponse.json(user);
}

export async function DELETE(req: Request) {
  if (!(await requireSuperAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
