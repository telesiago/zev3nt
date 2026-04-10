import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z
    .string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres"),
  date: z.string().min(1, "A data é obrigatória"),
  location: z.string().min(3, "O local é obrigatório"),
  locationUrl: z
    .string()
    .url("Insira um link válido do Google Maps")
    .optional()
    .or(z.literal("")),
  category: z.string().min(1, "A categoria é obrigatória"),
  imageUrl: z
    .string()
    .url("A imagem deve ser uma URL válida")
    .optional()
    .or(z.literal("")),
  status: z
    .enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"])
    .default("DRAFT"),
});

export type EventSchema = z.infer<typeof eventSchema>;

export const updateEventSchema = eventSchema.partial();
