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

  const publications = await prisma.publication.findMany({
    where: { agencyId },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          propertyType: true,
          operationType: true,
          status: true,
          price: true,
          currency: true,
          city: true,
          neighborhood: true,
          images: true,
          coverIndex: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(publications);
}

export async function POST(req: Request) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const publication = await prisma.publication.create({
    data: {
      propertyId: data.propertyId,
      portal: data.portal,
      status: data.status || "BORRADOR",
      externalUrl: data.externalUrl || null,
      externalId: data.externalId || null,
      generatedTitle: data.generatedTitle || null,
      generatedDesc: data.generatedDesc || null,
      publishedAt: data.status === "PUBLICADA" ? new Date() : null,
      notes: data.notes || null,
      agencyId,
    },
  });
  return NextResponse.json(publication);
}

export async function PUT(req: Request) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const publication = await prisma.publication.update({
    where: { id: data.id },
    data: {
      status: data.status,
      externalUrl: data.externalUrl,
      externalId: data.externalId,
      notes: data.notes,
      lastSyncAt: data.status === "PUBLICADA" ? new Date() : undefined,
    },
  });
  return NextResponse.json(publication);
}

export async function DELETE(req: Request) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  await prisma.publication.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
