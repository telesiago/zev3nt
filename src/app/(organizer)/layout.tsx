import { ReactNode } from "react";
import { auth } from "@/auth";
import { OrganizerSidebar, TopHeader } from "./organizer-navigation";

// O layout é um Server Component e mantém a performance perfeita da aplicação
export default async function OrganizerLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Vamos buscar a tua sessão
  const session = await auth();
  const userName = session?.user?.name || "Organizador";

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* O Sidebar inteligente fica à esquerda */}
      <OrganizerSidebar />

      <div className="flex flex-col bg-muted/10">
        {/* O Header recebe o teu nome e inicializa o Avatar */}
        <TopHeader userName={userName} />

        {/* O conteúdo da página */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
