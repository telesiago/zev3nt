import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;

// O segredo para Vercel/Serverless: Limitar as conexões por instância!
// Isto impede que a base de dados do Supabase bloqueie os acessos por excesso de tráfego.
const pool = new Pool({
  connectionString,
  max: 1, // Limita a apenas 1 ligação ativa por função lambda
  idleTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
