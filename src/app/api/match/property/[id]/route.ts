import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Match clients interested in a specific property
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { agencyId: true },
  });
  if (!user?.agencyId) return NextResponse.json([]);

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) return NextResponse.json([]);

  // Find clients whose search preferences match this property
  const clients = await prisma.client.findMany({
    where: { agencyId: user.agencyId },
  });

  const matches = clients
    .map((client) => {
      let score = 0;
      const reasons: string[] = [];

      // Operation type match
      if (client.searchType && property.operationType) {
        if (client.searchType === property.operationType) {
          score += 30;
          reasons.push("Tipo de operación coincide");
        } else {
          return null; // Hard filter - wrong operation type
        }
      }

      // Property type match
      if (client.searchPropertyType && property.propertyType) {
        const types = client.searchPropertyType.split(",").map((t) => t.trim());
        if (types.includes(property.propertyType)) {
          score += 20;
          reasons.push("Tipo de propiedad coincide");
        }
      }

      // Budget match
      if (property.price) {
        const currency = client.budgetCurrency || property.currency;
        if (currency === property.currency) {
          if (client.budgetMin && property.price >= client.budgetMin) {
            score += 10;
          }
          if (client.budgetMax && property.price <= client.budgetMax) {
            score += 15;
            reasons.push("Dentro del presupuesto");
          } else if (client.budgetMax && property.price > client.budgetMax) {
            score -= 10; // Over budget but don't exclude
          }
        }
      }

      // Rooms match
      if (client.searchRooms && property.rooms) {
        const rooms = client.searchRooms.split(",").map((r) => parseInt(r.trim()));
        if (rooms.includes(property.rooms)) {
          score += 15;
          reasons.push("Ambientes coinciden");
        }
      }

      // Zone match
      if (client.searchZone && (property.neighborhood || property.city)) {
        const zones = client.searchZone.toLowerCase().split(",").map((z) => z.trim());
        const propZone = (property.neighborhood || property.city || "").toLowerCase();
        if (zones.some((z) => propZone.includes(z) || z.includes(propZone))) {
          score += 20;
          reasons.push("Zona coincide");
        }
      }

      // Must have some score
      if (score <= 0) return null;

      return {
        client,
        score,
        matchPercent: Math.min(100, Math.round((score / 110) * 100)),
        reasons,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score);

  return NextResponse.json(matches);
}
