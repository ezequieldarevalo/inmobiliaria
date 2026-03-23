import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public API - no auth required (for sharing)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    select: {
      id: true, title: true, description: true, propertyType: true, operationType: true,
      status: true, price: true, currency: true, expensas: true,
      province: true, city: true, neighborhood: true, street: true, streetNumber: true,
      totalArea: true, coveredArea: true, rooms: true, bedrooms: true, bathrooms: true,
      garages: true, age: true, floors: true, orientation: true, condition: true,
      amenities: true, lat: true, lng: true,
      agency: { select: { name: true, phone: true, email: true } },
    },
  });

  if (!property || property.status === "SUSPENDIDA") {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json(property);
}
