"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { validateCoupon } from "./coupon-actions"; // Importamos a nossa função de validação

// Validação dos dados que vêm do formulário público (agora aceita couponCode)
const checkoutSchema = z.object({
  eventId: z.string(),
  ticketTierId: z.string(),
  name: z.string().min(3),
  email: z.string().email(),
  cpf: z.string().min(11),
  couponCode: z.string().optional(), // NOVO: Campo opcional
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

  // 2. Lógica de Cupom e Cálculo do Preço Final (SERVER-SIDE)
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

      // Incrementamos o uso do cupom no banco de dados IMEDIATAMENTE
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

  // 4. Criar o Pedido (Order) com os dados do cupom
  const order = await prisma.order.create({
    data: {
      eventId: data.eventId,
      userId: buyer.id,
      totalAmount: finalPrice, // Preço com desconto
      discountAmount: discountAmount, // Guardamos o desconto no banco
      couponId: appliedCouponId, // Guardamos a referência do cupom usado
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

  // 6. Se o bilhete for grátis (ou ficou 100% grátis devido ao cupom), aprovamos direto
  if (finalPrice === 0) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });
    redirect(`${appUrl}/checkout/success?orderId=${order.id}`);
  }

  // 7. Configurar Mercado Pago
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
            unit_price: Number(finalPrice.toFixed(2)), // Envia o preço final com desconto
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
