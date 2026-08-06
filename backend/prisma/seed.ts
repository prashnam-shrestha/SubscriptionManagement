import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding...");

  // 1. Seed Users (Owner and Admin)
  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@subscriptionos.local" },
    update: {
      passwordHash: "$2b$10$VYO494NCxltIItRXQ8IYUuZ9Uh3pTIHje8pGHvNHkdy8/xl81HnAG",
    },
    create: {
      userId: "USR-0000000000000001",
      fullName: "System Owner",
      email: "owner@subscriptionos.local",
      passwordHash: "$2b$10$VYO494NCxltIItRXQ8IYUuZ9Uh3pTIHje8pGHvNHkdy8/xl81HnAG",
      role: "Owner",
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@subscriptionos.local" },
    update: {},
    create: {
      userId: "USR-0000000000000002",
      fullName: "System Admin",
      email: "admin@subscriptionos.local",
      passwordHash: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQOEg6Lruj3vjPGga31lW",
      role: "Admin",
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 2. Seed Service Types
  const netflixType = await prisma.serviceType.upsert({
    where: { name: "Netflix" },
    update: {},
    create: {
      serviceTypeId: "SVCT-000000000000001",
      name: "Netflix",
      defaultProfileCapacity: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const primeType = await prisma.serviceType.upsert({
    where: { name: "Prime Video" },
    update: {},
    create: {
      serviceTypeId: "SVCT-000000000000002",
      name: "Prime Video",
      defaultProfileCapacity: 6,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 3. Seed Products
  const netflixProduct = await prisma.product.upsert({
    where: { productCode: "NFLX-1M" },
    update: {},
    create: {
      productId: "PRD-0000000000000001",
      productCode: "NFLX-1M",
      productName: "Netflix Premium - 1 Month",
      serviceTypeId: netflixType.serviceTypeId,
      price: 5.0,
      durationDays: 30,
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const primeProduct = await prisma.product.upsert({
    where: { productCode: "PRM-1M" },
    update: {},
    create: {
      productId: "PRD-0000000000000002",
      productCode: "PRM-1M",
      productName: "Prime Video - 1 Month",
      serviceTypeId: primeType.serviceTypeId,
      price: 3.0,
      durationDays: 30,
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 4. Seed Master Account
  const masterAcc = await prisma.masterAccount.upsert({
    where: { email: "master.netflix1@subscriptionos.local" },
    update: {},
    create: {
      masterAccountId: "MST-0000000000000001",
      email: "master.netflix1@subscriptionos.local",
      encryptedPassword: "encrypted_password_blob_here",
      nickname: "Netflix Primary Account 1",
      status: "Active",
      notes: "Seeded Master Account",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 5. Seed Service
  const service = await prisma.service.upsert({
    where: {
      masterAccountId_serviceTypeId: {
        masterAccountId: masterAcc.masterAccountId,
        serviceTypeId: netflixType.serviceTypeId,
      },
    },
    update: {},
    create: {
      serviceId: "SVC-0000000000000001",
      masterAccountId: masterAcc.masterAccountId,
      serviceTypeId: netflixType.serviceTypeId,
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 6. Seed Streaming Profiles
  const profile1 = await prisma.streamingProfile.upsert({
    where: { streamingProfileId: "PRF-0000000000000001" },
    update: {},
    create: {
      streamingProfileId: "PRF-0000000000000001",
      serviceId: service.serviceId,
      profileName: "Profile 1",
      encryptedPIN: "encrypted_pin_1234",
      capacity: 5,
      status: "Available",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 7. Seed Customer
  const customer = await prisma.customer.upsert({
    where: { phone: "+1234567890" },
    update: {},
    create: {
      customerId: "CUS-0000000000000001",
      fullName: "John Doe",
      phone: "+1234567890",
      username: "johndoe",
      platform: "WhatsApp",
      notes: "First seeded customer",
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 8. Seed Subscription
  const subscription = await prisma.subscription.upsert({
    where: { subscriptionId: "SUB-0000000000000001" },
    update: {},
    create: {
      subscriptionId: "SUB-0000000000000001",
      customerId: customer.customerId,
      productId: netflixProduct.productId,
      startDate: new Date("2026-08-01"),
      expiryDate: new Date("2026-08-31"),
      amountPaid: 5.0,
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // 9. Seed Assignment
  await prisma.assignment.upsert({
    where: { assignmentId: "ASN-0000000000000001" },
    update: {},
    create: {
      assignmentId: "ASN-0000000000000001",
      subscriptionId: subscription.subscriptionId,
      streamingProfileId: profile1.streamingProfileId,
      assignedAt: new Date("2026-08-01"),
      status: "Active",
      createdAt: new Date(),
    },
  });

  // 10. Seed Revenue
  await prisma.revenue.upsert({
    where: { revenueId: "REV-0000000000000001" },
    update: {},
    create: {
      revenueId: "REV-0000000000000001",
      subscriptionId: subscription.subscriptionId,
      amount: 5.0,
      paymentMethod: "Cash",
      receivedDate: new Date("2026-08-01"),
      createdBy: ownerUser.userId,
      createdAt: new Date(),
    },
  });

  // 11. Seed Activity Log
  await prisma.activityLog.upsert({
    where: { logId: "LOG-0000000000000001" },
    update: {},
    create: {
      logId: "LOG-0000000000000001",
      userId: ownerUser.userId,
      action: "SEED_DATABASE",
      entity: "Database",
      entityId: "SYSTEM",
      details: "Initial database seed completed",
      createdAt: new Date(),
    },
  });

  console.log("Database seeding finished successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });