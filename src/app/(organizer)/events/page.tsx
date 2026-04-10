import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, Plus, MoreVertical, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function EventsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Procuramos todos os eventos deste organizador
  const events = await prisma.event.findMany({
    where: {
      organizerId: session.user.id,
    },
    orderBy: {
      date: "desc", // Ordenamos pelo campo 'date' (novo schema)
    },
    include: {
      _count: {
        select: { attendees: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Eventos</h1>
          <p className="text-muted-foreground">
            Gerencie seus eventos, vendas e participantes em um só lugar.
          </p>
        </div>
        <Link href="/events/new">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Criar Evento
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Nenhum evento encontrado</h2>
          <p className="text-muted-foreground max-w-sm mt-2 mb-6">
            Você ainda não criou nenhum evento. Comece agora mesmo e alcance seu
            público.
          </p>
          <Link href="/events/new">
            <Button>Criar meu primeiro evento</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const isDraft = event.status === "DRAFT";

            return (
              <Card
                key={event.id}
                className="overflow-hidden flex flex-col group border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors"
              >
                <div className="relative h-32 bg-muted">
                  {/* Corrigido: Usando imageUrl em vez de coverImageUrl */}
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                      <Ticket className="h-10 w-10 text-zinc-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 shadow-md"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/events/${event.id}`}>Gerenciar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/events/${event.id}/settings`}>
                            Configurações
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="text-primary font-medium"
                        >
                          <Link href={`/${event.slug}`} target="_blank">
                            Ver Página Pública
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant={isDraft ? "secondary" : "default"}
                      className={
                        isDraft ? "bg-white/90 dark:bg-zinc-950/90" : ""
                      }
                    >
                      {isDraft ? "Rascunho" : "Publicado"}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-5 pb-2">
                  <CardTitle className="line-clamp-1 text-lg">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="flex flex-col gap-1.5 pt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {/* Corrigido: Usando date em vez de startDate */}
                      {format(
                        new Date(event.date),
                        "dd 'de' MMM, yyyy 'às' HH:mm",
                        { locale: ptBR },
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-2 flex-grow">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-zinc-100 dark:border-zinc-800">
                    <div className="text-center flex-1 border-r">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                        Participantes
                      </p>
                      <p className="text-lg font-bold">
                        {event._count.attendees}
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                        Categoria
                      </p>
                      <p className="text-sm font-medium truncate px-2">
                        {event.category || "Geral"}
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 mt-auto">
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    asChild
                  >
                    <Link href={`/events/${event.id}`}>Gerenciar Evento</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
