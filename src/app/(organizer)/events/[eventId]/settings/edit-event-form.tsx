"use client";

import { useTransition } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateEvent, deleteEvent } from "@/app/actions/event-actions";
import { eventSchema } from "@/schemas/event";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ImageIcon,
  MapPin,
  Globe,
  Lock,
  Unlock,
  Save,
  AlertTriangle,
  Trash2,
  Eye,
  Map as MapIcon,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Badge } from "@/components/ui/badge";

type EventFormValues = z.infer<typeof eventSchema>;

const formatLocalDatetime = (date: Date | string | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const userTimezoneOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - userTimezoneOffset).toISOString().slice(0, 16);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EditEventForm({ event }: { event: any }) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormValues>,
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

  const watchImageUrl = form.watch("imageUrl");
  const watchStatus = form.watch("status");
  const watchLocationUrl = form.watch("locationUrl");
  const watchLocationName = form.watch("location");

  function onSubmit(values: EventFormValues) {
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

  function handleDelete() {
    const confirmed = confirm(
      "TEM A CERTEZA? Esta ação é irreversível e apagará todos os bilhetes e dados de participantes associados.",
    );

    if (!confirmed) return;

    startDeleteTransition(async () => {
      try {
        await deleteEvent(event.id);
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
    <div className="space-y-8 pb-20">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Seção 1: Status e Visibilidade (Destaque) */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  Visibilidade e Status
                </CardTitle>
                <CardDescription>
                  Define se o teu evento está pronto para receber vendas.
                </CardDescription>
              </div>
              <Badge
                variant={watchStatus === "PUBLISHED" ? "default" : "secondary"}
                className="h-6"
              >
                {watchStatus === "PUBLISHED" ? "Público" : "Rascunho"}
              </Badge>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-zinc-950">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">
                          Rascunho (Privado)
                        </SelectItem>
                        <SelectItem value="PUBLISHED">
                          Publicado (Vendas Ativas)
                        </SelectItem>
                        <SelectItem value="CANCELLED">Cancelado</SelectItem>
                        <SelectItem value="COMPLETED">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Eventos em rascunho só podem ser vistos por ti.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Seção 2: Informações Gerais */}
          <Card shadow-sm>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none h-32" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Seção 3: Localização e Imagem */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card shadow-sm>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço / Nome do Local</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="locationUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Google Maps</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://maps.app.goo.gl/..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preview Visual do Mapa */}
                <div className="rounded-xl border-2 border-dashed bg-muted/30 p-4 flex flex-col items-center justify-center gap-3 min-h-[140px] text-center">
                  {watchLocationUrl ? (
                    <>
                      <div className="p-3 bg-primary/10 rounded-full">
                        <MapIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold truncate max-w-[200px]">
                          {watchLocationName || "Localização s/ nome"}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                          {watchLocationUrl}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-8 gap-2"
                      >
                        <a
                          href={watchLocationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Testar Link
                        </a>
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                      <MapPin className="h-8 w-8 opacity-20" />
                      <p className="text-xs italic">
                        Insira um link para validar o mapa
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card shadow-sm>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Capa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Imagem</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="aspect-video rounded-xl border-2 border-dashed bg-muted overflow-hidden flex items-center justify-center">
                  {watchImageUrl ? (
                    <img
                      src={watchImageUrl}
                      className="w-full h-full object-cover"
                      alt="Preview Capa"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                        toast.error("Erro ao carregar preview da imagem.");
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                      <ImageIcon className="h-8 w-8 opacity-20" />
                      <p className="text-xs italic">Aguardando URL da imagem</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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

      {/* ZONA DE PERIGO */}
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
    </div>
  );
}
