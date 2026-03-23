import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(null, { status: 401 });

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      contracts: {
        include: {
          property: { select: { id: true, title: true, street: true, streetNumber: true, neighborhood: true, operationType: true, price: true, currency: true } },
        },
        orderBy: { startDate: "desc" },
      },
      appointments: {
        include: {
          property: { select: { id: true, title: true } },
        },
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });

  if (!client) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(client);
}
