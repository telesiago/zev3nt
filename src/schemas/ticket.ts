import { z } from "zod";

export const ticketSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome do lote deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  // O utilizador digita em Reais (ex: 50.50), o backend converte para cêntimos
  price: z.coerce
    .number()
    .min(0, { message: "O preço não pode ser negativo." }),
  capacity: z.coerce
    .number()
    .min(1, { message: "A capacidade deve ser de pelo menos 1 bilhete." }),
  startSalesAt: z.coerce.date({
    message: "Data de início obrigatória ou inválida.",
  }),
  endSalesAt: z.coerce.date({
    message: "Data de fim obrigatória ou inválida.",
  }),
});
