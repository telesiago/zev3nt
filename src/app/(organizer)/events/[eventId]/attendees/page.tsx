import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Users,
  Download,
  Clock,
  UserCheck,
  Ticket as TicketIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Importamos o novo componente de pesquisa
import { AttendeeSearch } from "./attendee-search";

interface EventAttendeesPageProps {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ q?: string }>; // Recebemos os parâmetros de busca
}

export default async function EventAttendeesPage({
  params,
  searchParams,
}: EventAttendeesPageProps) {
  const { eventId } = await params;
  const { q } = await searchParams; // Extraímos a query "q"
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

  // 2. Buscamos a contagem total de forma independente (para os cards não mudarem na pesquisa)
  const totalAttendeesCount = await prisma.attendee.count({
    where: { eventId: eventId, order: { status: "PAID" } },
  });

  const checkedInCount = await prisma.attendee.count({
    where: { eventId: eventId, order: { status: "PAID" }, isCheckedIn: true },
  });

  // 3. Buscamos os participantes aplicando o filtro de pesquisa (se existir)
  const attendees = await prisma.attendee.findMany({
    where: {
      eventId: eventId,
      order: {
        status: "PAID",
      },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      ticketType: true,
      order: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Participantes</h1>
          <p className="text-sm text-muted-foreground">
            Visualize e gerencie as pessoas confirmadas no evento {event.title}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Cards de Resumo (Estes valores agora estão fixos baseados no total) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Confirmados
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendeesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Check-ins Realizados
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {checkedInCount}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                / {totalAttendeesCount}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Participantes */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg">Lista de Inscritos</CardTitle>
            {/* Aqui renderizamos o novo componente de pesquisa */}
            <AttendeeSearch />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participante</TableHead>
                  <TableHead>Ingresso</TableHead>
                  <TableHead>Data da Compra</TableHead>
                  <TableHead>Check-in</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {q
                        ? `Nenhum participante encontrado com "${q}".`
                        : "Nenhum participante confirmado até ao momento."}
                    </TableCell>
                  </TableRow>
                ) : (
                  attendees.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{person.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {person.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TicketIcon className="h-3 w-3 text-primary" />
                          <span className="text-sm">
                            {person.ticketType.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(person.createdAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {person.isCheckedIn ? (
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 w-fit"
                            >
                              Realizado
                            </Badge>
                            {person.checkInTime && (
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                                <Clock className="h-3 w-3" />
                                {format(new Date(person.checkInTime), "HH:mm", {
                                  locale: ptBR,
                                })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-muted-foreground font-normal w-fit"
                          >
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
