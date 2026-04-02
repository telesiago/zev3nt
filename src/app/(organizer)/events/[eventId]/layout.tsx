import { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default async function EventLayout({
  children,
  params,
}: {
  children: ReactNode;
  // 1. Atualizamos a tipagem para Promise (Obrigatório no Next.js 15+)
  params: Promise<{ eventId: string }>;
}) {
  // 2. Desempacotamos o params usando await antes de aceder ao eventId
  const { eventId } = await params;

  // 3. Agora usamos a variável eventId já devidamente extraída
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { title: true, status: true },
  });

  // Se o utilizador tentar aceder a um ID de evento que não existe, mostramos a página 404
  if (!event) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Cabeçalho de Navegação */}
      <div className="flex flex-col gap-4">
        <Link href="/events">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-3 text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Meus Eventos
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        </div>
      </div>

      {/* Menu de Abas (Sub-navegação) */}
      <nav className="flex items-center gap-4 border-b pb-2 overflow-x-auto">
        <Link
          href={`/events/${eventId}`}
          className="flex items-center gap-2 text-sm font-medium text-primary border-b-2 border-primary pb-2 px-1"
        >
          <LayoutDashboard className="h-4 w-4" />
          Visão Geral
        </Link>
        <Link
          href={`/events/${eventId}/tickets`}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary pb-2 px-1 transition-colors"
        >
          <Ticket className="h-4 w-4" />
          Lotes e Bilhetes
        </Link>
        <Link
          href={`/events/${eventId}/attendees`}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary pb-2 px-1 transition-colors"
        >
          <Users className="h-4 w-4" />
          Inscritos
        </Link>
        <Link
          href={`/events/${eventId}/settings`}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary pb-2 px-1 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Configurações
        </Link>
      </nav>

      {/* O conteúdo do separador atual (ex: o page.tsx) será injetado aqui */}
      <div className="py-4">{children}</div>
    </div>
  );
}
