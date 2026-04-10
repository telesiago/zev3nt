"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DiscountType } from "@prisma/client";

/**
 * Cria um novo cupom para o evento
 */
export async function createCoupon(
  eventId: string,
  data: {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    maxUses?: number;
    expiresAt?: string;
  },
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  const event = await prisma.event.findUnique({
    where: { id: eventId, organizerId: session.user.id },
  });

  if (!event) throw new Error("Evento não encontrado");

  const formattedCode = data.code.toUpperCase().trim();

  await prisma.coupon.create({
    data: {
      eventId,
      code: formattedCode,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUses: data.maxUses || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: true,
    },
  });

  revalidatePath(`/events/${eventId}/coupons`);
}

/**
 * Atualiza um cupom existente
 */
export async function updateCoupon(
  couponId: string,
  data: {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    maxUses?: number;
    expiresAt?: string;
  },
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
    include: { event: true },
  });

  if (!coupon || coupon.event.organizerId !== session.user.id) {
    throw new Error("Permissão negada");
  }

  const formattedCode = data.code.toUpperCase().trim();

  await prisma.coupon.update({
    where: { id: couponId },
    data: {
      code: formattedCode,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUses: data.maxUses || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  revalidatePath(`/events/${coupon.eventId}/coupons`);
}

/**
 * Altera o estado (ativo/inativo) de um cupom
 */
export async function toggleCouponStatus(couponId: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
    include: { event: true },
  });

  if (!coupon || coupon.event.organizerId !== session.user.id) {
    throw new Error("Permissão negada");
  }

  await prisma.coupon.update({
    where: { id: couponId },
    data: { isActive },
  });

  revalidatePath(`/events/${coupon.eventId}/coupons`);
}

/**
 * Apaga um cupom
 */
export async function deleteCoupon(couponId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autorizado");

  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
    include: { event: true },
  });

  if (!coupon || coupon.event.organizerId !== session.user.id) {
    throw new Error("Permissão negada");
  }

  await prisma.coupon.delete({
    where: { id: couponId },
  });

  revalidatePath(`/events/${coupon.eventId}/coupons`);
}

/**
 * Validação do Cupom (Usada no Checkout Público)
 */
export async function validateCoupon(eventId: string, code: string) {
  const coupon = await prisma.coupon.findUnique({
    where: {
      eventId_code: { eventId, code: code.toUpperCase().trim() },
    },
  });

  if (!coupon || !coupon.isActive) {
    return { error: "Cupom inválido." };
  }

  // Verificar validade por data
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return { error: "Cupom expirado." };
  }

  // Verificar limite de usos
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
    return { error: "Limite de usos atingido." };
  }

  return {
    success: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
  };
}
