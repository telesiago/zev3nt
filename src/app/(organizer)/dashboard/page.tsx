import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Users, CreditCard, Activity } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null; // O Middleware já protege a rota, mas isto garante a tipagem segura
  }

  const organizerId = session.user.id;

  // 1. Receita Total (Soma de todos os pedidos PAGOS dos eventos deste organizador)
  const revenueResult = await prisma.order.aggregate({
    _sum: { totalAmountCents: true },
    where: {
      status: "PAID",
      event: { organizerId },
    },
  });
  const totalRevenueCents = revenueResult._sum.totalAmountCents || 0;

  // 2. Total de Bilhetes Vendidos
  const ticketsSold = await prisma.ticket.count({
    where: {
      order: {
        status: "PAID",
        event: { organizerId },
      },
    },
  });

  // 3. Bónus: Buscar os últimos 5 pedidos pagos para mostrar na lista de "Vendas Recentes"
  const recentSales = await prisma.order.findMany({
    where: {
      status: "PAID",
      event: { organizerId },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      buyer: true,
      event: true,
    },
  });

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Visão Geral</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalRevenueCents / 100)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor líquido recebido
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
            <div className="text-2xl font-bold">{ticketsSold}</div>
            <p className="text-xs text-muted-foreground">
              Ingressos emitidos com sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Páginas de Eventos (Views)
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Métrica em breve</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Métrica em breve</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 mt-4">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <CardTitle>Vendas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-10 border-2 border-dashed rounded-lg">
                Ainda não há vendas registadas. Começa a partilhar o teu evento!
              </div>
            ) : (
              <div className="space-y-6 mt-4">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {sale.buyer.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sale.buyer.email} •{" "}
                        <span className="font-semibold">
                          {sale.event.title}
                        </span>
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-green-600">
                      +
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(sale.totalAmountCents / 100)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
