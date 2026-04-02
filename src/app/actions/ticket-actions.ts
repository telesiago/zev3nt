"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ticketSchema } from "@/schemas/ticket";

export async function createTicketTier(
  eventId: string,
  values: z.infer<typeof ticketSchema>,
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Acesso negado. Sessão expirada.");
  }

  // 1. Validar se o evento pertence realmente a este organizador (Segurança!)
  const event = await prisma.event.findUnique({
    where: { id: eventId, organizerId: session.user.id },
  });

  if (!event) {
    throw new Error("Evento não encontrado ou não tens permissão.");
  }

  const data = ticketSchema.parse(values);

  // 2. Converter o preço em Reais (ex: 50.50) para Cêntimos/Inteiros (ex: 5050)
  // Isto evita problemas graves de arredondamento em sistemas financeiros
  const priceCents = Math.round(data.price * 100);

  // 3. Guardar na Base de Dados
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

  // 4. Atualizar a página para mostrar o novo lote imediatamente
  revalidatePath(`/events/${eventId}/tickets`);
}
