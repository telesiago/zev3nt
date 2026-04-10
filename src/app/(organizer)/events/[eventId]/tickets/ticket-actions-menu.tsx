"use client";

import { useTransition } from "react";
import { TicketType } from "@prisma/client";
import { MoreHorizontal, Edit, Trash, Copy } from "lucide-react";
// Corrigido: Importando os nomes corretos definidos na Fase 1
import { deleteTicketType } from "@/app/actions/ticket-actions";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TicketModal } from "./ticket-modal";

interface TicketActionsMenuProps {
  eventId: string;
  ticket: TicketType;
}

export function TicketActionsMenu({ eventId, ticket }: TicketActionsMenuProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirmed = confirm(
      "Tens a certeza que desejas apagar este lote? Esta ação não pode ser desfeita.",
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteTicketType(ticket.id);
        toast.success("Lote apagado com sucesso.");
      } catch (error) {
        console.error(error);
        toast.error(
          "Não foi possível apagar o lote. Verifica se já existem vendas associadas.",
        );
      }
    });
  };

  const copyId = () => {
    // Fallback para cópia em ambientes onde o navigator.clipboard pode estar restrito
    const el = document.createElement("textarea");
    el.value = ticket.id;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    toast.success("ID do lote copiado.");
  };

  return (
    <div className="flex items-center gap-2">
      {/* O TicketModal já utiliza a ação 'updateTicketType' internamente */}
      <TicketModal eventId={eventId} ticket={ticket}>
        <Button variant="ghost" size="sm" className="gap-2 h-8">
          <Edit className="h-4 w-4" />
          <span className="hidden sm:inline">Editar</span>
        </Button>
      </TicketModal>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Opções</DropdownMenuLabel>
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={copyId}>
            <Copy className="h-4 w-4" />
            Copiar ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive gap-2 focus:text-destructive cursor-pointer"
            disabled={isPending}
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
            Apagar Lote
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
