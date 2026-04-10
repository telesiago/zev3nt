import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { Resend } from "resend";
import { OrganizerSaleEmail } from "@/emails/organizer-sale-email";
import TicketEmail from "@/emails/ticket-email";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Inicializamos o Resend com a chave da variável de ambiente
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // Tenta ler do body (JSON) ou fallback para a URL
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);

    const type = url.searchParams.get("type") || body.type;
    const id =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      body.data?.id;

    // O Mercado Pago envia o tipo "payment" quando há uma atualização num pagamento
    if (type !== "payment" || !id) {
      return NextResponse.json({ message: "Ignorado" }, { status: 200 });
    }

    // 1. Configuramos o Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });
    const paymentApi = new Payment(client);

    // 2. Buscamos os detalhes do pagamento no Mercado Pago
    const paymentData = await paymentApi.get({ id });

    // O external_reference é o ID da nossa Order na Zev3nt
    const orderId = paymentData.external_reference;
    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID não encontrado no pagamento" },
        { status: 400 },
      );
    }

    // 3. Verificamos se a Order existe na nossa base de dados
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order não encontrada" },
        { status: 404 },
      );
    }

    // 4. Se o pagamento foi aprovado E a ordem ainda estava pendente
    if (paymentData.status === "approved" && order.status === "PENDING") {
      // Atualiza o pedido para PAGO e busca os dados completos para os e-mails
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paymentId: String(paymentData.id), // Guardamos o ID do pagamento do MP
        },
        include: {
          event: {
            include: { organizer: true },
          },
          attendees: {
            include: { ticketType: true },
          },
        },
      });

      console.log(`✅ Pagamento aprovado! Order ${orderId} marcada como PAID.`);

      // 5. Bloco de Envio de E-mails
      if (updatedOrder.attendees.length > 0 && process.env.RESEND_API_KEY) {
        const attendee = updatedOrder.attendees[0];
        const event = updatedOrder.event;

        // 5.1 Enviar o E-mail do Bilhete para o Comprador
        try {
          const isOnline = event.location?.toLowerCase().includes("online");
          const locationText = isOnline ? "Evento Online" : event.location;

          await resend.emails.send({
            from: "Zev3nt Ticketing <onboarding@resend.dev>",
            to: attendee.email,
            subject: `O teu bilhete para ${event.title} 🎟️`,
            react: TicketEmail({
              attendeeName: attendee.name,
              eventTitle: event.title,
              ticketTierName: attendee.ticketType.name,
              qrCodeToken: attendee.qrCode,
              startDate: format(new Date(event.date), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              }),
              locationText: locationText,
            }),
          });
          console.log(
            `📧 E-mail de bilhete enviado com sucesso para ${attendee.email}`,
          );
        } catch (emailError) {
          console.error(
            "❌ Erro ao enviar bilhete para o comprador:",
            emailError,
          );
        }

        // 5.2 Enviar o E-mail de Nova Venda para o Organizador
        if (event.organizer.email) {
          try {
            await resend.emails.send({
              from: "Zev3nt <onboarding@resend.dev>",
              to: event.organizer.email,
              subject: `🎉 Nova Venda Realizada - ${event.title}`,
              react: OrganizerSaleEmail({
                organizerName: event.organizer.name || "Organizador",
                eventName: event.title,
                attendeeName: attendee.name,
                attendeeEmail: attendee.email,
                ticketName: attendee.ticketType.name,
                amountPaid: updatedOrder.totalAmount,
                orderId: updatedOrder.id,
              }),
            });
            console.log(
              `📧 E-mail de venda enviado para o organizador: ${event.organizer.email}`,
            );
          } catch (emailError) {
            console.error(
              "❌ Erro ao enviar aviso para o organizador:",
              emailError,
            );
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Erro no webhook do Mercado Pago:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
