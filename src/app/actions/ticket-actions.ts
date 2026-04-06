"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ticketSchema } from "@/schemas/ticket";

// 1. CRIAR LOTE (Já existia)
export async function createTicketTier(
  eventId: string,
  values: z.infer<typeof ticketSchema>,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Acesso negado. Sessão expirada.");

  const event = await prisma.event.findUnique({
    where: { id: eventId, organizerId: session.user.id },
  });

  if (!event) throw new Error("Evento não encontrado ou não tens permissão.");

  const data = ticketSchema.parse(values);
  const priceCents = Math.round(data.price * 100);

  await prisma.ticketTier.create({
    data: {
      eventId,
      name: data.name,
      description: data.description || "",
      priceCents,
      capacity: data.capacity,
      startSalesAt: data.startSalesAt,
      endSalesAt: data.endSalesAt,
    },
  });

  revalidatePath(`/events/${eventId}/tickets`);
}

// 2. ATUALIZAR LOTE (Novo!)
export async function updateTicketTier(
  tierId: string,
  eventId: string,
  values: z.infer<typeof ticketSchema>,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Acesso negado. Sessão expirada.");

  // Segurança: garantir que o evento pertence ao utilizador
  const event = await prisma.event.findUnique({
    where: { id: eventId, organizerId: session.user.id },
  });
  if (!event) throw new Error("Não autorizado.");

  const data = ticketSchema.parse(values);
  const priceCents = Math.round(data.price * 100);

  await prisma.ticketTier.update({
    where: { id: tierId },
    data: {
      name: data.name,
      description: data.description || "",
      priceCents,
      capacity: data.capacity,
      startSalesAt: data.startSalesAt,
      endSalesAt: data.endSalesAt,
    },
  });

  revalidatePath(`/events/${eventId}/tickets`);
  revalidatePath(`/${event.slug}`); // Atualiza a vitrine pública também!
}

// 3. APAGAR LOTE (Novo!)
export async function deleteTicketTier(tierId: string, eventId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Acesso negado. Sessão expirada.");

  const event = await prisma.event.findUnique({
    where: { id: eventId, organizerId: session.user.id },
  });
  if (!event) throw new Error("Não autorizado.");

  // Regra de Negócio Crítica: Não podemos apagar lotes que já tenham bilhetes vendidos!
  const ticketsSold = await prisma.ticket.count({
    where: { ticketTierId: tierId },
  });

  if (ticketsSold > 0) {
    throw new Error(
      "Não podes apagar um lote que já tem bilhetes vendidos. Tenta alterar a capacidade ou a data de fim.",
    );
  }

  await prisma.ticketTier.delete({
    where: { id: tierId },
  });

  revalidatePath(`/events/${eventId}/tickets`);
  revalidatePath(`/${event.slug}`);
}
