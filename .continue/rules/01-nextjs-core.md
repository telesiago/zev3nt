---
name: Next.js 16 & React Core
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: true
description: Padrões arquiteturais e boas práticas essenciais para o App Router
---

# Padrões Arquiteturais do Next.js e React

- Utilize sempre o Next.js App Router (diretório `src/app`).
- Dê preferência absoluta aos **Server Components**.
- Utilize a diretiva `"use client"` apenas e estritamente no topo de arquivos que necessitam de hooks de estado (`useState`, `useEffect`, `useTransition`), contexto ou interatividade direta com o DOM (onClick, onChange).
- **ATENÇÃO NEXT.JS 15+ (CRÍTICO):** `params` e `searchParams` agora são **Promises**.
  - Em Server Components: Desempacote usando `await` (ex: `const { id } = await params;`).
  - Em Client Components: Desempacote usando o hook do React (ex: `const { id } = use(params);`).
- Utilize caminhos de importação absolutos com alias `@/` (ex: `@/components/ui/button`, `@/lib/utils`) em vez de caminhos relativos (ex: `../../`).
- Escreva código fortemente tipado. Defina interfaces explícitas para as Props dos componentes. Evite o uso de `any`.
