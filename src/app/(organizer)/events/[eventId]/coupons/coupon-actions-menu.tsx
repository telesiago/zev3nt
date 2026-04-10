"use client";

import { useTransition } from "react";
import { Coupon } from "@prisma/client";
import { MoreHorizontal, Edit, Trash, Power } from "lucide-react";
import { deleteCoupon, toggleCouponStatus } from "@/app/actions/coupon-actions";
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
import { CouponModal } from "./coupon-modal";

interface CouponActionsMenuProps {
  eventId: string;
  coupon: Coupon;
}

export function CouponActionsMenu({ eventId, coupon }: CouponActionsMenuProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        "Tem a certeza que deseja apagar este cupom? Esta ação é irreversível.",
      )
    )
      return;

    startTransition(async () => {
      try {
        await deleteCoupon(coupon.id);
        toast.success("Cupom apagado com sucesso.");
      } catch (error) {
        console.error(error);
        toast.error("Erro ao apagar o cupom.");
      }
    });
  };

  const handleToggleStatus = () => {
    startTransition(async () => {
      try {
        await toggleCouponStatus(coupon.id, !coupon.isActive);
        toast.success(
          `Cupom ${!coupon.isActive ? "ativado" : "desativado"} com sucesso.`,
        );
      } catch (error) {
        console.error(error);
        toast.error("Erro ao alterar o estado do cupom.");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <CouponModal eventId={eventId} coupon={coupon}>
        <Button variant="ghost" size="sm" className="gap-2 h-8 hidden sm:flex">
          <Edit className="h-4 w-4" />
          Editar
        </Button>
      </CouponModal>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Opções</DropdownMenuLabel>
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            disabled={isPending}
            onClick={handleToggleStatus}
          >
            <Power className="h-4 w-4" />
            {coupon.isActive ? "Desativar Cupom" : "Ativar Cupom"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive gap-2 focus:text-destructive cursor-pointer"
            disabled={isPending}
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
            Apagar Cupom
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
