---
name: Prisma ORM & Database
globs: ["**/*.ts", "prisma/schema.prisma"]
alwaysApply: false
description: Padrões de integração e nomenclaturas específicas do banco de dados da Zev3nt
---

# Regras de Acesso a Dados

- **Instância Única:** Nunca instancie o PrismaClient (`new PrismaClient()`) diretamente dentro dos arquivos de rota ou action. Importe sempre a instância global criada no projeto através de `import { prisma } from "@/lib/prisma"`.
- O acesso direto ao banco de dados via Prisma deve ocorrer **exclusivamente** no lado do servidor (Server Components, Server Actions ou Route Handlers).
- Para listagens e dashboards, priorize consultas otimizadas utilizando `select` ou `include` para buscar dados relacionados (ex: carregar Categorias e Lotes de Ingressos junto com os Eventos), evitando o problema de queries N+1.

# Dicionário de Dados Zev3nt (MUITO IMPORTANTE)

Para evitar erros de compilação, use SEMPRE estes nomes exatos ao interagir com o Prisma no projeto Zev3nt:

- **Participantes/Ingressos:** NUNCA use `ticket` como modelo principal. O participante com o QR Code chama-se **`Attendee`** (`prisma.attendee`).
- **Lotes de Ingressos:** O modelo que define preços e categorias é o **`TicketType`** (`prisma.ticketType`).
- **Imagens do Evento:** O campo da imagem principal é **`imageUrl`** (Não use `coverImageUrl`).
- **Check-in:** O status de entrada é o booleano **`isCheckedIn`** e a hora é **`checkInTime`** (Não use `checkInStatus`).
