import { z } from "zod";

export const ticketSchema = z.object({
  name: z
    .string()
    .min(3, { message: "O nome do lote deve ter pelo menos 3 caracteres." }),
  description: z.string().optional().or(z.literal("")),
  // O utilizador digita em Reais (ex: 50.50)
  // Removido o invalid_type_error do .number() para corrigir o erro de tipagem TS
  price: z.coerce
    .number()
    .min(0, { message: "O preço não pode ser negativo." }),
  capacity: z.coerce
    .number()
    .int("A capacidade deve ser um número inteiro.")
    .min(1, { message: "A capacidade deve ser de pelo menos 1 bilhete." }),
  // Nota: Os campos startSalesAt e endSalesAt foram removidos
  // para coincidir com o modelo TicketType atual do Prisma.
});

export type TicketFormValues = z.infer<typeof ticketSchema>;
