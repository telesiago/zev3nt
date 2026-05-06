"use client";
import { useFormContext } from "react-hook-form";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type EventSchema } from "@/schemas/event";

// Função que converte link do Drive em link direto de imagem
function getDirectImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return url;
}

export function EventImageSection() {
  const { control, watch } = useFormContext<EventSchema>();
  const watchImageUrl = watch("imageUrl");
  const previewUrl = getDirectImageUrl(watchImageUrl);

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
                  placeholder="[https://drive.google.com/file/d/](https://drive.google.com/file/d/)..."
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="aspect-video rounded-xl border-2 border-dashed bg-muted overflow-hidden flex items-center justify-center mt-4">
          {previewUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={previewUrl}
              className="w-full h-full object-cover"
              alt="Preview da Capa"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "";
                toast.error(
                  "Não foi possível carregar o preview. Verifique se a imagem é pública ou um link válido.",
                );
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
