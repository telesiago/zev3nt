"use client";

import { useState, useTransition } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  updateTicketTier,
  deleteTicketTier,
} from "@/app/actions/ticket-actions";
import { ticketSchema } from "@/schemas/ticket";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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

// Definimos o tipo exato dos dados do lote para evitar o uso de "any"
type TicketTierData = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  capacity: number;
  startSalesAt: Date;
  endSalesAt: Date;
};

const formatLocalDatetime = (date: Date | string | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const userTimezoneOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - userTimezoneOffset).toISOString().slice(0, 16);
};

export function TicketActionsMenu({
  eventId,
  tier,
}: {
  eventId: string;
  tier: TicketTierData;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Formulário pré-preenchido com os dados do lote atual
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(
      ticketSchema,
    ) as unknown as Resolver<TicketFormValues>,
    defaultValues: {
      name: tier.name,
      description: tier.description || "",
      price: tier.priceCents / 100, // Converte cêntimos para reais (ex: 5000 -> 50)
      capacity: tier.capacity,
      startSalesAt: new Date(tier.startSalesAt),
      endSalesAt: new Date(tier.endSalesAt),
    },
  });

  function onEditSubmit(values: TicketFormValues) {
    startTransition(() => {
      updateTicketTier(tier.id, eventId, values)
        .then(() => {
          setIsEditDialogOpen(false);
          alert("Lote atualizado com sucesso!");
        })
        .catch((error) => {
          alert(error.message || "Erro ao atualizar lote.");
        });
    });
  }

  function handleDelete() {
    if (confirm(`Tens certeza que queres apagar o lote "${tier.name}"?`)) {
      startTransition(() => {
        deleteTicketTier(tier.id, eventId).catch((error) => {
          alert(error.message || "Não foi possível apagar o lote.");
        });
      });
    }
  }

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar Lote
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Apagar Lote
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Lote: {tier.name}</DialogTitle>
            <DialogDescription>
              Altera o preço, a capacidade ou as datas de venda.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Lote</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade Total</FormLabel>
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
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "A guardar..." : "Guardar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
