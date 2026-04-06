import { prisma } from "@/lib/prisma";
import { TicketModal } from "./ticket-modal";
import { TicketActionsMenu } from "./ticket-actions-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Ticket } from "lucide-react";

export default async function EventTicketsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  // Vai buscar os lotes já criados para este evento à base de dados
  const ticketTiers = await prisma.ticketTier.findMany({
    where: { eventId },
    orderBy: { startSalesAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Lotes e Bilhetes</h2>
          <p className="text-muted-foreground text-sm">
            Gere os tipos de entrada para o teu evento.
          </p>
        </div>
        <TicketModal eventId={eventId} />
      </div>

      {ticketTiers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Ticket className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Sem bilhetes configurados</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Cria o teu primeiro lote de bilhetes clicando no botão &quot;Novo
            Lote&quot; acima para começares a vender.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ticketTiers.map((tier) => (
            <Card key={tier.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>{tier.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-primary">
                      {tier.priceCents === 0
                        ? "Grátis"
                        : `R$ ${(tier.priceCents / 100).toFixed(2).replace(".", ",")}`}
                    </span>
                    {/* Aqui inserimos o nosso novo menu de Editar/Apagar! */}
                    <TicketActionsMenu eventId={eventId} tier={tier} />
                  </div>
                </CardTitle>
                <CardDescription>
                  Capacidade: {tier.capacity} bilhetes
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>Início:</strong>{" "}
                  {format(new Date(tier.startSalesAt), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </p>
                <p>
                  <strong>Fim:</strong>{" "}
                  {format(new Date(tier.endSalesAt), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
