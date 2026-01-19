# AI Agent Instructions (T3 Stack)

This is a T3 Stack application (Next.js 15, tRPC, NextAuth.js, Prisma).

## 🚀 Getting Started

1. **Always use the `sequentialthinking` tool** for complex logic.
2. **Check the Memory Bank**: Start at `/memory/` to understand the current state.
3. **Follow the Workflow**: Review [Workflow & Commands](file:///d:/GitHub/deadronosurllist/docs/agents/workflow-commands.md).

## 📚 Progressive Disclosure

Detailed instructions are separated by domain to keep your context window clean:

- **[Memory & State](file:///d:/GitHub/deadronosurllist/docs/agents/memory-and-state.md)**: Rules for context preservation and task IDs.
- **[Backend & API](file:///d:/GitHub/deadronosurllist/docs/agents/backend-api.md)**: tRPC routers, Prisma schema, and Auth patterns.
- **[Frontend](file:///d:/GitHub/deadronosurllist/docs/agents/frontend-development.md)**: Next.js components and Tailwind styling.
- **[Workflow & Commands](file:///d:/GitHub/deadronosurllist/docs/agents/workflow-commands.md)**: Essential `npm` commands and dev lifecycle.

## 🛠️ Essential Commands

```bash
npm run dev    # Start development server
npm run check  # Run lint + typecheck (REQUIRED before completion)
```

---

Primary Reference: [.github/copilot-instructions.md](file:///d:/GitHub/deadronosurllist/.github/copilot-instructions.md)
