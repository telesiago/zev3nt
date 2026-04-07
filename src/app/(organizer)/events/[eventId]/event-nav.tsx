"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Ticket, Users, Settings, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

export function EventNav({ eventId }: { eventId: string }) {
  const pathname = usePathname();

  // Definimos as nossas abas e a lógica para saber se estão ativas
  const navItems = [
    {
      name: "Visão Geral",
      href: `/events/${eventId}`,
      icon: LayoutDashboard,
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
      name: "Check-in",
      href: `/events/${eventId}/checkin`,
      icon: QrCode,
      isActive: pathname.includes(`/events/${eventId}/checkin`),
    },
    {
      name: "Configurações",
      href: `/events/${eventId}/settings`,
      icon: Settings,
      isActive: pathname.includes(`/events/${eventId}/settings`),
    },
  ];

  return (
    <nav className="flex space-x-2 border-b pb-4 overflow-x-auto mb-6">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
            item.isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
