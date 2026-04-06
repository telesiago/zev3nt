import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Ticket,
  Search,
  Calendar,
  MapPin,
  Video,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function HomePage({
  searchParams,
}: {
  // Recebemos os parâmetros da URL para fazer a pesquisa funcionar
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const searchQuery = q || "";

  // Vamos à base de dados buscar APENAS eventos publicados
  // Se houver uma pesquisa (searchQuery), filtramos pelo título
  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      title: {
        contains: searchQuery,
        mode: "insensitive", // Ignora maiúsculas e minúsculas
      },
    },
    orderBy: {
      startDate: "asc", // Mostra os eventos mais próximos primeiro
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      {/* 1. HEADER PÚBLICO */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-primary"
          >
            <Ticket className="h-6 w-6" />
            Zev3nt
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/events/new">
              <Button variant="ghost" className="hidden sm:flex">
                Organizar Evento
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button>Entrar</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* 2. HERO SECTION COM PESQUISA */}
      <section className="bg-primary/5 py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Descubra as melhores{" "}
            <span className="text-primary">experiências</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Encontre conferências, workshops, festas e muito mais. Compre o seu
            bilhete ou crie o seu próprio evento em minutos.
          </p>

          {/* Formulário de Pesquisa Real */}
          <form
            action="/"
            method="GET"
            className="flex items-center w-full max-w-2xl mx-auto relative shadow-sm rounded-full bg-white border overflow-hidden"
          >
            <div className="pl-4 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder="Pesquisar por eventos..."
              className="border-0 shadow-none focus-visible:ring-0 text-base py-6"
            />
            <Button type="submit" className="rounded-full mr-1 px-8">
              Buscar
            </Button>
          </form>
        </div>
      </section>

      {/* 3. GRELHA DE EVENTOS PUBLICADOS */}
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            {searchQuery
              ? `Resultados para "${searchQuery}"`
              : "Eventos em Destaque"}
          </h2>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
            <Ticket className="h-12 w-12 text-muted-foreground opacity-20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Nenhum evento encontrado
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Tenta pesquisar com outras palavras-chave."
                : "Ainda não existem eventos publicados na plataforma."}
            </p>
            {searchQuery && (
              <Link href="/">
                <Button variant="outline" className="mt-6">
                  Limpar pesquisa
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.id} href={`/${event.slug}`} className="group">
                <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
                  {/* Capa do Evento (Agora dinâmica!) */}
                  <div className="h-40 bg-muted relative flex items-center justify-center overflow-hidden">
                    {event.coverImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={event.coverImageUrl}
                        alt={event.title}
                        className="object-cover w-full h-full z-0 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm z-10">
                        Sem capa
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-0" />
                    <Badge
                      className="absolute top-3 right-3 z-10 shadow-sm"
                      variant="secondary"
                    >
                      {event.format === "IN_PERSON"
                        ? "Presencial"
                        : event.format === "ONLINE"
                          ? "Online"
                          : "Híbrido"}
                    </Badge>
                  </div>

                  <CardHeader className="flex-1 pb-3 z-10 bg-card">
                    <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="flex flex-col gap-2 pt-2">
                      <div className="flex items-center gap-2 text-foreground/80 font-medium">
                        <Calendar className="h-4 w-4 text-primary" />
                        {format(
                          new Date(event.startDate),
                          "dd 'de' MMM, yyyy",
                          { locale: ptBR },
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {event.format === "ONLINE" ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        <span className="line-clamp-1">
                          {event.format === "ONLINE"
                            ? "Evento Online"
                            : (event.locationDetails as { address?: string })
                                ?.address || "Local a definir"}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="pt-0 pb-4 z-10 bg-card">
                    <div className="flex items-center text-sm font-semibold text-primary w-full justify-between">
                      Ver detalhes
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* 4. FOOTER PÚBLICO */}
      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-bold text-foreground text-lg">
            <Ticket className="h-5 w-5 text-primary" />
            Zev3nt
          </div>
          <p>
            &copy; {new Date().getFullYear()} Zev3nt. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
