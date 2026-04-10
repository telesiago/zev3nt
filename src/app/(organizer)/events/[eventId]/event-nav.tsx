"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  QrCode,
  ExternalLink,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EventNavProps {
  eventId: string;
  eventSlug: string;
}

export function EventNav({ eventId, eventSlug }: EventNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Visão Geral",
      href: `/events/${eventId}`,
      icon: LayoutDashboard,
      isActive: pathname === `/events/${eventId}`,
    },
    {
      name: "Lotes",
      href: `/events/${eventId}/tickets`,
      icon: Ticket,
      isActive: pathname.includes(`/events/${eventId}/tickets`),
    },
    {
      name: "Cupons",
      href: `/events/${eventId}/coupons`,
      icon: Tag,
      isActive: pathname.includes(`/events/${eventId}/coupons`),
    },
    {
      name: "Participantes",
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
      name: "Ajustes",
      href: `/events/${eventId}/settings`,
      icon: Settings,
      isActive: pathname.includes(`/events/${eventId}/settings`),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 mb-6 gap-4">
      <nav className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all",
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

      <Button
        variant="outline"
        size="sm"
        asChild
        className="whitespace-nowrap shrink-0 border-primary/20 hover:bg-primary/5"
      >
        <Link
          href={`/${eventSlug}`}
          target="_blank"
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Ver Página Pública
        </Link>
      </Button>
    </div>
  );
}
