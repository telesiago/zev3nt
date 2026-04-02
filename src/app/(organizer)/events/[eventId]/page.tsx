import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Users, DollarSign, CheckCircle2 } from "lucide-react";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  // Desempacotamos o eventId (tal como fizemos no layout e nos tickets)
  const { eventId } = await params;

  // Vamos à base de dados procurar os lotes (ticket tiers) deste evento
  const ticketTiers = await prisma.ticketTier.findMany({
    where: { eventId },
  });

  // Verificamos se existem lotes e somamos a capacidade total de todos eles
  const hasTickets = ticketTiers.length > 0;
  const totalCapacity = ticketTiers.reduce(
    (acc, tier) => acc + tier.capacity,
    0,
  );

  return (
    <div className="space-y-6">
      {/* KPIs específicos deste evento */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita do Evento
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground">
              Nenhuma venda registada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bilhetes Vendidos
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            {/* Agora a capacidade é dinâmica e real da base de dados! */}
            <p className="text-xs text-muted-foreground">
              De {totalCapacity} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visualizações da Página
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Página ainda não publicada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerta Condicional: Mostra aviso se NÃO houver lotes, ou sucesso se houver */}
      {!hasTickets ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center h-48 text-center space-y-4 pt-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Ticket className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                Nenhum lote de bilhetes configurado
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                Para começares a vender, precisas de criar pelo menos um lote
                (ex: Entrada VIP, 1º Lote Pista) no separador &quot;Lotes e
                Bilhetes&quot;.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="rounded-full bg-primary/20 p-3 shrink-0">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-primary">
                Pronto para vender!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Já tens lotes configurados. O teu evento tem uma capacidade
                total de <strong>{totalCapacity} lugares</strong>. O próximo
                passo (no Sprint 4) será publicar a página do evento!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
