"use client";

import { useFormContext } from "react-hook-form";
import { EventSchema } from "@/schemas/event";
import { Eye } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
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

export function EventStatusSection() {
  const { control, watch } = useFormContext<EventSchema>();
  const watchStatus = watch("status");

  return (
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
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem className="max-w-xs">
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white dark:bg-zinc-950">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DRAFT">Rascunho (Privado)</SelectItem>
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
  );
}
