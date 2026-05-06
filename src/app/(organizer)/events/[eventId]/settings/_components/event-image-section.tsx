"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type EventSchema } from "@/schemas/event";

export function EventImageSection() {
  // Adicionamos o 'setValue' para atualizar o campo automaticamente
  const { control, watch, setValue } = useFormContext<EventSchema>();
  const watchImageUrl = watch("imageUrl");

  useEffect(() => {
    if (watchImageUrl) {
      // Regex para capturar o ID do Google Drive
      const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
      const match = watchImageUrl.match(driveRegex);

      if (match && match[1]) {
        const fileId = match[1];
        // Geramos o link direto oficial em HTTPS
        const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

        // Só atualizamos se o link atual for diferente do link direto para evitar loops
        if (watchImageUrl !== directUrl) {
          setValue("imageUrl", directUrl, {
            shouldValidate: true,
            shouldDirty: true,
          });
          toast.success("Link do Google Drive convertido para link direto!");
        }
      }
    }
  }, [watchImageUrl, setValue]);

  return (
    <Card shadow-sm className="h-full">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ImageIcon className="h-4 w-4" /> Capa do Evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Cole o link do Google Drive aqui..."
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Links do Google Drive são convertidos automaticamente para
                exibição.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="aspect-video rounded-xl border-2 border-dashed bg-muted overflow-hidden flex items-center justify-center mt-4">
          {watchImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={watchImageUrl}
              className="w-full h-full object-cover"
              alt="Preview da Capa"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "";
                // O toast de erro só aparece se o link final não carregar
                if (watchImageUrl.includes("drive.google.com")) {
                  toast.error(
                    "Erro ao carregar imagem. Verifique as permissões de compartilhamento no Drive.",
                  );
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
              <ImageIcon className="h-8 w-8 opacity-20" />
              <p className="text-xs italic">Aguardando URL da imagem...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
