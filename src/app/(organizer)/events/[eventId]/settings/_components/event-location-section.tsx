"use client";

import { useFormContext } from "react-hook-form";
import { EventSchema } from "@/schemas/event";
import { MapPin, Map as MapIcon, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EventLocationSection() {
  const { control, watch } = useFormContext<EventSchema>();
  const watchLocationUrl = watch("locationUrl");
  const watchLocationName = watch("location");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Localização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
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
          control={control}
          name="locationUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Google Maps</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://maps.app.goo.gl/..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <Button variant="outline" size="sm" asChild className="h-8 gap-2">
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
  );
}
