"use client";

import { useState, useTransition } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import { createTicketTier } from "@/app/actions/ticket-actions";
import { ticketSchema } from "@/schemas/ticket";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type TicketFormValues = z.infer<typeof ticketSchema>;

// Helper de Fuso Horário que já dominas
const formatLocalDatetime = (date: Date | string | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const userTimezoneOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - userTimezoneOffset).toISOString().slice(0, 16);
};

export function TicketModal({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(
      ticketSchema,
    ) as unknown as Resolver<TicketFormValues>,
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      capacity: 100,
    },
  });

  function onSubmit(values: TicketFormValues) {
    startTransition(() => {
      createTicketTier(eventId, values)
        .then(() => {
          setOpen(false); // Fecha o modal com sucesso
          form.reset(); // Limpa o formulário
        })
        .catch((error) => {
          console.error(error);
          alert("Erro ao criar o lote.");
        });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Lote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Lote de Bilhetes</DialogTitle>
          <DialogDescription>
            Configura o preço, a capacidade e quando as vendas começam.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Lote</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 1º Lote - VIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Coloca 0 para grátis</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startSalesAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início das Vendas</FormLabel>
                    <FormControl>
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
                name="endSalesAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fim das Vendas</FormLabel>
                    <FormControl>
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "A guardar..." : "Guardar Lote"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
