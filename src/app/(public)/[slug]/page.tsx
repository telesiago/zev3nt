import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, Video, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TicketCheckout } from "./ticket-checkout";

export default async function EventHotsitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Desempacotamos o slug do URL (ex: meuevento.com/nome-do-evento)
  const { slug } = await params;

  // Vamos à base de dados procurar o evento com este slug exato
  const event = await prisma.event.findUnique({
    where: { slug },
  });

  // Se o utilizador escrever um URL errado, mostramos a página 404
  if (!event) {
    notFound();
  }

  // Vamos procurar os lotes de bilhetes disponíveis para este evento
  const ticketTiers = await prisma.ticketTier.findMany({
    where: { eventId: event.id },
    orderBy: { priceCents: "asc" },
  });

  const isOnline = event.format === "ONLINE";
  const locationText = isOnline
    ? "Evento Online"
    : (event.locationDetails as { address?: string })?.address ||
      "Local a definir";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      {/* 1. Hero Section (Destaque Principal) */}
      <div className="bg-card rounded-3xl p-8 md:p-12 mb-8 shadow-sm border">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20 text-sm py-1 px-3"
            >
              {event.format === "IN_PERSON"
                ? "Presencial"
                : isOnline
                  ? "Online"
                  : "Híbrido"}
            </Badge>
            {event.status === "DRAFT" && (
              <Badge
                variant="outline"
                className="text-orange-500 border-orange-500 text-sm py-1 px-3"
              >
                Preview (Apenas Organizador)
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {event.title}
          </h1>

          <div className="flex flex-col md:flex-row gap-4 mt-2 text-muted-foreground text-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>
                {format(
                  new Date(event.startDate),
                  "dd 'de' MMMM, yyyy • HH:mm",
                  { locale: ptBR },
                )}
              </span>
            </div>
            <div className="hidden md:block text-muted-foreground/30">•</div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Video className="h-5 w-5 text-primary" />
              ) : (
                <MapPin className="h-5 w-5 text-primary" />
              )}
              <span>{locationText}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Coluna Principal: Descrição do Evento */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2">Sobre o evento</h2>
          <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {event.description ||
              "O organizador ainda não adicionou detalhes sobre este evento."}
          </div>
        </div>

        {/* 3. Coluna Lateral: Compra de Bilhetes (Passo 2) */}
        <div className="lg:col-span-1">
          <TicketCheckout eventId={event.id} tiers={ticketTiers} />
        </div>
      </div>
    </div>
  );
}
