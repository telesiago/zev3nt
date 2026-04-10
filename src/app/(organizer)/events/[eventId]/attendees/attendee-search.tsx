"use client";

import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

export function AttendeeSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [isPending, startTransition] = useTransition();
  const [term, setTerm] = useState(searchParams.get("q") || "");

  // Debounce: Espera 300ms após o utilizador parar de digitar para atualizar a URL
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      const currentQ = params.get("q") || "";

      // CORREÇÃO CRÍTICA: Só atualiza a URL se o termo realmente mudou.
      // Isto quebra o loop infinito de atualizações!
      if (term === currentQ) return;

      if (term) {
        params.set("q", term);
      } else {
        params.delete("q");
      }

      startTransition(() => {
        replace(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [term, pathname, replace, searchParams]);

  return (
    <div className="relative w-full md:w-72">
      <div className="absolute left-2.5 top-2.5 text-muted-foreground">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </div>
      <Input
        type="search"
        placeholder="Buscar por nome ou e-mail..."
        className="pl-8"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
    </div>
  );
}
