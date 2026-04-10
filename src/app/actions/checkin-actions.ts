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
    const searchToken = qrCodeToken.trim().toLowerCase();

    // 2. Procurar o bilhete (agora Attendee) na base de dados
    const attendee = await prisma.attendee.findFirst({
      where: {
        qrCode: {
          startsWith: searchToken,
        },
      },
      include: {
        order: true,
        ticketType: true, // Atualizado de ticketTier para ticketType
      },
    });

    // 3. Validações de Segurança Críticas
    if (!attendee) {
      return {
        success: false,
        message: "❌ Bilhete inválido ou não encontrado.",
      };
    }

    // O novo schema liga o Attendee diretamente ao Evento, o que facilita a validação
    if (attendee.eventId !== eventId) {
      return {
        success: false,
        message: "❌ Este bilhete pertence a OUTRO evento!",
      };
    }

    if (attendee.order.status !== "PAID") {
      return {
        success: false,
        message: "❌ O pagamento deste bilhete ainda não foi confirmado.",
      };
    }

    // Atualizado de checkInStatus para isCheckedIn
    if (attendee.isCheckedIn) {
      const time = attendee.checkInTime
        ? new Date(attendee.checkInTime).toLocaleTimeString("pt-BR")
        : "hora desconhecida";
      return {
        success: false,
        message: `⚠️ ATENÇÃO: Bilhete DUPLICADO! Já foi validado hoje às ${time}.`,
      };
    }

    // 4. Tudo Certo! Autorizar a entrada e atualizar o estado do bilhete
    await prisma.attendee.update({
      where: { id: attendee.id },
      data: {
        isCheckedIn: true,
        checkInTime: new Date(),
      },
    });

    // 5. Limpar a cache para que a Tabela de Inscritos se atualize automaticamente
    revalidatePath(`/events/${eventId}/attendees`);

    return {
      success: true,
      message: "✅ Check-in realizado com sucesso!",
      attendeeName: attendee.name,
      ticketTier: attendee.ticketType.name,
    };
  } catch (error) {
    console.error("Erro ao validar bilhete:", error);
    return { success: false, message: "❌ Erro interno no servidor." };
  }
}
