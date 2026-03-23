import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create agency
  const agency = await prisma.agency.upsert({
    where: { id: "demo-agency" },
    update: {},
    create: {
      id: "demo-agency",
      name: "Inmobiliaria Demo",
      email: "demo@inmogestor.com.ar",
      cuit: "30-12345678-9",
      phone: "11-2345-6789",
      province: "Buenos Aires",
      city: "Capital Federal",
      street: "Av. Corrientes",
      streetNumber: "1234",
      matricula: "CUCICBA 1234",
      plan: "PREMIUM",
    },
  });

  // Create SUPERADMIN
  const superPassword = await bcrypt.hash("super123", 10);
  await prisma.user.upsert({
    where: { email: "super@inmogestor.com.ar" },
    update: {},
    create: {
      email: "super@inmogestor.com.ar",
      password: superPassword,
      name: "Super Admin",
      role: "SUPERADMIN",
    },
  });

  // Create admin user for the agency
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      password: adminPassword,
      name: "Martín García",
      role: "ADMIN",
      agencyId: agency.id,
    },
  });

  // Create owners
  const owner1 = await prisma.owner.create({
    data: {
      firstName: "Roberto",
      lastName: "Fernández",
      email: "roberto@email.com",
      phone: "11-5555-1111",
      dni: "20345678",
      province: "Buenos Aires",
      city: "Capital Federal",
      bankAlias: "roberto.fernandez",
      agencyId: agency.id,
    },
  });

  const owner2 = await prisma.owner.create({
    data: {
      firstName: "María",
      lastName: "López",
      email: "maria.lopez@email.com",
      phone: "11-5555-2222",
      dni: "27654321",
      province: "Buenos Aires",
      city: "Capital Federal",
      bankCbu: "0000003100000000000001",
      agencyId: agency.id,
    },
  });

  // Create properties
  const prop1 = await prisma.property.create({
    data: {
      title: "Depto 3 amb en Palermo - Luminoso",
      description: "Hermoso departamento de 3 ambientes con balcón y vista abierta. Excelente ubicación.",
      propertyType: "DEPARTAMENTO",
      operationType: "ALQUILER",
      status: "ALQUILADA",
      price: 450000,
      currency: "ARS",
      expensas: 85000,
      province: "Buenos Aires",
      city: "Capital Federal",
      neighborhood: "Palermo",
      street: "Gurruchaga",
      streetNumber: "1850",
      floor: "8",
      apartment: "A",
      totalArea: 75,
      coveredArea: 70,
      rooms: 3,
      bedrooms: 2,
      bathrooms: 1,
      garages: 0,
      age: 15,
      condition: "MUY_BUENO",
      amenities: "BALCON,ASCENSOR,LAUNDRY",
      lat: -34.5875,
      lng: -58.4280,
      agencyId: agency.id,
      ownerId: owner1.id,
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      title: "Casa 4 amb con jardín en Belgrano",
      description: "Amplia casa con jardín, parrilla y cochera. Ideal familia.",
      propertyType: "CASA",
      operationType: "VENTA",
      status: "DISPONIBLE",
      price: 320000,
      currency: "USD",
      province: "Buenos Aires",
      city: "Capital Federal",
      neighborhood: "Belgrano",
      street: "Echeverría",
      streetNumber: "2400",
      totalArea: 200,
      coveredArea: 150,
      rooms: 4,
      bedrooms: 3,
      bathrooms: 2,
      garages: 1,
      age: 30,
      condition: "BUENO",
      amenities: "JARDIN,PARRILLA,QUINCHO",
      lat: -34.5600,
      lng: -58.4560,
      agencyId: agency.id,
      ownerId: owner2.id,
    },
  });

  const prop3 = await prisma.property.create({
    data: {
      title: "Monoambiente a estrenar en Caballito",
      description: "Monoambiente divisible, piso alto, amenities completos.",
      propertyType: "DEPARTAMENTO",
      operationType: "ALQUILER",
      status: "DISPONIBLE",
      price: 280000,
      currency: "ARS",
      expensas: 60000,
      province: "Buenos Aires",
      city: "Capital Federal",
      neighborhood: "Caballito",
      street: "Av. Rivadavia",
      streetNumber: "5200",
      floor: "12",
      apartment: "C",
      totalArea: 38,
      coveredArea: 35,
      rooms: 1,
      bedrooms: 0,
      bathrooms: 1,
      garages: 0,
      age: 0,
      condition: "A_ESTRENAR",
      amenities: "PILETA,GYM,SUM,ASCENSOR,LAUNDRY,SEGURIDAD",
      lat: -34.6186,
      lng: -58.4365,
      agencyId: agency.id,
      ownerId: owner1.id,
    },
  });

  // Create clients
  const client1 = await prisma.client.create({
    data: {
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan.perez@gmail.com",
      phone: "11-3333-4444",
      dni: "35678901",
      clientType: "INQUILINO",
      source: "PORTAL",
      agencyId: agency.id,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      firstName: "Laura",
      lastName: "Martínez",
      email: "laura.m@gmail.com",
      phone: "11-6666-7777",
      clientType: "INTERESADO",
      source: "INSTAGRAM",
      searchType: "VENTA",
      searchZone: "Belgrano, Nuñez, Colegiales",
      budgetMin: 200000,
      budgetMax: 400000,
      budgetCurrency: "USD",
      searchRooms: "3,4",
      searchPropertyType: "CASA,PH",
      agencyId: agency.id,
    },
  });

  const client3 = await prisma.client.create({
    data: {
      firstName: "Carlos",
      lastName: "Gómez",
      email: "carlos.gomez@email.com",
      phone: "11-8888-9999",
      clientType: "INTERESADO",
      source: "REFERIDO",
      searchType: "ALQUILER",
      searchZone: "Palermo, Villa Crespo",
      budgetMax: 350000,
      budgetCurrency: "ARS",
      searchRooms: "2,3",
      searchPropertyType: "DEPARTAMENTO",
      agencyId: agency.id,
    },
  });

  // Create contract (rental)
  const contract = await prisma.contract.create({
    data: {
      contractType: "ALQUILER",
      status: "VIGENTE",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2026-12-31"),
      amount: 450000,
      currency: "ARS",
      adjustmentType: "ICL",
      adjustmentPeriod: 3,
      depositMonths: 1,
      depositAmount: 450000,
      commissionPercent: 4.15,
      commissionAmount: 450000 * 0.0415,
      guaranteeType: "GARANTE",
      guaranteeDetails: "Propietario en CABA",
      propertyId: prop1.id,
      clientId: client1.id,
      ownerId: owner1.id,
      agencyId: agency.id,
    },
  });

  // Create payments for the contract
  const months = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06"];
  for (const m of months) {
    const [year, month] = m.split("-").map(Number);
    const isPast = new Date(year, month - 1) < new Date();
    await prisma.payment.create({
      data: {
        contractId: contract.id,
        period: m,
        dueDate: new Date(year, month - 1, 10),
        amount: 450000,
        currency: "ARS",
        status: isPast ? "PAGADO" : "PENDIENTE",
        paidDate: isPast ? new Date(year, month - 1, 9) : null,
        paidAmount: isPast ? 450000 : null,
        paymentMethod: isPast ? "TRANSFERENCIA" : null,
      },
    });
  }

  // Create appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.appointment.createMany({
    data: [
      {
        title: "Visita depto Caballito - Laura Martínez",
        date: tomorrow,
        time: "10:30",
        duration: 30,
        type: "VISITA",
        status: "CONFIRMADA",
        propertyId: prop3.id,
        clientId: client2.id,
        agencyId: agency.id,
      },
      {
        title: "Tasación casa Belgrano",
        date: nextWeek,
        time: "15:00",
        duration: 60,
        type: "TASACION",
        status: "PENDIENTE",
        propertyId: prop2.id,
        agencyId: agency.id,
      },
    ],
  });

  // Create transactions
  await prisma.transaction.createMany({
    data: [
      {
        type: "INGRESO",
        category: "COMISION",
        description: "Comisión contrato Pérez - Gurruchaga 1850",
        amount: 450000 * 0.0415,
        date: new Date("2025-01-05"),
        agencyId: agency.id,
      },
      {
        type: "INGRESO",
        category: "ALQUILER",
        description: "Cobro alquiler enero - Gurruchaga 1850",
        amount: 450000,
        date: new Date("2025-01-09"),
        agencyId: agency.id,
      },
      {
        type: "EGRESO",
        category: "HONORARIO",
        description: "Liquidación propietario Fernández - enero",
        amount: 450000 * 0.9585,
        date: new Date("2025-01-15"),
        agencyId: agency.id,
      },
      {
        type: "EGRESO",
        category: "OTRO",
        description: "Publicación en Zonaprop",
        amount: 25000,
        date: new Date("2025-01-20"),
        agencyId: agency.id,
      },
    ],
  });

  console.log("Seed completed!");
  console.log("SUPERADMIN: super@inmogestor.com.ar / super123");
  console.log("Admin: admin@demo.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
