"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createCoupon, updateCoupon } from "@/app/actions/coupon-actions";
import { toast } from "sonner";
import { DiscountType, Coupon } from "@prisma/client";

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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper para formatar a data que vem do Prisma para o input datetime-local
const formatLocalDatetime = (date: Date | null) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const userTimezoneOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - userTimezoneOffset).toISOString().slice(0, 16);
};

const couponSchema = z
  .object({
    code: z
      .string()
      .min(3, "O código deve ter pelo menos 3 caracteres")
      .regex(/^[A-Za-z0-9]+$/, "Use apenas letras e números, sem espaços"),
    discountType: z.nativeEnum(DiscountType),
    discountValue: z.preprocess(
      (val) => (val === "" ? 0 : Number(val)),
      z.number().min(0.01, "O valor deve ser maior que zero"),
    ),
    maxUses: z.preprocess(
      (val) => (val === "" || val === 0 ? undefined : Number(val)),
      z.number().min(1, "A quantidade mínima é 1").optional(),
    ),
    expiresAt: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.discountType === "PERCENTAGE" && data.discountValue > 100)
        return false;
      return true;
    },
    {
      message: "O desconto percentual não pode exceder 100%",
      path: ["discountValue"],
    },
  );

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponModalProps {
  eventId: string;
  coupon?: Coupon;
  children: React.ReactNode;
}

export function CouponModal({ eventId, coupon, children }: CouponModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEditing = !!coupon;

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(
      couponSchema,
    ) as unknown as Resolver<CouponFormValues>,
    defaultValues: {
      code: coupon?.code || "",
      discountType: coupon?.discountType || "PERCENTAGE",
      discountValue: coupon?.discountValue || 0,
      maxUses: coupon?.maxUses || undefined,
      expiresAt: coupon?.expiresAt ? formatLocalDatetime(coupon.expiresAt) : "",
    },
  });

  // Garante que os dados do formulário são recarregados sempre que o modal abre
  useEffect(() => {
    if (open) {
      form.reset({
        code: coupon?.code || "",
        discountType: coupon?.discountType || "PERCENTAGE",
        discountValue: coupon?.discountValue || 0,
        maxUses: coupon?.maxUses || undefined,
        expiresAt: coupon?.expiresAt
          ? formatLocalDatetime(coupon.expiresAt)
          : "",
      });
    }
  }, [open, coupon, form]);

  const watchDiscountType = form.watch("discountType");

  function onSubmit(values: CouponFormValues) {
    startTransition(async () => {
      try {
        if (isEditing && coupon) {
          await updateCoupon(coupon.id, values);
          toast.success("Cupom atualizado com sucesso!");
        } else {
          await createCoupon(eventId, values);
          toast.success("Cupom criado com sucesso!");
        }
        setOpen(false);
        if (!isEditing) form.reset();
      } catch (error) {
        console.error(error);
        toast.error("Ocorreu um erro. O código já pode estar em uso.");
      }
    });
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("code", e.target.value.toUpperCase());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cupom" : "Criar Novo Cupom"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique os detalhes deste código promocional."
              : "Crie um código promocional para oferecer descontos aos participantes."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código do Cupom</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: VIP2026"
                      {...field}
                      onChange={handleCodeChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Desconto</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">
                          Porcentagem (%)
                        </SelectItem>
                        <SelectItem value="FIXED">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Valor{" "}
                      {watchDiscountType === "PERCENTAGE" ? "(%)" : "(R$)"}
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxUses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Usos (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ilimitado"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validade (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
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
                    ? "Guardar Alterações"
                    : "Criar Cupom"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
