import { handlers } from "@/auth";

// O NextAuth v5 já exporta os métodos GET e POST automaticamente com base na nossa configuração do src/auth.ts
export const { GET, POST } = handlers;
