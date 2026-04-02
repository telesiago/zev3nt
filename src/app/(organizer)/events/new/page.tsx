"use client";

import { useTransition } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createEvent } from "@/app/actions/event-actions";
import { eventSchema } from "@/schemas/event";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 1. Criamos um tipo forte e estrito a partir do nosso Zod Schema
type EventFormValues = z.infer<typeof eventSchema>;

// Helper para formatar a data para o input nativo mantendo o fuso local (Brasil)
const formatLocalDatetime = (date: Date | string | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  // Ajusta o fuso horário subtraindo os minutos de diferença para o UTC
  const userTimezoneOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - userTimezoneOffset).toISOString().slice(0, 16);
};

export default function NewEventPage() {
  const [isPending, startTransition] = useTransition();

  // 2. Inicializamos o form usando o tipo que criámos
  const form = useForm<EventFormValues>({
    // 3. Utilizamos uma asserção segura ('unknown' -> 'Resolver') em vez do perigoso 'any'
    resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormValues>,
    defaultValues: {
      title: "",
      description: "",
      location: "",
    },
  });

  // A função onSubmit agora também usa o nosso tipo limpo
  function onSubmit(values: EventFormValues) {
    startTransition(() => {
      createEvent(values).catch((error) => {
        console.error(error);
        alert("Ocorreu um erro ao criar o evento. Verifica a consola.");
      });
    });
  }

  return (
    <div className="mx-auto max-w-3xl w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Criar Novo Evento</CardTitle>
          <CardDescription>
            Preenche os detalhes básicos. Poderás configurar os bilhetes e lotes
            no próximo passo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Evento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Zev3nt Tech Summit 2026"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o formato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="IN_PERSON">Presencial</SelectItem>
                          <SelectItem value="ONLINE">Online</SelectItem>
                          <SelectItem value="HYBRID">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização (Morada ou Link)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Av. Paulista, 1000 ou Zoom Link"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início</FormLabel>
                      <FormControl>
                        {/* Aplicamos a correção do fuso horário sem usar any */}
                        <Input
                          type="datetime-local"
                          {...field}
                          value={formatLocalDatetime(
                            field.value as Date | undefined,
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fim</FormLabel>
                      <FormControl>
                        {/* Aplicamos a correção do fuso horário sem usar any */}
                        <Input
                          type="datetime-local"
                          {...field}
                          value={formatLocalDatetime(
                            field.value as Date | undefined,
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Conta aos teus participantes o que vai acontecer no evento..."
                        className="resize-none h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Podes escrever um breve resumo ou a agenda do evento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "A guardar..." : "Criar Evento"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
