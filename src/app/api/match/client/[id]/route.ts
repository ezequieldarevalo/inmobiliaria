import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Match properties for a specific client based on their search preferences
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { agencyId: true },
  });
  if (!user?.agencyId) return NextResponse.json([]);

  const client = await prisma.client.findUnique({ where: { id: params.id } });
  if (!client) return NextResponse.json([]);

  const properties = await prisma.property.findMany({
    where: {
      agencyId: user.agencyId,
      status: { in: ["DISPONIBLE", "RESERVADA"] },
    },
    include: { owner: { select: { firstName: true, lastName: true } } },
  });

  const matches = properties
    .map((property) => {
      let score = 0;
      const reasons: string[] = [];

      // Operation type
      if (client.searchType) {
        if (client.searchType === property.operationType) {
          score += 30;
          reasons.push("Tipo de operación coincide");
        } else {
          return null;
        }
      }

      // Property type
      if (client.searchPropertyType) {
        const types = client.searchPropertyType.split(",").map((t) => t.trim());
        if (types.includes(property.propertyType)) {
          score += 20;
          reasons.push("Tipo de propiedad coincide");
        }
      }

      // Budget
      if (property.price) {
        const currency = client.budgetCurrency || property.currency;
        if (currency === property.currency) {
          if (client.budgetMin && property.price >= client.budgetMin) score += 10;
          if (client.budgetMax && property.price <= client.budgetMax) {
            score += 15;
            reasons.push("Dentro del presupuesto");
          } else if (client.budgetMax && property.price > client.budgetMax) {
            score -= 10;
          }
        }
      }

      // Rooms
      if (client.searchRooms && property.rooms) {
        const rooms = client.searchRooms.split(",").map((r) => parseInt(r.trim()));
        if (rooms.includes(property.rooms)) {
          score += 15;
          reasons.push("Ambientes coinciden");
        }
      }

      // Zone
      if (client.searchZone && (property.neighborhood || property.city)) {
        const zones = client.searchZone.toLowerCase().split(",").map((z) => z.trim());
        const propZone = (property.neighborhood || property.city || "").toLowerCase();
        if (zones.some((z) => propZone.includes(z) || z.includes(propZone))) {
          score += 20;
          reasons.push("Zona coincide");
        }
      }

      if (score <= 0) return null;

      return {
        property,
        score,
        matchPercent: Math.min(100, Math.round((score / 110) * 100)),
        reasons,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score);

  return NextResponse.json(matches);
}
