"use client";

import { useTransition } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createEvent } from "@/app/actions/event-actions";
import { eventSchema } from "@/schemas/event";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

// 1. Criamos um tipo forte e estrito a partir do nosso Zod Schema atualizado
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
  const router = useRouter();

  // 2. Inicializamos o form usando o tipo que criámos com os campos NOVOS
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormValues>,
    defaultValues: {
      title: "",
      description: "",
      category: "",
      date: "",
      location: "",
      locationUrl: "",
      imageUrl: "",
      status: "DRAFT", // Por defeito criamos como rascunho
    },
  });

  // A função onSubmit agora trata dos novos campos e limpa strings vazias
  function onSubmit(values: EventFormValues) {
    startTransition(() => {
      const cleanedValues = {
        ...values,
        locationUrl: values.locationUrl === "" ? undefined : values.locationUrl,
        imageUrl: values.imageUrl === "" ? undefined : values.imageUrl,
      };

      // Tenta criar o evento; se a promessa resolver, assumimos sucesso.
      createEvent(cleanedValues)
        .then(() => {
          toast.success("Evento criado com sucesso!");
          router.push(`/events`);
          router.refresh();
        })
        .catch((error) => {
          console.error(error);
          toast.error("Ocorreu um erro ao criar o evento. Verifica a consola.");
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Inicial</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">
                            Rascunho (Privado)
                          </SelectItem>
                          <SelectItem value="PUBLISHED">Publicado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Tecnologia, Música, Workshop"
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
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data e Hora</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={formatLocalDatetime(field.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização (Nome ou Morada)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Av. Paulista, 1000 ou Online"
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
                  name="locationUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link do Google Maps (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://maps.app.goo.gl/..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Ajuda os teus participantes a chegarem ao evento.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagem de Capa (URL Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://exemplo.com/imagem.jpg"
                          {...field}
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
                  {isPending ? "A criar..." : "Criar Evento"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
