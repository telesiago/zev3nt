import { ReactNode } from "react";
import Link from "next/link";
import {
  CalendarDays,
  LayoutDashboard,
  Settings,
  Ticket,
  Menu,
  LogOut,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ---------------------------------------------------------
// COMPONENTE: Sidebar (Menu Lateral) Desktop
// ---------------------------------------------------------
function OrganizerSidebar() {
  return (
    <aside className="hidden border-r bg-muted/40 md:block md:w-64 lg:w-72">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <Ticket className="h-6 w-6 text-primary" />
            <span className="text-xl tracking-tight">Zev3nt</span>
          </Link>
        </div>

        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4" />
              Visão Geral
            </Link>

            <Link
              href="/events"
              className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
            >
              <CalendarDays className="h-4 w-4" />
              Meus Eventos
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Link>
          </nav>
        </div>

        {/* Espaço extra na base do sidebar (ex: banner de upgrade) */}
        <div className="mt-auto p-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-4 text-sm">
            <p className="font-semibold mb-1">Precisa de ajuda?</p>
            <p className="text-muted-foreground mb-3">
              Acesse nossa central de suporte para organizadores.
            </p>
            <Button size="sm" className="w-full">
              Suporte
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------
// COMPONENTE: Header Superior (Mobile Menu + Avatar)
// ---------------------------------------------------------
function TopHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      {/* Menu Mobile (Sheet do Shadcn) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu de navegação</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          {/* Adicionando Title e Description para acessibilidade (radix-ui exige) */}
          <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
          <SheetDescription className="sr-only">
            Links de navegação do painel do organizador
          </SheetDescription>

          <nav className="grid gap-2 text-lg font-medium mt-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
            >
              <Ticket className="h-6 w-6 text-primary" />
              <span>Zev3nt</span>
            </Link>

            <Link
              href="/dashboard"
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="h-5 w-5" />
              Visão Geral
            </Link>
            <Link
              href="/events"
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
            >
              <CalendarDays className="h-5 w-5" />
              Meus Eventos
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Barra de Busca e Perfil do Usuário */}
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar inscritos, eventos..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>IT</AvatarFallback>
            </Avatar>
            <span className="sr-only">Menu do usuário</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Iago Teles</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Minha Conta</DropdownMenuItem>
          <DropdownMenuItem>Suporte</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

// ---------------------------------------------------------
// COMPONENTE PRINCIPAL: Layout do Organizador
// ---------------------------------------------------------
export default function OrganizerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* O Sidebar fica fixo na esquerda no desktop */}
      <OrganizerSidebar />

      <div className="flex flex-col">
        {/* O Header fica no topo */}
        <TopHeader />

        {/* O conteúdo da página (dashboard, lista de eventos, etc) vai renderizar aqui dentro */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
