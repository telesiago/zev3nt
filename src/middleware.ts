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
    // 1. Extrair o Host e Protocolo REAIS dos headers da requisição
    const host =
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      "localhost:3000";
    const protocol =
      req.headers.get("x-forwarded-proto") ||
      (process.env.NODE_ENV === "development" ? "http" : "https");

    // 2. Montar a URL absoluta de onde o utilizador está neste momento (com o IP real)
    const currentAbsoluteUrl = `${protocol}://${host}${req.nextUrl.pathname}${req.nextUrl.search}`;

    // 3. Montar a URL para a página de login também usando o IP real
    const signInUrl = new URL(`/api/auth/signin`, `${protocol}://${host}`);

    // 4. Passar o callbackUrl apontando de volta para a URL absoluta construída
    signInUrl.searchParams.set("callbackUrl", currentAbsoluteUrl);

    return Response.redirect(signInUrl);
  }
});

// Configuração de quais rotas o Middleware deve intercetar (Ignora ficheiros estáticos e imagens)
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
