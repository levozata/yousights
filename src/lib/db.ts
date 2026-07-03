import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Panels fan out to up to 50 personas in parallel (§6), each doing a few
// queries concurrently — a small default pool would serialize them.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 20 });

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
