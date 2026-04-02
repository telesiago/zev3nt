import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Inicializa o NextAuth no Middleware apenas com as configurações Edge-compatible
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // O utilizador está logado se tivermos o objeto req.auth
  const isLoggedIn = !!req.auth;

  // Verificar se a rota a que o utilizador quer aceder pertence à área do organizador
  const isOrganizerRoute =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/events");

  // Se for uma rota protegida e NÃO estiver logado, redirecionar para a página de login
  if (isOrganizerRoute && !isLoggedIn) {
    return Response.redirect(new URL("/api/auth/signin", req.nextUrl));
  }
});

// Configuração de quais rotas o Middleware deve intercetar (Ignora ficheiros estáticos e imagens)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
