import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Users,
  Search,
  Download,
  Mail,
  User,
  Calendar,
  Ticket as TicketIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface EventAttendeesPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventAttendeesPage({
  params,
}: EventAttendeesPageProps) {
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

  // 2. Corrigido: Buscamos os participantes usando o modelo 'attendee'
  // Filtramos por pedidos que tenham o status PAID
  const attendees = await prisma.attendee.findMany({
    where: {
      eventId: eventId,
      order: {
        status: "PAID",
      },
    },
    include: {
      ticketType: true, // Inclui detalhes do tipo de ingresso (nome, preço)
      order: true, // Inclui detalhes da compra (data, id do pedido)
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

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Confirmados
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendees.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Participantes */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg">Lista de Inscritos</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome ou e-mail..."
                className="pl-8"
              />
            </div>
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Nenhum participante confirmado até ao momento.
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
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Confirmado
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Enviar E-mail"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
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
