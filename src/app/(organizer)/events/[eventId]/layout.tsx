import { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EventNav } from "./event-nav";

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

      {/* Menu de Abas (Sub-navegação) dinâmico e corrigido */}
      <EventNav eventId={eventId} />

      {/* O conteúdo do separador atual (ex: o page.tsx) será injetado aqui */}
      <div className="py-4">{children}</div>
    </div>
  );
}
