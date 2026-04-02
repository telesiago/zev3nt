import { z } from "zod";

export const eventSchema = z.object({
  title: z
    .string()
    .min(3, { message: "O título deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  format: z.enum(["IN_PERSON", "ONLINE", "HYBRID"], {
    message: "Selecione o formato do evento.",
  }),
  startDate: z.coerce.date({
    message: "Data de início obrigatória ou inválida.",
  }),
  endDate: z.coerce.date({ message: "Data de fim obrigatória ou inválida." }),
  location: z.string().optional(),
});
