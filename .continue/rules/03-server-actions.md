---
name: Server Actions & Backend
globs: ["src/app/actions/**/*.ts", "src/app/api/**/*.ts"]
alwaysApply: false
description: Regras de segurança, validação e estrutura de retorno para o backend
---

# Padrões de API e Server Actions

- As Server Actions devem sempre ser declaradas em arquivos separados contendo a diretiva `"use server"` no topo.
- **Segurança First:** Sempre recupere a sessão do usuário com o `auth()` do NextAuth para validar a autenticação e confirmar se o usuário (Organizador) tem permissão antes de executar qualquer mutação de dados.
- **Validação Rigorosa:** Todos os dados recebidos do cliente devem ser validados através dos esquemas do Zod localizados em `src/schemas/` antes de qualquer processamento (ex: `eventSchema.parse(data)`).
- As Actions devem retornar respostas consistentes através de objetos padronizados, nunca estourando exceções brutas para o frontend.
  - Estrutura esperada: `{ success: boolean, data?: any, error?: string }`.
- Utilize blocos `try/catch` para capturar falhas de banco de dados ou APIs externas (como Resend ou Mercado Pago) e converta-os em mensagens de erro amigáveis no retorno.
