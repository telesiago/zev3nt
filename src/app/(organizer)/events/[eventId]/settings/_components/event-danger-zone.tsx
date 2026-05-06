"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteEvent } from "@/app/actions/event-actions";
import { AlertTriangle, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EventDangerZoneProps {
  eventId: string;
}

export function EventDangerZone({ eventId }: EventDangerZoneProps) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    const confirmed = confirm(
      "TEM A CERTEZA? Esta ação é irreversível e apagará todos os bilhetes e dados de participantes associados.",
    );

    if (!confirmed) return;

    startDeleteTransition(async () => {
      try {
        await deleteEvent(eventId);
        toast.success("Evento apagado definitivamente.");
        router.push("/events");
      } catch (error) {
        console.error(error);
        toast.error(
          "Erro ao apagar o evento. Verifica se existem vendas pendentes.",
        );
      }
    });
  }

  return (
    <Card className="border-destructive/20 bg-destructive/5 mt-12">
      <CardHeader>
        <CardTitle className="text-lg text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Zona de Perigo
        </CardTitle>
        <CardDescription>
          Ações irreversíveis que podem afetar permanentemente o teu evento.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 border-t border-destructive/10">
        <div className="space-y-1">
          <p className="font-bold text-sm">Apagar este evento</p>
          <p className="text-xs text-muted-foreground">
            Uma vez apagado, não há volta atrás. Todos os bilhetes vendidos e
            dados de check-in serão perdidos.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="gap-2 w-full md:w-auto"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "A apagar..." : "Apagar Evento Definitivamente"}
        </Button>
      </CardContent>
    </Card>
  );
}
