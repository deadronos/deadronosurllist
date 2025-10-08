# Copilot Instructions for T3 Stack Application

This is a **T3 Stack** project using Next.js 15, tRPC, NextAuth.js, Prisma, and TypeScript with strict patterns.

**Important**: This project uses a structured Memory Bank system (see `.github/instructions/memory-bank.instructions.md`). Always check `/memory/` folder for context:
- `/memory/tasks/` - Task management with individual files and `_index.md`
- `/memory/designs/` - Architecture decisions and design documentation
- Task/Design IDs must be unique across both active folders and `/COMPLETED/` subfolders

## Core Architecture

### tRPC API Layer
- **Server API**: All backend logic lives in `src/server/api/routers/` as tRPC routers
- **Router Registration**: Manually add new routers to `src/server/api/root.ts` 
- **Type Safety**: Export router types for full-stack type inference via `AppRouter`
- **Procedures**: Use `publicProcedure` (no auth) vs `protectedProcedure` (requires session)
- **Client Access**: Frontend calls via `api.routerName.procedureName.useQuery()` or `.useMutation()`

Example router pattern:
```typescript
export const myRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => ctx.db.model.findMany()),
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(({ ctx, input }) => /* implementation */),
});
```

### Database & Auth Integration  
- **Prisma Client**: Access via `ctx.db` in tRPC procedures, `db` in server components
- **Session Access**: `ctx.session` in tRPC, `await auth()` in server components
- **User Relations**: Link models to users via `createdBy`/`createdById` pattern (see Post model)
- **Environment**: All env vars defined/validated in `src/env.js` using `@t3-oss/env-nextjs`

### Frontend Patterns
- **Server Components**: Use `api.router.procedure()` for direct server calls (see `page.tsx`)
- **Client Components**: Use `api.router.procedure.useQuery()` hooks with tRPC React Query
- **Hydration**: Prefetch in server components, consume in client via `<HydrateClient>`
- **Authentication**: Discord OAuth configured, session available app-wide

## Essential Commands

```bash
# Development
npm run dev          # Start with Turbo (faster)
npm run check        # Lint + TypeScript check combined

# Database Operations  
npm run db:push      # Push schema changes (development)
npm run db:migrate   # Run migrations (production)
npm run db:studio    # Open Prisma Studio GUI
npm run db:generate  # Generate Prisma client (auto on postinstall)

# Code Quality
npm run format:write # Prettier format all files
npm run lint:fix     # ESLint auto-fix
npm run typecheck    # TypeScript validation only
```

## Project Conventions

### File Organization
- **tRPC Routers**: `src/server/api/routers/[feature].ts`
- **Database Models**: Define in `prisma/schema.prisma`, always include User relations
- **Components**: Server in `src/app/_components/`, client components use `"use client"`
- **Type Exports**: Export router inputs/outputs from `src/trpc/react.tsx`

### Authentication Flow
- **Discord OAuth**: Configured in `src/server/auth/config.ts`
- **Protected Routes**: Use `protectedProcedure` in tRPC or check `session` in components
- **Session Management**: Handled automatically by NextAuth.js with Prisma adapter

### Database Patterns
- **User Relations**: Always connect entities to users via foreign keys
- **Timestamps**: Include `createdAt`/`updatedAt` on main entities
- **Indexing**: Add `@@index` on frequently queried fields

### Development Workflow
1. **Schema Changes**: Update `prisma/schema.prisma` → `npm run db:push`
2. **New API Routes**: Create router → register in `root.ts` → use in frontend
3. **Environment Variables**: Add to `src/env.js` schema + runtime config
4. **Type Safety**: Leverage tRPC's end-to-end type inference, avoid manual typing

## Key Dependencies & Patterns

- **Validation**: Zod schemas for all tRPC inputs/outputs
- **Styling**: Tailwind CSS with Geist font family  
- **Data Fetching**: tRPC with React Query for caching/state management
- **Transformers**: SuperJSON for Date/BigInt/Map serialization
- **Error Handling**: Automatic Zod error formatting in tRPC responses

## Memory Bank Integration

This project uses a structured Memory Bank system:
- **Task Management**: Create tasks in `memory/tasks/` with unique IDs
- **Design Documentation**: Store in `memory/designs/` for architecture decisions  
- **Active Context**: Update `memory/activeContext.md` for current work focus
- **Progress Tracking**: Maintain `memory/progress.md` for completion status

Always check existing memory files before starting work and update them as you make progress.