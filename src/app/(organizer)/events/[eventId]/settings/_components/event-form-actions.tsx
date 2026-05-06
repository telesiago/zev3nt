// src/app/(organizer)/events/[eventId]/settings/_components/event-form-actions.tsx

"use client";

import { useFormContext } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

import { EventSchema } from "@/schemas/event";

export default function EventFormActions({
  isPending,
}: {
  isPending: boolean;
}) {
  const { control, handleSubmit } = useFormContext<EventSchema>();

  const handleSaveEvent = async () => {
    // Lógica para salvar o evento
    console.log("Evento salvo!");
  };

  return (
    <Card shadow-sm>
      <CardHeader>
        <CardTitle className="text-lg">Ações do Formulário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            onClick={() => handleSubmit(handleSaveEvent)}
            disabled={isPending}
          >
            Salvar Evento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
