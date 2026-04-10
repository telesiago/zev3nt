import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { EditEventForm } from "./edit-event-form";

interface SettingsPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventSettingsPage({ params }: SettingsPageProps) {
  const { eventId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Buscamos os dados completos do evento
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
      organizerId: session.user.id,
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Configurações do Evento
        </h1>
        <p className="text-muted-foreground">
          Edite os detalhes, visibilidade e localização do seu evento.
        </p>
      </div>

      {/* Unificamos tudo aqui: removemos o 'SettingsForm' duplicado 
        e deixamos apenas o EditEventForm que agora é completo.
      */}
      <EditEventForm event={event} />
    </div>
  );
}
