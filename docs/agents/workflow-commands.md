# Workflow & Essential Commands

Essential commands and development lifecycle for this project.

## Development Lifecycle

1. **Understand**: Review `/memory/` state and any relevant specs in `.github/instructions/`.
2. **Implement**:
   - Update `schema.prisma` → `npm run db:push`.
   - Create/Update tRPC routers → Register in `root.ts`.
   - Build UI components.
3. **Verify**: Run `npm run check` to ensure no linting or type errors.
4. **Document**: Update the Memory Bank.

## Essential Commands

| Command                | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Start development server with Turbo                   |
| `npm run check`        | Combined lint + typecheck (Run this before finishing) |
| `npm run db:push`      | Sync Prisma schema with database (Dev)                |
| `npm run db:studio`    | Open Prisma Studio GUI                                |
| `npm run format:write` | Auto-format code                                      |
| `npm run lint:fix`     | Auto-fix linting issues                               |

---

See also: [.github/instructions/spec-driven-workflow-v1.instructions.md](file:///d:/GitHub/deadronosurllist/.github/instructions/spec-driven-workflow-v1.instructions.md)
