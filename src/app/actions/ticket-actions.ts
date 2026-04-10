"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ticketSchema } from "@/schemas/ticket";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Cria um novo tipo de ingresso (lote) para um evento
 */
export async function createTicketType(
  eventId: string,
  values: z.infer<typeof ticketSchema>,
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  // Verificar se o evento pertence ao organizador
  const event = await prisma.event.findUnique({
    where: { id: eventId, organizerId: session.user.id },
  });

  if (!event) {
    throw new Error("Evento não encontrado ou permissão negada");
  }

  const validatedFields = ticketSchema.parse(values);

  await prisma.ticketType.create({
    data: {
      eventId,
      name: validatedFields.name,
      description: validatedFields.description,
      price: validatedFields.price,
      capacity: validatedFields.capacity,
    },
  });

  revalidatePath(`/events/${eventId}/tickets`);
  revalidatePath(`/events/${eventId}`);
}

/**
 * Atualiza um tipo de ingresso existente
 */
export async function updateTicketType(
  ticketId: string,
  values: z.infer<typeof ticketSchema>,
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const validatedFields = ticketSchema.parse(values);

  // Procurar o ingresso para saber o eventId (para revalidar a cache)
  const ticket = await prisma.ticketType.findUnique({
    where: { id: ticketId },
    include: { event: true },
  });

  if (!ticket || ticket.event.organizerId !== session.user.id) {
    throw new Error("Ingresso não encontrado ou permissão negada");
  }

  await prisma.ticketType.update({
    where: { id: ticketId },
    data: {
      name: validatedFields.name,
      description: validatedFields.description,
      price: validatedFields.price,
      capacity: validatedFields.capacity,
    },
  });

  revalidatePath(`/events/${ticket.eventId}/tickets`);
  revalidatePath(`/events/${ticket.eventId}`);
}

/**
 * Apaga um tipo de ingresso
 */
export async function deleteTicketType(ticketId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const ticket = await prisma.ticketType.findUnique({
    where: { id: ticketId },
    include: { event: true },
  });

  if (!ticket || ticket.event.organizerId !== session.user.id) {
    throw new Error("Ingresso não encontrado ou permissão negada");
  }

  // Nota: O Prisma lançará um erro se houverem Attendees (participantes)
  // já vinculados a este TicketType devido à restrição de chave estrangeira.
  await prisma.ticketType.delete({
    where: { id: ticketId },
  });

  revalidatePath(`/events/${ticket.eventId}/tickets`);
  revalidatePath(`/events/${ticket.eventId}`);
}
