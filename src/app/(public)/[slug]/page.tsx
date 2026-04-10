import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, Video, Info, Map } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TicketCheckout } from "./ticket-checkout";
import { auth } from "@/auth";

export default async function EventHotsitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Desempacotamos o slug do URL (ex: meuevento.com/nome-do-evento)
  const { slug } = await params;
  const session = await auth();

  // Vamos à base de dados procurar o evento com este slug exato
  const event = await prisma.event.findUnique({
    where: { slug },
  });

  // Se o utilizador escrever um URL errado, mostramos a página 404
  if (!event) {
    notFound();
  }

  // Lógica de Preview: Se for DRAFT, apenas o organizador logado pode ver
  const isOrganizer = session?.user?.id === event.organizerId;
  const isDraft = event.status === "DRAFT";

  if (isDraft && !isOrganizer) {
    notFound();
  }

  // Vamos procurar os lotes de bilhetes disponíveis para este evento
  const ticketTiers = await prisma.ticketType.findMany({
    where: { eventId: event.id },
    orderBy: { price: "asc" },
  });

  // No novo schema, removemos o "format", mas se quiseres manter a lógica de "Online"
  // baseada na localização, podemos fazer uma verificação simples na string de localização.
  const isOnline = event.location?.toLowerCase().includes("online");
  const locationText = isOnline
    ? "Evento Online"
    : event.location || "Local a definir";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      {/* Aviso de Preview */}
      {isDraft && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-6 text-center">
          <p className="text-sm font-medium text-orange-600">
            Estás a visualizar o evento em modo de rascunho. Esta página não é
            pública.
          </p>
        </div>
      )}

      {/* 1. Hero Section (Destaque Principal) */}
      <div className="bg-card rounded-3xl p-8 md:p-12 mb-8 shadow-sm border">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20 text-sm py-1 px-3"
            >
              {isOnline ? "Online" : "Presencial"}
            </Badge>
            {isDraft && (
              <Badge
                variant="outline"
                className="text-orange-500 border-orange-500 text-sm py-1 px-3"
              >
                Preview (Apenas Organizador)
              </Badge>
            )}
            {event.category && (
              <Badge variant="outline" className="text-sm py-1 px-3">
                {event.category}
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
                {format(new Date(event.date), "dd 'de' MMMM, yyyy • HH:mm", {
                  locale: ptBR,
                })}
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

              {/* Novo Link do Google Maps */}
              {event.locationUrl && (
                <a
                  href={event.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                >
                  <Map className="h-4 w-4" />
                  Ver no Maps
                </a>
              )}
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
