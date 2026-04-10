import "dotenv/config"; // Tenta carregar o .env
import { PrismaClient, Role, EventStatus, DiscountType } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Lemos a string de conexão do .env
const connectionString = `${process.env.DATABASE_URL}`;

// Criamos a pool de conexão do PostgreSQL
const pool = new Pool({ connectionString });

// Instanciamos o PrismaClient usando o Adapter do PostgreSQL
// para satisfazer a exigência de inicialização do PrismaClientOptions
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  // 1. Limpar dados existentes (dependências primeiro)
  await prisma.attendee.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.event.deleteMany();
  // Não apagamos users para não apagar a tua conta principal se já existir noutro contexto

  // 2. Criar ou Atualizar Utilizador Organizador (Com Senha / Credentials)
  const hashedPassword = await bcrypt.hash("senha123", 10);

  const organizer = await prisma.user.upsert({
    where: { email: "organizador@zev3nt.com" },
    update: {
      // Opcional: Atualiza a senha se o utilizador já existir
      // passwordHash: hashedPassword,
    },
    create: {
      name: "Iago Teles",
      email: "organizador@zev3nt.com",
      role: Role.ORGANIZER,
      passwordHash: hashedPassword, // Adicionado para NextAuth Credentials
    },
  });

  console.log("✅ Usuário organizador verificado/criado com sucesso:");
  console.log(`- Email: ${organizer.email}`);
  console.log(`- Senha: senha123`);

  // 3. Criar Eventos (com os novos campos)
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 2);

  const event1 = await prisma.event.create({
    data: {
      title: "Conferência Tech 2026",
      slug: "conferencia-tech-2026",
      description: "Um evento incrível criado pelo seed.",
      date: futureDate,
      location: "Lisboa, Portugal",
      locationUrl: "https://maps.app.goo.gl/exemplo",
      imageUrl:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070",
      status: EventStatus.PUBLISHED,
      category: "Tecnologia",
      organizerId: organizer.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: "Workshop Secreto (Rascunho)",
      slug: "workshop-secreto-2026",
      description:
        "Este evento está em rascunho para testares a funcionalidade de Preview.",
      date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      location: "Online",
      status: EventStatus.DRAFT,
      category: "Design",
      organizerId: organizer.id,
    },
  });

  console.log("✅ Eventos criados.");

  // 4. Criar Tipos de Ingressos
  await prisma.ticketType.create({
    data: {
      eventId: event1.id,
      name: "Entrada Gratuita",
      description: "Acesso básico.",
      price: 0,
      capacity: 100,
    },
  });

  await prisma.ticketType.create({
    data: {
      eventId: event1.id,
      name: "Passe VIP",
      description: "Acesso total.",
      price: 150.0,
      capacity: 50,
    },
  });

  console.log("✅ Tipos de ingressos criados.");

  // 5. Criar Cupons de Desconto
  await prisma.coupon.create({
    data: {
      eventId: event1.id,
      code: "PROMO20",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      maxUses: 50,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      eventId: event1.id,
      code: "MENOS50",
      discountType: DiscountType.FIXED,
      discountValue: 50,
      isActive: true,
    },
  });

  console.log("✅ Cupons de teste criados.");
  console.log("🎉 Seeding concluído com sucesso!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end(); // Fecha a pool para o Node.js poder encerrar
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
