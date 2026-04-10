"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { validateCoupon } from "./coupon-actions";

// Importações necessárias para enviar e-mails nas compras gratuitas
import { Resend } from "resend";
import { OrganizerSaleEmail } from "@/emails/organizer-sale-email";
import TicketEmail from "@/emails/ticket-email";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Inicializa o Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Validação dos dados que vêm do formulário público
const checkoutSchema = z.object({
  eventId: z.string(),
  ticketTierId: z.string(),
  name: z.string().min(3),
  email: z.string().email(),
  cpf: z.string().min(11),
  couponCode: z.string().optional(),
});

export async function createCheckoutSession(
  values: z.infer<typeof checkoutSchema>,
) {
  const data = checkoutSchema.parse(values);
  const session = await auth();

  // 1. Procurar o tipo de ingresso
  const ticketType = await prisma.ticketType.findUnique({
    where: { id: data.ticketTierId },
  });

  if (!ticketType) throw new Error("Lote de ingressos não encontrado.");

  // 2. Lógica de Cupom e Cálculo do Preço Final
  let finalPrice = ticketType.price;
  let discountAmount = 0;
  let appliedCouponId: string | null = null;

  if (data.couponCode && ticketType.price > 0) {
    const couponRes = await validateCoupon(data.eventId, data.couponCode);

    if (couponRes.error) {
      throw new Error(`Cupom inválido: ${couponRes.error}`);
    }

    if (couponRes.success && couponRes.coupon) {
      appliedCouponId = couponRes.coupon.id;

      if (couponRes.coupon.discountType === "PERCENTAGE") {
        discountAmount = finalPrice * (couponRes.coupon.discountValue / 100);
      } else {
        discountAmount = couponRes.coupon.discountValue;
      }

      finalPrice = Math.max(0, finalPrice - discountAmount);

      await prisma.coupon.update({
        where: { id: appliedCouponId },
        data: { currentUses: { increment: 1 } },
      });
    }
  }

  // 3. Encontrar ou criar o comprador
  const buyer = await prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: {
      name: data.name,
      email: data.email,
      role: "USER",
    },
  });

  // 4. Criar o Pedido (Order)
  const order = await prisma.order.create({
    data: {
      eventId: data.eventId,
      userId: buyer.id,
      totalAmount: finalPrice,
      discountAmount: discountAmount,
      couponId: appliedCouponId,
      status: "PENDING",
      items: {
        create: {
          ticketTypeId: ticketType.id,
          quantity: 1,
          unitPrice: finalPrice,
        },
      },
      attendees: {
        create: {
          eventId: data.eventId,
          ticketTypeId: ticketType.id,
          name: data.name,
          email: data.email,
          qrCode: crypto.randomUUID(),
        },
      },
    },
  });

  // 5. Resolver a URL
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol =
    headersList.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`
  ).replace(/\/$/, "");

  // 6. TRATAMENTO DE BILHETES GRATUITOS (Agora com envio de E-mails!)
  if (finalPrice === 0) {
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
      include: {
        event: { include: { organizer: true } },
        attendees: { include: { ticketType: true } },
      },
    });

    // Enviar os e-mails antes de redirecionar
    if (updatedOrder.attendees.length > 0 && process.env.RESEND_API_KEY) {
      const attendee = updatedOrder.attendees[0];
      const eventData = updatedOrder.event;
      const isOnline = eventData.location?.toLowerCase().includes("online");
      const locationText = isOnline ? "Evento Online" : eventData.location;

      // E-mail do Comprador
      try {
        await resend.emails.send({
          from: "Zev3nt Ticketing <onboarding@resend.dev>",
          to: attendee.email,
          subject: `O teu bilhete para ${eventData.title} 🎟️`,
          react: TicketEmail({
            attendeeName: attendee.name,
            eventTitle: eventData.title,
            ticketTierName: attendee.ticketType.name,
            qrCodeToken: attendee.qrCode,
            startDate: format(
              new Date(eventData.date),
              "dd/MM/yyyy 'às' HH:mm",
              { locale: ptBR },
            ),
            locationText: locationText,
          }),
        });
      } catch (err) {
        console.error("Erro ao enviar bilhete grátis:", err);
      }

      // E-mail do Organizador
      if (eventData.organizer.email) {
        try {
          await resend.emails.send({
            from: "Zev3nt <onboarding@resend.dev>",
            to: eventData.organizer.email,
            subject: `🎉 Nova Inscrição (Grátis) - ${eventData.title}`,
            react: OrganizerSaleEmail({
              organizerName: eventData.organizer.name || "Organizador",
              eventName: eventData.title,
              attendeeName: attendee.name,
              attendeeEmail: attendee.email,
              ticketName: attendee.ticketType.name,
              amountPaid: 0,
              orderId: updatedOrder.id,
            }),
          });
        } catch (err) {
          console.error(
            "Erro ao notificar organizador de bilhete grátis:",
            err,
          );
        }
      }
    }

    // Redirecionar para o sucesso
    redirect(`${appUrl}/checkout/success?orderId=${order.id}`);
  }

  // 7. Configurar Mercado Pago (Apenas para bilhetes pagos)
  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
  const preference = new Preference(client);

  try {
    const successUrl = `${appUrl}/checkout/success`;
    const failureUrl = `${appUrl}/checkout/failure`;
    const pendingUrl = `${appUrl}/checkout/pending`;

    const notificationUrl = host.includes("localhost")
      ? undefined
      : `${appUrl}/api/webhooks/mercadopago`;

    const result = await preference.create({
      body: {
        items: [
          {
            id: ticketType.id,
            title: `Ingresso - ${ticketType.name}`,
            quantity: 1,
            unit_price: Number(finalPrice.toFixed(2)),
            currency_id: "BRL",
          },
        ],
        external_reference: order.id,
        notification_url: notificationUrl,
        back_urls: {
          success: successUrl,
          pending: pendingUrl,
          failure: failureUrl,
        },
        auto_return: "approved",
        payer: {
          email: data.email,
          name: data.name,
        },
      },
    });

    if (!result.init_point) {
      throw new Error("Ponto de início de pagamento não gerado.");
    }

    return { url: result.init_point };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    const mpError = error as { message?: string; error?: string };
    const mpMessage = mpError.message || mpError.error || errorMessage;

    console.error("Erro detalhado no Mercado Pago:", mpMessage);

    if (mpMessage.includes("invalid_auto_return")) {
      throw new Error(
        "Erro de configuração no Mercado Pago (Auto-return). Verifique se o domínio é seguro.",
      );
    }

    throw new Error("Falha ao gerar o link de pagamento.");
  }
}
