"use client";

import { useState, useTransition } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TicketType } from "@prisma/client";
import {
  createTicketType,
  updateTicketType,
} from "@/app/actions/ticket-actions";
import { ticketSchema, TicketFormValues } from "@/schemas/ticket";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TicketModalProps {
  eventId: string;
  ticket?: TicketType;
  children: React.ReactNode;
}

export function TicketModal({ eventId, ticket, children }: TicketModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEditing = !!ticket;

  const form = useForm<TicketFormValues>({
    // A asserção 'as unknown as Resolver' resolve o conflito de inferência do Zod com o Hook Form
    resolver: zodResolver(
      ticketSchema,
    ) as unknown as Resolver<TicketFormValues>,
    defaultValues: {
      name: ticket?.name || "",
      description: ticket?.description || "",
      price: ticket?.price || 0,
      capacity: ticket?.capacity || 100,
    },
  });

  function onSubmit(values: TicketFormValues) {
    startTransition(async () => {
      try {
        if (isEditing && ticket) {
          await updateTicketType(ticket.id, values);
          toast.success("Lote atualizado com sucesso!");
        } else {
          await createTicketType(eventId, values);
          toast.success("Novo lote criado!");
        }
        setOpen(false);
        form.reset();
      } catch (error) {
        console.error(error);
        toast.error("Ocorreu um erro ao salvar o ingresso.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Lote" : "Criar Novo Lote"}
          </DialogTitle>
          <DialogDescription>
            Configura o nome, preço e capacidade. Os campos de data de venda
            foram removidos para simplificação.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Lote</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Early Bird, VIP, Geral..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="O que este bilhete inclui?"
                      className="resize-none h-20"
                      {...field}
                    />
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
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>0 para grátis.</FormDescription>
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
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormDescription>Total disponível.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? "A guardar..."
                  : isEditing
                    ? "Atualizar Lote"
                    : "Criar Lote"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
