import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  TrendingUp,
  ArrowUpRight,
  Settings,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface EventOverviewPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventOverviewPage({
  params,
}: EventOverviewPageProps) {
  const { eventId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // 1. Procuramos o evento e garantimos que pertence ao organizador
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
      organizerId: session.user.id,
    },
    include: {
      _count: {
        select: { attendees: true },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // 2. Corrigido: Procuramos os tipos de ingressos (ticketTypes) em vez de ticketTiers
  const ticketTypes = await prisma.ticketType.findMany({
    where: { eventId },
    orderBy: { price: "asc" },
  });

  // 3. Calculamos a receita bruta deste evento específico (Pedidos Pagos)
  const revenueResult = await prisma.order.aggregate({
    _sum: {
      totalAmount: true,
    },
    where: {
      eventId,
      status: "PAID",
    },
  });

  const totalRevenue = revenueResult._sum.totalAmount || 0;

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Evento */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <Badge variant={event.status === "DRAFT" ? "secondary" : "default"}>
              {event.status === "DRAFT" ? "Rascunho" : "Publicado"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(event.date), "dd 'de' MMMM, yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/${event.slug}`} target="_blank">
              Ver Página Pública
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/events/${eventId}/settings`}>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid de Estatísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card shadow-sm>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Bruta</CardTitle>
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

        <Card shadow-sm>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Inscritos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event._count.attendees}</div>
          </CardContent>
        </Card>

        <Card shadow-sm>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lotes Ativos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketTypes.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Lotes / Tipos de Ingressos */}
        <Card className="col-span-4" shadow-sm>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ingressos e Lotes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/events/${eventId}/tickets`}>
                Ver detalhes
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketTypes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum lote criado para este evento.
                </p>
              ) : (
                ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{ticket.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.description || "Sem descrição"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {ticket.price === 0
                          ? "Grátis"
                          : new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(ticket.price)}
                      </p>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        Capacidade: {ticket.capacity}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações de Localização e Descrição Curta */}
        <Card className="col-span-3" shadow-sm>
          <CardHeader>
            <CardTitle>Sobre o Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground line-clamp-6">
              {event.description || "Nenhuma descrição fornecida."}
            </div>

            {event.locationUrl && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Localização no Mapa:</p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a
                    href={event.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Abrir no Google Maps
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
