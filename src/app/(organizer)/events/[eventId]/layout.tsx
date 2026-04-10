import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { EventNav } from "./event-nav";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const session = await auth();

  // 1. Verificamos a autenticação
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 2. Buscamos o evento para garantir que pertence ao organizador e obter o slug
  // É aqui que resolvemos o erro do 'undefined': buscamos o slug real
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
      organizerId: session.user.id,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  // Se o evento não existir ou não for deste organizador, paramos aqui
  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Passamos o eventId e o eventSlug para a navegação. 
        Agora o botão "Ver Página Pública" terá o link correto (ex: /conferencia-tech-2026) 
      */}
      <EventNav eventId={event.id} eventSlug={event.slug} />

      <div className="animate-in fade-in duration-500">{children}</div>
    </div>
  );
}
