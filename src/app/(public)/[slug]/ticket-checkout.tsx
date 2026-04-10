"use client";

import { useState, useTransition } from "react";
import { Check, Tag, X, Loader2 } from "lucide-react";
import { TicketType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCheckoutSession } from "@/app/actions/checkout-actions";
import { validateCoupon } from "@/app/actions/coupon-actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function TicketCheckout({
  eventId,
  tiers,
}: {
  eventId: string;
  tiers: TicketType[];
}) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [isPending, startTransition] = useTransition();

  // Estados do Cupom
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  } | null>(null);

  if (tiers.length === 0) {
    return (
      <Card className="sticky top-6 shadow-sm border-primary/20">
        <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[300px]">
          <span className="text-lg font-medium text-foreground mb-2">
            Em breve!
          </span>
          Os bilhetes para este evento ainda não estão disponíveis para venda.
        </CardContent>
      </Card>
    );
  }

  const selectedTierObj = tiers.find((t) => t.id === selectedTier);
  const originalPrice = selectedTierObj?.price || 0;

  // Cálculo do desconto ao vivo
  let discountAmount = 0;
  if (appliedCoupon && selectedTierObj) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      discountAmount = originalPrice * (appliedCoupon.discountValue / 100);
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  // Garante que o preço nunca fica negativo
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const result = await validateCoupon(eventId, couponCode);
      if (result.error) {
        setCouponError(result.error);
        setAppliedCoupon(null);
      } else if (result.success && result.coupon) {
        setAppliedCoupon(result.coupon);
        setCouponCode("");
        toast.success("Cupom aplicado com sucesso!");
      }
    } catch (error) {
      setCouponError("Erro ao validar o cupom.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    startTransition(() => {
      createCheckoutSession({
        eventId,
        ticketTierId: selectedTier,
        name,
        email,
        cpf,
        couponCode: appliedCoupon?.code, // Enviamos o código validado para o backend
      })
        .then((response) => {
          if (response && response.url) {
            window.location.href = response.url;
          } else {
            toast.error("Não foi possível gerar o link de pagamento.");
          }
        })
        .catch((error) => {
          console.error(error);
          toast.error(error.message || "Ocorreu um erro ao gerar o pagamento.");
        });
    });
  };

  return (
    <Card className="sticky top-6 shadow-sm border-primary/20">
      <CardHeader>
        <CardTitle>Bilhetes</CardTitle>
        <CardDescription>
          Escolha o seu ingresso e preencha os dados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Lista de Lotes */}
          <div className="space-y-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm transition-all focus:outline-none ${
                  selectedTier === tier.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex flex-1 items-center justify-between">
                  <div className="flex flex-col">
                    <span className="block text-sm font-medium">
                      {tier.name}
                    </span>
                    <span className="mt-1 flex items-center text-sm text-muted-foreground">
                      {tier.price === 0
                        ? "Grátis"
                        : new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(tier.price)}
                    </span>
                  </div>
                  {selectedTier === tier.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 2. Cupom de Desconto (Só mostra se um bilhete pago for selecionado) */}
          {selectedTierObj && selectedTierObj.price > 0 && (
            <div className="pt-4 border-t animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="coupon" className="mb-2 block">
                Tem um cupom de desconto?
              </Label>

              {!appliedCoupon ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="coupon"
                        placeholder="Código do cupom"
                        className="pl-9 uppercase"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        disabled={isApplyingCoupon}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode}
                    >
                      {isApplyingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Aplicar"
                      )}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-destructive">{couponError}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                        {appliedCoupon.code}
                      </p>
                      <p className="text-xs text-green-600/80 dark:text-green-400/80">
                        Desconto de{" "}
                        {appliedCoupon.discountType === "PERCENTAGE"
                          ? `${appliedCoupon.discountValue}%`
                          : `R$ ${appliedCoupon.discountValue}`}{" "}
                        aplicado
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-700 hover:text-green-800 hover:bg-green-200/50"
                    onClick={removeCoupon}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 3. Formulário do Participante */}
          {selectedTier && (
            <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="João Silva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="joao@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF (Obrigatório)</Label>
                <Input
                  id="cpf"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>

              {/* Resumo de Preços */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 mt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {originalPrice.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Desconto ({appliedCoupon?.code})</span>
                    <span>- R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>
                    {finalPrice === 0
                      ? "Grátis"
                      : `R$ ${finalPrice.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-lg"
            disabled={!selectedTier || isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : null}
            {isPending
              ? "A processar..."
              : finalPrice === 0 && selectedTier
                ? "Confirmar Inscrição Grátis"
                : "Ir para Pagamento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
