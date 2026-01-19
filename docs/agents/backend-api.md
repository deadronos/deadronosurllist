# Backend & API Development

Guidelines for working with tRPC, Prisma, and the server-side logic.

## tRPC API Pattern

All backend logic resides in `src/server/api/routers/`.

```typescript
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

## Database Rules (Prisma)

- **Location**: `prisma/schema.prisma`
- **User Relations**: All models should connect to the `User` table via `createdBy` / `createdById`.
- **Sync**: Use `npm run db:push` for schema changes during development.

## Registration & Config

- **Router Registration**: Every new router must be manually registered in `src/server/api/root.ts`.
- **Environment Variables**: All new variables must be defined in the `src/env.js` schema and runtime config.

## Authentication

- Use `ctx.session` in tRPC procedures.
- Use `await auth()` in server components.
- Configure OAuth providers in `src/server/auth/config.ts`.
