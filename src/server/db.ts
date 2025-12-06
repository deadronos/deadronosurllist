import type { PrismaClient } from "@prisma/client";

import { env } from "@/env";
import type {
  CollectionRecord,
  LinkListDatabase,
  LinkRecord,
} from "./db.types";

const POSTGRES_PROTOCOL_REGEX = /^postgres(?:ql)?:\/\//i;

const normalizeEnv = (value?: string | null) => {
  if (!value) return "";
  const trimmed = value.trim();
  // Remove surrounding single or double quotes that often accidentally get pasted
  // into hosting provider UI (e.g., "postgresql://...").
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const resolveDatasourceUrl = () => {
  const primary = normalizeEnv(process.env.DATABASE_URL ?? "");
  if (POSTGRES_PROTOCOL_REGEX.test(primary)) {
    return primary;
  }

  const fallbacks = [
    process.env.DIRECT_DATABASE_URL,
    process.env.DATABASE_DIRECT_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.SHADOW_DATABASE_URL,
    // Some projects use the shorter `DIRECT_URL` (see .env.production).
    process.env.DIRECT_URL,
  ].map(normalizeEnv);

  for (const candidate of fallbacks) {
    if (candidate && POSTGRES_PROTOCOL_REGEX.test(candidate)) {
      return candidate;
    }
  }

  return "";
};

const datasourceUrl = resolveDatasourceUrl();

const useMock =
  process.env.USE_MOCK_DB === "true" || datasourceUrl.length === 0;

let prismaSingleton: PrismaClient | null = null;

let dbInternal: LinkListDatabase;

if (useMock) {
  const mod = await import("./db.mock");
  dbInternal = mod.db;
  if (!process.env.USE_MOCK_DB) {
    console.warn(
      "Database connection string is missing or unsupported protocol; defaulting to in-memory mock database.",
    );
  }
} else {
  const { PrismaClient } = await import("@prisma/client");
  // Prisma v7 requires either a driver adapter for a direct DB connection
  // or an accelerateUrl when using Prisma Accelerate. For PostgreSQL we use
  // the official '@prisma/adapter-pg' driver adapter and pass it to the
  // PrismaClient constructor via the `adapter` option.
  const { PrismaPg } = await import("@prisma/adapter-pg");

  const createPrismaClient = () =>
    new PrismaClient({
      log:
        env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      adapter: new PrismaPg({ connectionString: datasourceUrl }),
    });

  const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createPrismaClient> | undefined;
  };
  const prismaClient = globalForPrisma.prisma ?? createPrismaClient();

  if (env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;

  const prismaDb: LinkListDatabase = {
    $transaction: (operations) =>
      prismaClient.$transaction(
        operations.map((operation) =>
          typeof operation === "function" ? operation() : operation,
        ) as unknown as Parameters<typeof prismaClient.$transaction>[0],
      ) as Promise<unknown[]>,
    collection: {
      findMany: async (args) =>
        (await prismaClient.collection.findMany(args)) as CollectionRecord[],
      findFirst: async (args) =>
        (await prismaClient.collection.findFirst(
          args,
        )) as CollectionRecord | null,
      create: (args) => prismaClient.collection.create(args),
      update: (args) => prismaClient.collection.update(args),
      updateMany: (args) => prismaClient.collection.updateMany(args),
      delete: (args) => prismaClient.collection.delete(args),
      deleteMany: (args) => prismaClient.collection.deleteMany(args),
    },
    link: {
      findFirst: async (args) =>
        (await prismaClient.link.findFirst(args)) as LinkRecord | null,
      findMany: async (args) =>
        (await prismaClient.link.findMany(args)) as LinkRecord[],
      create: (args) => prismaClient.link.create(args),
      update: async (args) =>
        (await prismaClient.link.update(args)) as LinkRecord,
      updateMany: (args) => prismaClient.link.updateMany(args),
      delete: async (args) =>
        (await prismaClient.link.delete(args)) as LinkRecord,
    },
    post: {
      findFirst: (args) => prismaClient.post.findFirst(args),
      create: (args) => prismaClient.post.create(args),
    },
  };

  dbInternal = prismaDb;
  prismaSingleton = prismaClient;
}

/**
 * The database interface, abstracting over either Prisma or the in-memory mock.
 */
export const db: LinkListDatabase = dbInternal;

/**
 * Indicates whether the application is running with the in-memory mock database.
 */
export const isMockDb = useMock;

/**
 * The underlying Prisma client instance, or null if using the mock database.
 */
export const prisma = prismaSingleton;
