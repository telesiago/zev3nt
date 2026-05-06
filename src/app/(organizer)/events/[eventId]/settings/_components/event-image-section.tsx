"use client";

import { useFormContext } from "react-hook-form";
import { EventSchema } from "@/schemas/event";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function EventImageSection() {
  const { control, watch } = useFormContext<EventSchema>();
  const watchImageUrl = watch("imageUrl");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ImageIcon className="h-4 w-4" /> Capa
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
  );
}
