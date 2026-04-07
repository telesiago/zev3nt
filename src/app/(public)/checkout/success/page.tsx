import { redirect } from "next/navigation";
import { CheckCircle2, Calendar, MapPin, Ticket } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { external_reference?: string };
}) {
  const orderId = searchParams.external_reference;

  if (!orderId) {
    redirect("/");
  }

  // Vai buscar os dados da compra à base de dados para desenhar o bilhete
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      event: true,
      tickets: {
        include: { ticketTier: true },
      },
    },
  });

  if (!order || order.tickets.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold mb-2">Pedido não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          Não foi possível localizar o teu bilhete.
        </p>
        <Link href="/" className="text-primary hover:underline">
          Voltar à página inicial
        </Link>
      </div>
    );
  }

  const event = order.event;
  const ticket = order.tickets[0];
  const isOnline = event.format === "ONLINE";
  const locationDetails = event.locationDetails as { address?: string } | null;

  // URL para a API que gera a imagem real do QR Code
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticket.qrCodeToken}`;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-center mb-2">
        Pagamento Confirmado!
      </h1>
      <p className="text-muted-foreground text-center mb-10 max-w-md">
        O teu lugar no evento{" "}
        <strong className="text-foreground">{event.title}</strong> está
        garantido. Um e-mail com os detalhes também foi enviado.
      </p>

      {/* O Bilhete Desenhado */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border overflow-hidden flex flex-col md:flex-row">
        {/* Lado Esquerdo - Detalhes do Evento e Participante */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="uppercase tracking-widest text-xs font-bold text-muted-foreground mb-1">
              {ticket.ticketTier.name}
            </div>
            <h2 className="text-2xl font-black uppercase mb-6 leading-tight">
              {event.title}
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Participante
                </p>
                <p className="font-semibold text-lg">{ticket.attendeeName}</p>
                <p className="text-sm text-muted-foreground">
                  Doc: {ticket.attendeeDocument}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">
                  {format(new Date(event.startDate), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.startDate), "HH:mm")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">
                  {isOnline ? "Evento Online" : "Presencial"}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {isOnline
                    ? "Link será enviado em breve"
                    : locationDetails?.address || "Endereço a definir"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - O QR Code Real */}
        <div className="bg-muted/30 p-6 md:p-8 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-dashed min-w-[280px]">
          <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
            {/* Imagem do QR Code gerada dinamicamente */}
            <img
              src={qrCodeImageUrl}
              alt="QR Code do Bilhete"
              className="h-40 w-40 object-contain"
            />
          </div>
          <p className="text-xs text-center text-muted-foreground mb-4 max-w-[180px]">
            Apresenta este código na entrada do evento.
          </p>
          <div className="bg-background px-4 py-2 rounded-lg border text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              ID do Bilhete
            </p>
            <p className="font-mono text-sm font-bold tracking-widest">
              {ticket.qrCodeToken.split("-")[0].toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href={`/${event.slug}`}
          className="text-primary hover:underline font-medium flex items-center gap-2"
        >
          ← Voltar para a página do evento
        </Link>
      </div>
    </div>
  );
}
