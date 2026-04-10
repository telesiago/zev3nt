import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Download,
  ArrowLeft,
  Info,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SuccessPageProps {
  // Tipagem oficial e correta para Next.js 15
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  // 1. Desempacotamos a Promise primeiro
  const resolvedSearchParams = await searchParams;

  // 2. Extraímos os valores garantindo que lidamos com strings simples
  const rawOrderId = resolvedSearchParams.orderId;
  const rawExternalRef = resolvedSearchParams.external_reference;

  const orderId =
    (typeof rawOrderId === "string" ? rawOrderId : undefined) ||
    (typeof rawExternalRef === "string" ? rawExternalRef : undefined);

  if (!orderId) {
    redirect("/");
  }

  // 3. Procuramos os dados da compra
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      event: true,
      attendees: {
        include: {
          ticketType: true,
        },
      },
    },
  });

  // Verificamos se o pedido existe e se está pago
  if (!order || order.status !== "PAID") {
    if (!order) notFound();

    // Estado de espera (útil se o webhook do Mercado Pago atrasar 1 ou 2 segundos)
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold mb-2">
          Processando seu pagamento...
        </h1>
        <p className="text-muted-foreground mb-8">
          Estamos a confirmar os detalhes com o Mercado Pago. Atualize esta
          página em instantes.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href={`/checkout/success?orderId=${orderId}`}>
              Atualizar Página
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Voltar ao Início</Link>
          </Button>
        </div>
      </div>
    );
  }

  const event = order.event;
  const isOnline = event.location?.toLowerCase().includes("online");

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header de Sucesso */}
        <div className="flex flex-col items-center text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            PAGAMENTO CONFIRMADO!
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md">
            O teu lugar no evento{" "}
            <strong className="text-foreground">{event.title}</strong> está
            garantido. Prepara-te para uma experiência incrível!
          </p>
        </div>

        {/* Listagem de Bilhetes */}
        <div className="space-y-8">
          {order.attendees.map((attendee) => {
            const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${attendee.qrCode}`;

            return (
              <div
                key={attendee.id}
                className="w-full bg-card rounded-3xl shadow-2xl border overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500"
              >
                {/* Lado Esquerdo */}
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="uppercase tracking-[0.2em] text-[10px] font-black text-primary">
                        {attendee.ticketType.name}
                      </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black uppercase mb-8 leading-none tracking-tighter">
                      {event.title}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">
                          Participante
                        </p>
                        <p className="font-bold text-lg leading-tight">
                          {attendee.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {attendee.email}
                        </p>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <p className="text-sm font-bold">
                              {format(
                                new Date(event.date),
                                "dd 'de' MMMM, yyyy",
                                { locale: ptBR },
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Início às {format(new Date(event.date), "HH:mm")}h
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <p className="text-sm font-bold">
                              {isOnline ? "Evento Online" : event.location}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {isOnline
                                ? "Link enviado por e-mail"
                                : "Apresenta este bilhete na entrada"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-dashed flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span className="text-[10px] font-medium uppercase tracking-tight">
                        Bilhete pessoal e intransmissível
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Order ID
                      </p>
                      <p className="text-[10px] font-mono">
                        {order.id.slice(0, 12).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lado Direito - QR Code */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 md:p-10 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-dashed border-muted-foreground/30 min-w-[320px]">
                  <div className="bg-white p-4 rounded-2xl shadow-inner border-4 border-zinc-100 dark:border-zinc-800 mb-6 group transition-transform hover:scale-105">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeImageUrl}
                      alt="QR Code do Participante"
                      className="h-44 w-44 object-contain"
                    />
                  </div>

                  <div className="text-center space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                        Código de Validação
                      </p>
                      <p className="font-mono text-xl font-black tracking-[0.3em] text-primary">
                        {attendee.qrCode.split("-")[0].toUpperCase()}
                      </p>
                    </div>

                    <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[180px] mx-auto italic">
                      Apresenta este QR Code ou o código acima no check-in do
                      evento.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ações Finais */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto gap-2 group"
            disabled
          >
            <Download className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
            Guardar como PDF
          </Button>
          <Button size="lg" className="w-full sm:w-auto gap-2" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Voltar à Página Inicial
            </Link>
          </Button>
        </div>

        {order.attendees.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-8">
            Enviámos uma cópia deste bilhete para{" "}
            <span className="font-bold">{order.attendees[0].email}</span>.
          </p>
        )}
      </div>
    </div>
  );
}
