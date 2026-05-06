---
name: UI, Tailwind & Shadcn
globs: ["**/*.tsx"]
alwaysApply: false
description: Diretrizes de estilização usando Tailwind CSS e componentes do Shadcn UI
---

# Diretrizes de UI e Estilização

- Utilize Tailwind CSS para toda a estilização. Evite arquivos CSS customizados, a menos que seja para configurações globais.
- Ao construir componentes,**SEMPRE** reutilize ou estenda os componentes base do Shadcn UI localizados em `@/components/ui/` em vez de criar elementos HTML nativos com Tailwind do zero.
- **NUNCA** crie mais de um component no mesmo arquivo .tsx
- Para mesclar classes Tailwind dinâmicas ou condicionais, envolva as classes na função utilitária `cn()` exportada de `@/lib/utils`.
  - Exemplo: `className={cn("base-class", isActive && "active-class", className)}`
- Utilize a biblioteca `lucide-react` para toda a iconografia do sistema.
- Mantenha o design limpo e foque na alta conversão (High Conversion) para a interface do Participante e ferramentas intuitivas para o Organizador.
