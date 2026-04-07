"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { headers } from "next/headers";

// Validação dos dados que vêm do formulário público
const checkoutSchema = z.object({
  eventId: z.string(),
  ticketTierId: z.string(),
  name: z.string().min(3),
  email: z.string().email(),
  cpf: z.string().min(11),
});

export async function createCheckoutSession(
  values: z.infer<typeof checkoutSchema>,
) {
  const data = checkoutSchema.parse(values);

  // 1. Procurar o lote de bilhetes na base de dados
  const tier = await prisma.ticketTier.findUnique({
    where: { id: data.ticketTierId },
  });

  if (!tier) throw new Error("Lote não encontrado.");

  // 2. Encontrar ou criar o comprador (User)
  // Como o Order exige um buyerId no schema do Prisma, precisamos de o ter na base de dados.
  // O upsert procura pelo e-mail; se não achar, cria o utilizador automaticamente.
  const buyer = await prisma.user.upsert({
    where: { email: data.email },
    update: {}, // Não alteramos os dados se ele já for registado (ex: um organizador a comprar bilhete)
    create: {
      name: data.name,
      email: data.email,
      role: "USER",
    },
  });

  // 3. Criar o Pedido (Order) como PENDENTE e já criar o bilhete associado
  const order = await prisma.order.create({
    data: {
      eventId: data.eventId,
      buyerId: buyer.id, // Passamos o ID do comprador que acabámos de criar/encontrar
      totalAmountCents: tier.priceCents,
      status: "PENDING",
      tickets: {
        create: {
          ticketTierId: tier.id,
          attendeeName: data.name,
          attendeeEmail: data.email,
          attendeeDocument: data.cpf,
          // Geramos o código do bilhete (só será validado pelo sistema quando a Order estiver PAID)
          qrCodeToken: crypto.randomUUID(),
        },
      },
    },
  });

  // 4. O SEGREDO: Resolver a URL dinamicamente sem depender de variáveis de ambiente!
  // Descobre automaticamente se está no localhost ou no domínio da Vercel
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const protocol =
    headersList.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "development" ? "http" : "https");

  // Usa o NEXT_PUBLIC_APP_URL se existir, caso contrário monta o link automático
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  // 5. Se o bilhete for grátis, ignoramos o Mercado Pago e aprovamos direto
  if (tier.priceCents === 0) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });
    return { url: `${appUrl}/checkout/success?external_reference=${order.id}` };
  }

  // 6. Configurar Mercado Pago e criar a Preference de Pagamento
  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
  const preference = new Preference(client);

  const result = await preference.create({
    body: {
      items: [
        {
          id: tier.id,
          title: `Ingresso - ${tier.name}`,
          quantity: 1,
          unit_price: tier.priceCents / 100, // Converte cêntimos para reais
          currency_id: "BRL",
        },
      ],
      external_reference: order.id,

      // 👉 A LINHA MÁGICA QUE FALTAVA PARA FORÇAR O WEBHOOK:
      notification_url: `${appUrl}/api/webhooks/mercadopago`,

      back_urls: {
        success: `${appUrl}/checkout/success`,
        pending: `${appUrl}/checkout/pending`,
        failure: `${appUrl}/checkout/failure`,
      },
      auto_return: "approved",
      payer: {
        email: data.email,
        name: data.name,
      },
    },
  });

  // Devolvemos o link mágico de pagamento do Mercado Pago
  return { url: result.init_point };
}
