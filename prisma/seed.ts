import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  // Criptografa a senha "senha123"
  const hashedPassword = await bcrypt.hash("senha123", 10);

  // O upsert procura pelo email; se não achar, ele cria o usuário.
  const user = await prisma.user.upsert({
    where: { email: "organizador@zev3nt.com" },
    update: {},
    create: {
      name: "Iago Teles",
      email: "organizador@zev3nt.com",
      passwordHash: hashedPassword,
      role: "ORGANIZER",
    },
  });

  console.log("✅ Usuário organizador criado com sucesso:");
  console.log(`- Email: ${user.email}`);
  console.log(`- Senha: senha123`);
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
