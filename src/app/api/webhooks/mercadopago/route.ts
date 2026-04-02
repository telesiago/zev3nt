import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";

export async function POST(request: Request) {
  try {
    // 1. O Mercado Pago envia os dados tanto pelo corpo (JSON) como pelos parâmetros da URL
    const body = await request.json();
    const url = new URL(request.url);

    // Tentamos extrair o ID e o tipo de evento (queremos os eventos do tipo "payment")
    const type = url.searchParams.get("type") || body.type;
    const dataId = url.searchParams.get("data.id") || body.data?.id;

    // 2. Se for uma notificação de pagamento, vamos confirmar diretamente na API deles por segurança
    if (type === "payment" && dataId) {
      const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN!,
      });
      const payment = new Payment(client);

      // Vamos buscar os detalhes seguros do pagamento usando o ID que recebemos
      const paymentData = await payment.get({ id: dataId });

      // 3. O momento da verdade: Foi aprovado? Temos a nossa referência externa (Order ID)?
      if (paymentData.status === "approved" && paymentData.external_reference) {
        // 4. Atualizamos a nossa Encomenda (Order) para PAGA na base de dados!
        await prisma.order.update({
          where: { id: paymentData.external_reference },
          data: {
            status: "PAID",
            paymentProviderId: String(paymentData.id), // Guardamos o ID do MP para devoluções futuras
            paymentMethod: paymentData.payment_type_id, // Ex: 'pix', 'credit_card'
          },
        });

        console.log(
          `✅ Pagamento aprovado! Order ${paymentData.external_reference} marcada como PAID.`,
        );
      }
    }

    // 5. Temos de responder sempre com 200 OK rápido para o Mercado Pago não tentar reenviar
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Erro no Webhook do Mercado Pago:", error);
    // Mesmo com erro interno, devolvemos 500 para sabermos o que falhou
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
