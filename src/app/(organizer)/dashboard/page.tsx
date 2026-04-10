import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  TrendingUp,
  Users,
  Ticket,
  Calendar,
  ArrowUpRight,
  Plus,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const organizerId = session.user.id;

  // 1. Receita Total (Soma de todos os pedidos PAGOS - Campo atualizado para totalAmount)
  const revenueResult = await prisma.order.aggregate({
    _sum: {
      totalAmount: true,
    },
    where: {
      status: "PAID",
      event: {
        organizerId: organizerId,
      },
    },
  });

  // 2. Total de Inscritos (Soma de todos os attendees nos eventos deste organizador)
  const totalAttendees = await prisma.attendee.count({
    where: {
      event: {
        organizerId: organizerId,
      },
    },
  });

  // 3. Total de Eventos Criados
  const totalEvents = await prisma.event.count({
    where: {
      organizerId: organizerId,
    },
  });

  // 4. Últimos Eventos (Campo atualizado para date)
  const recentEvents = await prisma.event.findMany({
    where: {
      organizerId: organizerId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const totalRevenue = revenueResult._sum.totalAmount || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está o resumo dos teus eventos.
          </p>
        </div>
        <Link href="/events/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Evento
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  Ainda não criaste nenhum evento.
                </p>
              ) : (
                recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(event.date), "dd 'de' MMM, yyyy", {
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        Gerir
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Dicas de Sucesso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-3 bg-primary/5">
              <p className="text-sm font-medium text-primary">Divulgação</p>
              <p className="text-xs text-muted-foreground mt-1">
                Partilha o link do teu evento nas redes sociais para aumentar as
                vendas.
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">Cupons</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cria cupons de desconto limitados para gerar urgência nos teus
                compradores.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
