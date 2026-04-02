import { ReactNode } from "react";
import Link from "next/link";
import { Ticket } from "lucide-react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Cabeçalho Público Minimalista */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-primary"
          >
            <Ticket className="h-6 w-6" />
            Zev3nt
          </Link>
          <nav className="text-sm font-medium text-muted-foreground">
            {/* Futuramente podemos ter um link para "Meus Ingressos" aqui */}
            Descubra as melhores experiências
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal (Onde vai entrar a página do evento) */}
      <main className="flex-1 bg-muted/10">{children}</main>

      {/* Rodapé Público */}
      <footer className="border-t bg-white py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto max-w-5xl">
          <p>
            &copy; {new Date().getFullYear()} Zev3nt. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
