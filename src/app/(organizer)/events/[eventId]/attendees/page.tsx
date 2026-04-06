import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, CheckCircle2, CircleDashed } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function EventAttendeesPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  // Vamos procurar todos os bilhetes associados a pedidos PAGOS deste evento
  const tickets = await prisma.ticket.findMany({
    where: {
      order: {
        eventId: eventId,
        status: "PAID",
      },
    },
    include: {
      ticketTier: true,
      order: true,
    },
    orderBy: {
      createdAt: "desc", // Mostra os compradores mais recentes primeiro
    },
  });

  // Contadores para o resumo
  const totalAttendees = tickets.length;
  const checkedInCount = tickets.filter((t) => t.checkInStatus).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Lista de Inscritos
          </h2>
          <p className="text-muted-foreground text-sm">
            Gere os participantes e verifica o estado do check-in.
          </p>
        </div>

        {/* Resumo rápido no topo */}
        <div className="flex gap-4 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold text-lg">{totalAttendees}</span>
          </div>
          <div className="w-px h-10 bg-border"></div>
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground">Entraram:</span>
            <span className="font-semibold text-lg text-primary">
              {checkedInCount}
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Participantes Confirmados</CardTitle>
          <CardDescription>
            Apenas bilhetes com pagamento aprovado aparecem nesta lista.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <Users className="h-10 w-10 mb-4 opacity-50" />
              <p>Ainda não tens participantes inscritos neste evento.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participante</TableHead>
                    <TableHead>Documento (CPF)</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Data da Compra</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="font-medium">{ticket.attendeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {ticket.attendeeEmail}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {ticket.attendeeDocument}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {ticket.ticketTier.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(
                          new Date(ticket.createdAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR },
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {ticket.checkInStatus ? (
                          <div className="flex items-center justify-end gap-1 text-green-600 font-medium text-sm">
                            <CheckCircle2 className="h-4 w-4" />
                            Validado
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 text-muted-foreground font-medium text-sm">
                            <CircleDashed className="h-4 w-4" />
                            Pendente
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
