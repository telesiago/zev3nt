"use client";

import { useState, useTransition } from "react";
import {
  toggleEventStatus,
  deleteEvent,
  updateCoverImage,
} from "@/app/actions/event-settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  Trash2,
  Globe,
  Lock,
  AlertTriangle,
} from "lucide-react";
// Nota: Se der erro de tipagem no Prisma Event, podes usar any temporariamente
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SettingsForm({ event }: { event: any }) {
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState(event.coverImageUrl || "");

  const handleToggleStatus = () => {
    startTransition(() => {
      toggleEventStatus(event.id, event.status);
    });
  };

  const handleUpdateImage = () => {
    if (!imageUrl.trim()) return;
    startTransition(() => {
      updateCoverImage(event.id, imageUrl);
      alert("Imagem atualizada com sucesso!");
    });
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Tens certeza absoluta? Esta ação não pode ser desfeita e irá apagar todos os bilhetes e vendas deste evento.",
    );
    if (confirmed) {
      startTransition(() => {
        deleteEvent(event.id);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Visibilidade do Evento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Visibilidade do Evento</CardTitle>
              <CardDescription>
                Controla se o evento é público ou está oculto.
              </CardDescription>
            </div>
            <Badge
              variant={event.status === "PUBLISHED" ? "default" : "secondary"}
              className="text-sm"
            >
              {event.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
            {event.status === "PUBLISHED" ? (
              <Globe className="h-8 w-8 text-primary" />
            ) : (
              <Lock className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="flex-1">
              <h4 className="font-semibold">
                {event.status === "PUBLISHED"
                  ? "O evento está visível para o público."
                  : "O evento está em modo rascunho."}
              </h4>
              <p className="text-sm text-muted-foreground">
                {event.status === "PUBLISHED"
                  ? "Qualquer pessoa pode encontrar e comprar bilhetes na página inicial."
                  : "Apenas tu podes ver este evento. Não está disponível para vendas públicas."}
              </p>
            </div>
            <Button
              variant={event.status === "PUBLISHED" ? "outline" : "default"}
              onClick={handleToggleStatus}
              disabled={isPending}
            >
              {isPending
                ? "Aguarde..."
                : event.status === "PUBLISHED"
                  ? "Reverter para Rascunho"
                  : "Publicar Evento"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Imagem de Capa */}
      <Card>
        <CardHeader>
          <CardTitle>Imagem de Capa</CardTitle>
          <CardDescription>
            Adiciona uma imagem para destacar o teu evento na Vitrine.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.coverImageUrl ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden border bg-muted relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.coverImageUrl}
                alt="Capa do evento"
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="aspect-video w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
              <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
              <p>Nenhuma imagem configurada</p>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Cole aqui o URL/link de uma imagem (ex: Unsplash, Imgur)..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <Button
              onClick={handleUpdateImage}
              disabled={
                isPending ||
                !imageUrl.trim() ||
                imageUrl === event.coverImageUrl
              }
            >
              Salvar Imagem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Zona de Perigo (Excluir) */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações destrutivas que não podem ser revertidas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Excluir este evento</h4>
              <p className="text-sm text-muted-foreground">
                Apaga permanentemente o evento, lotes e relatórios.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Definitivamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
