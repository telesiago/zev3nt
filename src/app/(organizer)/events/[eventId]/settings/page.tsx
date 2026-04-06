import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SettingsForm } from "./settings-form";
import { EditEventForm } from "./edit-event-form";

export default async function EventSettingsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  // Vamos buscar os dados do evento à base de dados
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight">
          Configurações do Evento
        </h2>
        <p className="text-muted-foreground text-sm">
          Gere o estado, a imagem de capa e outras opções perigosas.
        </p>
      </div>

      {/* Formulário de Edição dos Dados Básicos */}
      <EditEventForm event={event} />

      {/* Passamos o evento para o Client Component onde a interatividade acontece */}
      <SettingsForm event={event} />
    </div>
  );
}
