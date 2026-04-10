"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EventStatus } from "@prisma/client";

// 1. Mudar o Status (Publicar / Rascunho)
export async function toggleEventStatus(
  eventId: string,
  currentStatus: string,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  await prisma.event.update({
    where: { id: eventId, organizerId: session.user.id },
    data: { status: newStatus as EventStatus },
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/settings`);
  revalidatePath(`/`); // Atualiza a vitrine principal

  return newStatus;
}

// 2. Atualizar Imagem de Capa
export async function updateCoverImage(eventId: string, imageUrl: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  await prisma.event.update({
    where: { id: eventId, organizerId: session.user.id },
    // Corrigido: Usando imageUrl conforme o novo schema
    data: { imageUrl: imageUrl },
  });

  revalidatePath(`/events/${eventId}/settings`);
  revalidatePath(`/`);
}

// 3. Excluir Evento (Danger Zone)
export async function deleteEvent(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  // Apaga o evento e tudo o que está ligado a ele em cascata (se configurado no Prisma)
  // Ou apaga manualmente se não houver onDelete: Cascade

  // Corrigido: Usando ticketType em vez de ticketTier
  await prisma.ticketType.deleteMany({ where: { eventId } });
  await prisma.order.deleteMany({ where: { eventId } });

  await prisma.event.delete({
    where: { id: eventId, organizerId: session.user.id },
  });

  revalidatePath("/events");
  redirect("/events");
}
