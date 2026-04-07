import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true, // Necessário na Vercel para confiar nos cabeçalhos de proxy
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Redirecionamento padrão e altamente seguro para produção
    async redirect({ url, baseUrl }) {
      // Permite redirecionamentos relativos (dentro do próprio site)
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Permite redirecionamentos se a origem for exatamente o nosso domínio
      else if (new URL(url).origin === baseUrl) return url;
      // Em qualquer outro caso suspeito, devolve para a raiz do site
      return baseUrl;
    },
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
