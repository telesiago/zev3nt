import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Plus, Tag, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Importamos o modal e o novo menu de ações
import { CouponModal } from "./coupon-modal";
import { CouponActionsMenu } from "./coupon-actions-menu";

interface CouponsPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventCouponsPage({ params }: CouponsPageProps) {
  const { eventId } = await params;
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const event = await prisma.event.findUnique({
    where: { id: eventId, organizerId: session.user.id },
    include: {
      coupons: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!event) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Cupons de Desconto
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie códigos promocionais para aumentar as vendas de{" "}
            {event.title}.
          </p>
        </div>

        <CouponModal eventId={eventId}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Cupom
          </Button>
        </CouponModal>
      </div>

      {event.coupons.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-primary/10 rounded-full mb-4">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Nenhum cupom ativo</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-6">
              Crie o seu primeiro cupom para oferecer descontos fixos ou
              percentuais aos seus clientes.
            </p>
            <CouponModal eventId={eventId}>
              <Button variant="outline">Criar primeiro cupom</Button>
            </CouponModal>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {event.coupons.map((coupon) => (
            <Card
              key={coupon.id}
              className="overflow-hidden border-primary/10 flex flex-col"
            >
              <CardHeader className="pb-3 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <code className="text-lg font-black tracking-wider text-primary">
                      {coupon.code}
                    </code>
                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                      {coupon.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  {/* Menu de ações do cupom (Editar, Apagar, Ativar/Desativar) */}
                  <CouponActionsMenu eventId={eventId} coupon={coupon} />
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Desconto
                  </span>
                  <span className="text-xl font-bold">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}%`
                      : new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(coupon.discountValue)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-[10px] uppercase font-bold text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Usos: {coupon.currentUses} / {coupon.maxUses || "∞"}
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Calendar className="h-3 w-3" />
                    {coupon.expiresAt
                      ? format(new Date(coupon.expiresAt), "dd/MM/yy", {
                          locale: ptBR,
                        })
                      : "Sem expiração"}
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  {((coupon.maxUses && coupon.currentUses >= coupon.maxUses) ||
                    (coupon.expiresAt &&
                      new Date() > new Date(coupon.expiresAt))) && (
                    <p className="text-xs text-destructive text-center font-medium pt-2 border-t border-dashed">
                      Cupom esgotado ou expirado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
