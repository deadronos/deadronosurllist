# Frontend Development

Guidelines for Next.js components, styling, and data fetching.

## Technology Stack

- **Framework**: Next.js 15 (App Router).
- **Styling**: Tailwind CSS with Geist font.
- **Data Flow**: tRPC + React Query for state management.
- **Serialization**: SuperJSON for complex types.

## Component Organization

- **Server Components**: Place in `src/app/_components/`.
- **Client Components**: Use the `"use client"` directive.
- **Data Fetching**:
  - Client side: `api.router.procedure.useQuery()`.
  - Server side: `api.router.procedure()`.

## Best Practices

- **Validation**: Use Zod schemas for all tRPC inputs/outputs (inferred to the frontend).
- **Type Safety**: Leverage tRPC's built-in inference; avoid manual typing of API responses.
