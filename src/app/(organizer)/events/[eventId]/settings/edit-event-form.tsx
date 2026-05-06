"use client";

import { useTransition } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEvent } from "@/app/actions/event-actions";
import { eventSchema, EventSchema } from "@/schemas/event";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { EventStatusSection } from "./_components/event-status-section";
import { EventInfoSection } from "./_components/event-info-section";
import { EventLocationSection } from "./_components/event-location-section";
import { EventImageSection } from "./_components/event-image-section";
import { EventDangerZone } from "./_components/event-danger-zone";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EditEventForm({ event }: { event: any }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<EventSchema>({
    resolver: zodResolver(eventSchema) as unknown as Resolver<EventSchema>,
    defaultValues: {
      title: event.title || "",
      description: event.description || "",
      category: event.category || "",
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : "",
      location: event.location || "",
      locationUrl: event.locationUrl || "",
      imageUrl: event.imageUrl || "",
      status: event.status || "DRAFT",
    },
  });

  function onSubmit(values: EventSchema) {
    startTransition(async () => {
      try {
        await updateEvent(event.id, values);
        toast.success("Evento atualizado com sucesso!");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Erro ao atualizar o evento.");
      }
    });
  }

  return (
    <div className="space-y-8 pb-20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <EventStatusSection />
          <EventInfoSection />

          <div className="grid gap-6 md:grid-cols-2">
            <EventLocationSection />
            <EventImageSection />
          </div>

          <div className="flex justify-end sticky bottom-6 z-10">
            <Button
              type="submit"
              disabled={isPending}
              className="shadow-lg gap-2"
            >
              <Save className="h-4 w-4" />
              {isPending ? "A guardar..." : "Guardar Alterações"}
            </Button>
          </div>
        </form>
      </Form>

      <EventDangerZone eventId={event.id} />
    </div>
  );
}
