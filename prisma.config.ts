import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // Use process.env here (instead of `env()`) so `prisma generate` and other
  // CLI commands that may run without a DATABASE_URL don't throw during
  // config load. Use a runtime environment to provide a real DATABASE_URL.
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
