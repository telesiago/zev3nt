import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle2,
  Ticket,
  Calendar,
  MapPin,
  QrCode,
  ArrowLeft,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  // No Next.js 15, as searchParams são uma Promise
  searchParams: Promise<{ external_reference?: string; payment_id?: string }>;
}) {
  // 1. Extraímos os parâmetros da URL
  const { external_reference, payment_id } = await searchParams;

  // Se não houver ID da encomenda, mostramos um erro amigável
  if (!external_reference) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center space-y-6">
        <div className="rounded-full bg-destructive/10 p-4 w-fit mx-auto">
          <Ticket className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Pedido não encontrado</h1>
        <p className="text-muted-foreground">
          Não conseguimos localizar os detalhes da sua compra.
        </p>
        <Link href="/">
          <Button>Voltar à página inicial</Button>
        </Link>
      </div>
    );
  }

  // 2. Vamos à base de dados buscar a encomenda, o evento e o bilhete gerado
  const order = await prisma.order.findUnique({
    where: { id: external_reference },
    include: {
      event: true,
      tickets: {
        include: {
          ticketTier: true,
        },
      },
    },
  });

  if (!order || order.tickets.length === 0) {
    notFound();
  }

  const ticket = order.tickets[0]; // No nosso MVP, é 1 bilhete por encomenda
  const event = order.event;

  const isOnline = event.format === "ONLINE";
  const locationText = isOnline
    ? "Evento Online"
    : (event.locationDetails as { address?: string })?.address ||
      "Local a definir";

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center space-y-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="rounded-full bg-green-500/10 p-4 w-fit mx-auto">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Pagamento Confirmado!
        </h1>
        <p className="text-muted-foreground text-lg">
          O teu lugar no evento <strong>{event.title}</strong> está garantido.
        </p>
      </div>

      {/* O Bilhete Digital */}
      <Card className="overflow-hidden border-2 shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="h-4 bg-primary" />{" "}
        {/* Faixa colorida no topo do bilhete */}
        <CardHeader className="text-center pb-2 border-b border-dashed">
          <CardTitle className="text-2xl font-black uppercase tracking-wider">
            {event.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground font-medium">
            {ticket.ticketTier.name}
          </p>
        </CardHeader>
        <CardContent className="p-0 flex flex-col md:flex-row">
          {/* Informações do Participante e Evento */}
          <div className="p-6 md:p-8 flex-1 space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                Participante
              </p>
              <p className="text-lg font-medium">{ticket.attendeeName}</p>
              <p className="text-sm text-muted-foreground">
                {ticket.attendeeDocument}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {format(new Date(event.startDate), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(event.startDate), "HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium">{locationText}</span>
              </div>
            </div>
          </div>

          {/* Área do QR Code (A destacar-se com fundo cinza claro) */}
          <div className="bg-muted/30 p-6 md:p-8 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-dashed min-w-[200px]">
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
              {/* No futuro podemos usar uma biblioteca como react-qr-code para desenhar um QR real usando o ticket.qrCodeToken */}
              <QrCode className="h-24 w-24 text-foreground opacity-80" />
            </div>
            <p className="text-xs text-center text-muted-foreground max-w-[150px]">
              Apresenta este código na entrada do evento.
            </p>
            <p className="text-[10px] text-muted-foreground mt-4 font-mono">
              ID: {ticket.id.split("-")[0].toUpperCase()}
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-4 flex justify-between items-center text-xs text-muted-foreground">
          <span>Ref Mercado Pago: {payment_id || "N/A"}</span>
          <span>Zev3nt Ticketing</span>
        </CardFooter>
      </Card>

      <div className="mt-8 flex justify-center">
        <Link href={`/${event.slug}`}>
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a página do evento
          </Button>
        </Link>
      </div>
    </div>
  );
}
