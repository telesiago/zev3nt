import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Calendar, MapPin, Video, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function EventsPage() {
  // 1. Verificar quem está logado
  const session = await auth();

  if (!session?.user?.id) {
    return null; // O Middleware já faz este trabalho, mas garantimos a segurança aqui também
  }

  // 2. Buscar apenas os eventos deste organizador (ordenados do mais recente para o mais antigo)
  const events = await prisma.event.findMany({
    where: {
      organizerId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Eventos</h1>
          <p className="text-muted-foreground">
            Gere os teus eventos e acompanha as vendas.
          </p>
        </div>
        <Link href="/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar Evento
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Ticket className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Nenhum evento encontrado</h2>
          <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
            Ainda não criaste nenhum evento. Começa agora mesmo a organizar a
            tua primeira experiência!
          </p>
          <Link href="/events/new">
            <Button>Criar o meu primeiro evento</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col overflow-hidden">
              <div className="h-32 bg-muted relative flex items-center justify-center">
                {/* Futuramente colocaremos a cover_image_url aqui */}
                <span className="text-muted-foreground text-sm">Sem capa</span>
                <Badge
                  className="absolute top-4 right-4"
                  variant={event.status === "DRAFT" ? "secondary" : "default"}
                >
                  {event.status === "DRAFT" ? "Rascunho" : "Publicado"}
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1" title={event.title}>
                  {event.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(
                    new Date(event.startDate),
                    "dd 'de' MMM, yyyy 'às' HH:mm",
                    { locale: ptBR },
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {event.format === "ONLINE" ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  <span className="line-clamp-1">
                    {/* O locationDetails é um JSONB, por isso fazemos o cast correto para o formato esperado */}
                    {event.format === "ONLINE"
                      ? "Evento Online"
                      : (event.locationDetails as { address?: string })
                          ?.address || "Local não definido"}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-4">
                <Link href={`/events/${event.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Gerir Evento
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
