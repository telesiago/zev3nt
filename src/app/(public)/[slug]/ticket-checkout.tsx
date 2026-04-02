"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";

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

type TicketTier = {
  id: string;
  name: string;
  priceCents: number;
  capacity: number;
};

export function TicketCheckout({
  eventId,
  tiers,
}: {
  eventId: string;
  tiers: TicketTier[];
}) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [isPending, startTransition] = useTransition();

  // Se o organizador ainda não criou bilhetes, mostramos um aviso amigável
  if (tiers.length === 0) {
    return (
      <Card className="sticky top-6 shadow-sm">
        <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[300px]">
          <span className="text-lg font-medium text-foreground mb-2">
            Em breve!
          </span>
          Os bilhetes para este evento ainda não estão disponíveis para venda.
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    startTransition(() => {
      // Chama a Server Action passando os dados reais
      createCheckoutSession({
        eventId,
        ticketTierId: selectedTier,
        name,
        email,
        cpf,
      })
        .then((response) => {
          // Redireciona o utilizador para o ecrã de pagamento do Mercado Pago (ou para o sucesso se for grátis)
          if (response.url) {
            window.location.href = response.url;
          }
        })
        .catch((error) => {
          console.error(error);
          alert("Ocorreu um erro ao gerar o pagamento. Verifica a consola.");
        });
    });
  };

  return (
    <Card className="sticky top-6 shadow-sm">
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
                      {tier.priceCents === 0
                        ? "Grátis"
                        : `R$ ${(tier.priceCents / 100).toFixed(2).replace(".", ",")}`}
                    </span>
                  </div>
                  {selectedTier === tier.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 2. Formulário do Participante (Só aparece se escolher um bilhete) */}
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
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedTier || isPending}
          >
            {isPending ? "A preparar checkout..." : "Ir para Pagamento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
