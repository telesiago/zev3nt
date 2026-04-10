import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Plus, Ticket, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TicketModal } from "./ticket-modal";
import { TicketActionsMenu } from "./ticket-actions-menu";

interface EventTicketsPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventTicketsPage({
  params,
}: EventTicketsPageProps) {
  const { eventId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // 1. Verificamos o evento e a permissão
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
      organizerId: session.user.id,
    },
  });

  if (!event) {
    notFound();
  }

  // 2. Corrigido: Procuramos os tipos de ingressos (ticketTypes) em vez de ticketTiers
  // Ordenamos por preço para uma visualização lógica
  const ticketTypes = await prisma.ticketType.findMany({
    where: { eventId },
    orderBy: { price: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Lotes e Ingressos
          </h1>
          <p className="text-sm text-muted-foreground">
            Crie diferentes tipos de ingressos e organize os lotes de venda para{" "}
            {event.title}.
          </p>
        </div>

        {/* Modal para criar novo ingresso */}
        <TicketModal eventId={eventId}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Lote
          </Button>
        </TicketModal>
      </div>

      {ticketTypes.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-primary/10 rounded-full mb-4">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Nenhum lote criado</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-6">
              Os participantes só poderão comprar bilhetes depois de criares
              pelo menos um lote.
            </p>
            <TicketModal eventId={eventId}>
              <Button variant="outline">Criar primeiro lote</Button>
            </TicketModal>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {ticketTypes.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Ticket className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{ticket.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>
                          {ticket.price === 0
                            ? "Grátis"
                            : new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(ticket.price)}
                        </span>
                        <span>•</span>
                        <span>Capacidade: {ticket.capacity}</span>
                      </div>
                      {ticket.description && (
                        <p className="text-xs mt-2 text-muted-foreground italic flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          {ticket.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <TicketActionsMenu eventId={eventId} ticket={ticket} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
