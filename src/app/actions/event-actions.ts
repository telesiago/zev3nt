"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eventSchema } from "@/schemas/event";

// 2. Função Server Action que o formulário vai chamar
export async function createEvent(values: z.infer<typeof eventSchema>) {
  // A. Verificar segurança: Quem está a tentar criar o evento?
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Acesso negado. Sessão expirada.");
  }

  // B. Validar os dados novamente no backend (Segurança extra)
  const validatedFields = eventSchema.parse(values);

  // C. Gerar um slug URL-friendly (ex: "meu-evento-1709823908")
  const baseSlug = validatedFields.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9]+/g, "-") // Substitui espaços por hífen
    .replace(/(^-|-$)+/g, ""); // Limpa hífens nas pontas

  const uniqueSlug = `${baseSlug}-${Date.now()}`;

  // D. Guardar na Base de Dados via Prisma
  await prisma.event.create({
    data: {
      organizerId: session.user.id,
      title: validatedFields.title,
      slug: uniqueSlug,
      description: validatedFields.description || "",
      format: validatedFields.format,
      startDate: validatedFields.startDate,
      endDate: validatedFields.endDate,
      locationDetails: validatedFields.location
        ? { address: validatedFields.location }
        : {},
      status: "DRAFT", // Começa sempre como Rascunho para não ir direto para o ar
    },
  });

  // E. Limpar a cache do Next.js e redirecionar o organizador para a lista de eventos
  revalidatePath("/events");
  redirect("/events");
}
