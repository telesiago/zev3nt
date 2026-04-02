import { PrismaClient } from "./../generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Garante que a URL de conexão está disponível
const connectionString = `${process.env.DATABASE_URL}`;

// Inicializa o pool de conexões nativo do Postgres
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Evita múltiplas instâncias do Prisma no modo de desenvolvimento do Next.js
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
