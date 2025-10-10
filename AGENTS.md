# AI Agent Instructions for T3 Stack Project

This document provides essential guidance for AI coding agents working on this **T3 Stack** application (Next.js 15, tRPC, NextAuth.js, Prisma, TypeScript).

use 'sequentialthinking' tool eagerly.

Look at `.github/instructions/spec-driven-workflow-v1.instructions.md' for guidance on spec/design/tasks.

## 🧠 Memory Bank System

**CRITICAL**: This project uses a structured Memory Bank for context preservation. Review these files before starting work:

- **Memory Location**: `/memory/` folder
- **Task Management**: `/memory/tasks/` with `_index.md` master list
- **Design Documentation**: `/memory/designs/` for architectural decisions
- **Context Files**: `activeContext.md`, `progress.md`, `projectbrief.md`

**ID Management**: Ensure unique Task/Design IDs across both active folders and `/COMPLETED/` subfolders.

📖 **Full Details**: See `.github/instructions/memory-bank.instructions.md`

## 🏗️ Architecture Overview

### tRPC API Pattern

```typescript
// All backend logic in src/server/api/routers/
export const featureRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => ctx.db.model.findMany()),
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return ctx.db.model.create({
        data: { ...input, createdBy: { connect: { id: ctx.session.user.id } } },
      });
    }),
});
```

### Key Integration Points

- **Database**: Access via `ctx.db` (tRPC) or `db` (server components)
- **Authentication**: `ctx.session` (tRPC) or `await auth()` (server components)
- **Frontend**: `api.router.procedure.useQuery()` (client) or `api.router.procedure()` (server)
- **Environment**: All vars validated in `src/env.js`

## ⚡ Essential Commands

```bash
# Development
npm run dev          # Start with Turbo
npm run check        # Combined lint + typecheck

# Database
npm run db:push      # Schema changes (dev)
npm run db:studio    # GUI interface
npm run db:generate  # Regenerate client

# Code Quality
npm run format:write # Auto-format
npm run lint:fix     # Auto-fix issues
```

## 📁 File Organization

- **API Routes**: `src/server/api/routers/[feature].ts` → Register in `root.ts`
- **Components**: `src/app/_components/` (server) or with `"use client"` (client)
- **Database**: `prisma/schema.prisma` (always include User relations)
- **Types**: Export from `src/trpc/react.tsx` for router inputs/outputs

## 🔐 Authentication Patterns

- **Public Routes**: `publicProcedure` in tRPC
- **Protected Routes**: `protectedProcedure` (auto session check)
- **OAuth Provider**: Discord configured in `src/server/auth/config.ts`
- **User Relations**: Link all entities via `createdBy`/`createdById`

## 🔄 Development Workflow

1. **Schema Changes**: Update `prisma/schema.prisma` → `npm run db:push`
2. **New API**: Create router → register in `root.ts` → use in frontend
3. **Environment**: Add to `src/env.js` schema + runtime config
4. **Type Safety**: Leverage tRPC end-to-end inference

## 🎯 Project Conventions

- **Validation**: Zod schemas for all tRPC inputs/outputs
- **Styling**: Tailwind CSS with Geist font
- **Data Flow**: tRPC + React Query for state management
- **Serialization**: SuperJSON for complex types
- **Database Relations**: Always connect to users via foreign keys

## 📝 Before You Start

1. ✅ Check Memory Bank files in `/memory/`
2. ✅ Review existing tasks in `/memory/tasks/_index.md`
3. ✅ Update `activeContext.md` with current focus
4. ✅ Follow unique ID allocation rules
5. ✅ Document progress in memory system

## 🚨 Critical Reminders

- **Router Registration**: Manual registration required in `src/server/api/root.ts`
- **Environment Variables**: Must be defined in `src/env.js` schema
- **User Relations**: All models should connect to User table
- **Type Inference**: Avoid manual typing, use tRPC's built-in inference
- **Memory Updates**: Document significant changes in memory bank

---

📚 **Reference**: `.github/copilot-instructions.md` for detailed technical patterns
