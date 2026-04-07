"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function validateTicket(qrCodeToken: string, eventId: string) {
  // 1. Segurança: Verificar se quem está a usar a app de check-in é um utilizador logado
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Acesso negado. A sessão expirou." };
  }

  try {
    // Normaliza o token recebido (remove espaços e passa a minúsculas)
    // Assim, se digitares "EE61AFE0", ele transforma em "ee61afe0"
    const searchToken = qrCodeToken.trim().toLowerCase();

    // 2. Procurar o bilhete na base de dados
    // Trocámos o findUnique pelo findFirst e usámos o "startsWith".
    // Agora o sistema encontra o bilhete tanto pelo QR Code completo quanto pelo ID curto digitado manualmente!
    const ticket = await prisma.ticket.findFirst({
      where: {
        qrCodeToken: {
          startsWith: searchToken,
        },
      },
      include: {
        order: true,
        ticketTier: true,
      },
    });

    // 3. Validações de Segurança Críticas
    if (!ticket) {
      return {
        success: false,
        message: "❌ Bilhete inválido ou não encontrado.",
      };
    }

    if (ticket.order.eventId !== eventId) {
      return {
        success: false,
        message: "❌ Este bilhete pertence a OUTRO evento!",
      };
    }

    if (ticket.order.status !== "PAID") {
      return {
        success: false,
        message: "❌ O pagamento deste bilhete ainda não foi confirmado.",
      };
    }

    if (ticket.checkInStatus) {
      const time = ticket.checkInTime
        ? new Date(ticket.checkInTime).toLocaleTimeString("pt-BR")
        : "hora desconhecida";
      return {
        success: false,
        message: `⚠️ ATENÇÃO: Bilhete DUPLICADO! Já foi validado hoje às ${time}.`,
      };
    }

    // 4. Tudo Certo! Autorizar a entrada e atualizar o estado do bilhete
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        checkInStatus: true,
        checkInTime: new Date(),
      },
    });

    // 5. Limpar a cache para que a Tabela de Inscritos (Passo 2) se atualize automaticamente
    revalidatePath(`/events/${eventId}/attendees`);

    return {
      success: true,
      message: "✅ Check-in realizado com sucesso!",
      attendeeName: ticket.attendeeName,
      ticketTier: ticket.ticketTier.name,
    };
  } catch (error) {
    console.error("Erro ao validar bilhete:", error);
    return { success: false, message: "❌ Erro interno no servidor." };
  }
}
