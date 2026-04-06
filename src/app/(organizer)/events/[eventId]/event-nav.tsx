"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Ticket, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function EventNav({ eventId }: { eventId: string }) {
  const pathname = usePathname();

  // Definimos as nossas abas e a lógica para saber se estão ativas
  const navItems = [
    {
      name: "Visão Geral",
      href: `/events/${eventId}`,
      icon: LayoutDashboard,
      // Fica ativo apenas se o URL terminar exatamente no ID do evento
      isActive: pathname === `/events/${eventId}`,
    },
    {
      name: "Lotes e Bilhetes",
      href: `/events/${eventId}/tickets`,
      icon: Ticket,
      isActive: pathname.includes(`/events/${eventId}/tickets`),
    },
    {
      name: "Inscritos",
      href: `/events/${eventId}/attendees`,
      icon: Users,
      isActive: pathname.includes(`/events/${eventId}/attendees`),
    },
    {
      name: "Configurações",
      href: `/events/${eventId}/settings`,
      icon: Settings,
      isActive: pathname.includes(`/events/${eventId}/settings`),
    },
  ];

  return (
    <nav className="flex items-center gap-4 border-b pb-2 overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 text-sm font-medium pb-2 px-1 transition-colors whitespace-nowrap",
              item.isActive
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-primary border-b-2 border-transparent",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
