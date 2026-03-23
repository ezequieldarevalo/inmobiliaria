import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, name, agencyName } = await req.json();
    if (!email || !password || !name || !agencyName) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
    }
    const agency = await prisma.agency.create({
      data: { name: agencyName, plan: "STARTER" },
    });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash, name, role: "ADMIN", agencyId: agency.id },
    });
    return NextResponse.json({ id: user.id, email: user.email });
  } catch {
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 });
  }
}
