import type { NextAuthConfig } from "next-auth";

// Configuração separada apenas com regras Edge-compatible (sem Prisma ou bcrypt)
export const authConfig = {
  // O bloco 'pages' foi removido para usarmos a página de login gerada automaticamente pelo NextAuth
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  providers: [], // Os providers reais ficam no auth.ts para não quebrar o Edge
} satisfies NextAuthConfig;
