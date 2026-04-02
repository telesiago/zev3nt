"use server";

import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function createCheckoutSession(data: {
  eventId: string;
  ticketTierId: string;
  name: string;
  email: string;
  cpf: string;
}) {
  // 1. Ir buscar o preço real à base de dados (nunca confiar no preço do frontend)
  const tier = await prisma.ticketTier.findUnique({
    where: { id: data.ticketTierId },
  });

  if (!tier) throw new Error("Lote não encontrado");

  // 2. Garantir que o comprador existe na base de dados (Guest Checkout)
  const user = await prisma.user.upsert({
    where: { email: data.email },
    update: { name: data.name },
    create: {
      email: data.email,
      name: data.name,
      role: "USER",
      passwordHash: "guest", // Utilizador convidado sem senha
    },
  });

  // 3. Criar a Encomenda (Order) e o Bilhete Pendente no Prisma
  const order = await prisma.order.create({
    data: {
      buyerId: user.id,
      eventId: data.eventId,
      totalAmountCents: tier.priceCents,
      status: "PENDING",
      tickets: {
        create: {
          ticketTierId: tier.id,
          attendeeName: data.name,
          attendeeEmail: data.email,
          attendeeDocument: data.cpf,
          // Geramos já o código do bilhete (mas só será validado quando a Order estiver PAID)
          qrCodeToken: crypto.randomUUID(),
        },
      },
    },
  });

  // 4. URL de Retorno Fixa e Segura (Ignorando o .env para evitar erros de leitura do Node.js)
  // Sem query parameters (?orderId=) porque o Mercado Pago rejeita e já envia o external_reference automaticamente!
  const appUrl = "https://iago-teles.web.app/";

  const successUrl = `${appUrl}/checkout/success`;
  const pendingUrl = `${appUrl}/checkout/pending`;
  const failureUrl = `${appUrl}/checkout/failure`;

  // 5. Se o bilhete for grátis, ignoramos o Mercado Pago e aprovamos direto
  if (tier.priceCents === 0) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });
    // Para bilhetes grátis, enviamos o parâmetro manualmente pois não passamos pelo MP
    return { url: `${successUrl}?external_reference=${order.id}` };
  }

  // 6. Configurar Mercado Pago e criar a Preference de Pagamento
  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
  const preference = new Preference(client);

  const response = await preference.create({
    body: {
      items: [
        {
          id: tier.id,
          title: `Ingresso Zev3nt: ${tier.name}`,
          quantity: 1,
          unit_price: tier.priceCents / 100, // Mercado Pago exige o valor em decimais (Reais)
        },
      ],
      payer: {
        name: data.name,
        email: data.email,
        identification: {
          type: "CPF",
          number: data.cpf.replace(/\D/g, ""), // Remove pontos e traços do CPF
        },
      },
      external_reference: order.id, // CRUCIAL: O Mercado Pago vai enviar isto de volta na URL de sucesso!
      back_urls: {
        success: successUrl,
        pending: pendingUrl,
        failure: failureUrl,
      },
      auto_return: "approved",
    },
  });

  // Retornar o link de pagamento gerado pelo Mercado Pago
  return { url: response.init_point! };
}
