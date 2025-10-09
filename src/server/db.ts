import { env } from "@/env";

const useMock = !!process.env.USE_MOCK_DB;

let dbInternal: any;

if (useMock) {
  // load the mock implementation which avoids loading Prisma binaries
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = await import("./db.mock");
  dbInternal = mod.db;
} else {
  const { PrismaClient } = await import("@prisma/client");

  const createPrismaClient = () =>
    new PrismaClient({
      log:
        env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

  const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createPrismaClient> | undefined;
  };

  dbInternal = globalForPrisma.prisma ?? createPrismaClient();

  if (env.NODE_ENV !== "production") globalForPrisma.prisma = dbInternal;
}

export const db = dbInternal;
