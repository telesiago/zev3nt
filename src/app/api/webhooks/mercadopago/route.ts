import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { Resend } from "resend";
import TicketEmail from "@/emails/ticket-email";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Inicializa o cliente do Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = new URL(request.url);

    const type = url.searchParams.get("type") || body.type;
    const dataId = url.searchParams.get("data.id") || body.data?.id;

    if (type === "payment" && dataId) {
      const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN!,
      });
      const payment = new Payment(client);

      const paymentData = await payment.get({ id: dataId });

      if (paymentData.status === "approved" && paymentData.external_reference) {
        // 1. Atualizamos a Order para PAID e trazemos os dados do Bilhete e do Evento juntos!
        const updatedOrder = await prisma.order.update({
          where: { id: paymentData.external_reference },
          data: {
            status: "PAID",
            paymentProviderId: String(paymentData.id),
            paymentMethod: paymentData.payment_type_id,
          },
          include: {
            event: true,
            tickets: {
              include: { ticketTier: true },
            },
          },
        });

        console.log(
          `✅ Pagamento aprovado! Order ${paymentData.external_reference} marcada como PAID.`,
        );

        // 2. ENVIAR O E-MAIL COM O BILHETE (Se a chave da API estiver configurada)
        if (updatedOrder.tickets.length > 0 && process.env.RESEND_API_KEY) {
          const ticket = updatedOrder.tickets[0];
          const event = updatedOrder.event;

          const isOnline = event.format === "ONLINE";
          const locationText = isOnline
            ? "Evento Online"
            : (event.locationDetails as { address?: string })?.address ||
              "Local a definir";

          try {
            await resend.emails.send({
              // Em ambiente de testes, o Resend só envia através deste e-mail de onboarding
              from: "Zev3nt Ticketing <onboarding@resend.dev>",
              to: ticket.attendeeEmail,
              subject: `O teu bilhete para ${event.title} 🎟️`,
              react: TicketEmail({
                attendeeName: ticket.attendeeName,
                eventTitle: event.title,
                ticketTierName: ticket.ticketTier.name,
                qrCodeToken: ticket.qrCodeToken,
                startDate: format(
                  new Date(event.startDate),
                  "dd/MM/yyyy 'às' HH:mm",
                  { locale: ptBR },
                ),
                locationText: locationText,
              }),
            });
            console.log(
              `📧 E-mail de bilhete enviado com sucesso para ${ticket.attendeeEmail}`,
            );
          } catch (emailError) {
            console.error("❌ Erro ao enviar e-mail:", emailError);
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Erro no Webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
