"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/schemas/event";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@prisma/client";

/**
 * Cria um novo evento na base de dados
 */
export async function createEvent(values: z.infer<typeof eventSchema>) {
  // A. Verificar segurança
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Não autorizado. Por favor, faça login novamente." };
  }

  try {
    // B. Validar os dados novamente no backend
    const validatedFields = eventSchema.parse(values);

    // C. Gerar um slug URL-friendly único
    const baseSlug = validatedFields.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const uniqueSlug = `${baseSlug}-${Date.now()}`;

    // D. Guardar na Base de Dados via Prisma
    await prisma.event.create({
      data: {
        organizerId: session.user.id,
        title: validatedFields.title,
        slug: uniqueSlug,
        description: validatedFields.description,
        date: new Date(validatedFields.date),
        location: validatedFields.location,
        locationUrl: validatedFields.locationUrl || null,
        category: validatedFields.category,
        imageUrl: validatedFields.imageUrl || null,
        status: validatedFields.status || "DRAFT",
      },
    });
  } catch (error: unknown) {
    // Tratamento seguro de erro do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return {
          error:
            "Sessão inválida: O seu utilizador não foi encontrado na base de dados. Por favor, saia e entre novamente.",
        };
      }
    }

    console.error("Erro ao criar evento:", error);
    return { error: "Ocorreu um erro inesperado ao criar o evento." };
  }

  // Redirecionamento fora do try/catch para evitar capturar o erro interno do Next.js
  revalidatePath("/events");
  revalidatePath("/dashboard");
  redirect("/events");
}

/**
 * Atualiza um evento existente
 */
export async function updateEvent(
  id: string,
  values: z.infer<typeof eventSchema>,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Não autorizado." };
  }

  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent || existingEvent.organizerId !== session.user.id) {
      return { error: "Evento não encontrado ou permissão negada." };
    }

    const validatedFields = eventSchema.parse(values);

    await prisma.event.update({
      where: { id },
      data: {
        title: validatedFields.title,
        description: validatedFields.description,
        date: new Date(validatedFields.date),
        location: validatedFields.location,
        locationUrl: validatedFields.locationUrl || null,
        category: validatedFields.category,
        imageUrl: validatedFields.imageUrl || null,
        status: validatedFields.status,
      },
    });

    revalidatePath("/events");
    revalidatePath(`/events/${id}`);
    revalidatePath(`/events/${id}/settings`);
    revalidatePath("/dashboard");
    revalidatePath(`/${existingEvent.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    return { error: "Falha ao atualizar o evento." };
  }
}

/**
 * Apaga um evento
 */
export async function deleteEvent(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const existingEvent = await prisma.event.findUnique({
    where: { id },
  });

  if (!existingEvent || existingEvent.organizerId !== session.user.id) {
    throw new Error("Permissão negada");
  }

  await prisma.event.delete({
    where: { id },
  });

  revalidatePath("/events");
  revalidatePath("/dashboard");
  redirect("/events");
}
