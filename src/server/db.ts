import type { Prisma, PrismaClient } from "@prisma/client";

import { env } from "@/env";
import type {
  CollectionRecord,
  LinkListDatabase,
  LinkRecord,
  PublicUserRecord,
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

const createDelegates = (
  client: PrismaClient | Prisma.TransactionClient,
): Pick<LinkListDatabase, "collection" | "link" | "user"> => ({
  collection: {
    findMany: async (args) =>
      (await client.collection.findMany(args)) as CollectionRecord[],
    findFirst: async (args) =>
      (await client.collection.findFirst(args)) as CollectionRecord | null,
    create: (args) => client.collection.create(args),
    update: (args) => client.collection.update(args),
    updateMany: (args) => client.collection.updateMany(args),
    count: (args) => client.collection.count(args),
    delete: (args) => client.collection.delete(args),
    deleteMany: (args) => client.collection.deleteMany(args),
  },
  link: {
    findFirst: async (args) =>
      (await client.link.findFirst(args)) as LinkRecord | null,
    findMany: async (args) =>
      (await client.link.findMany(args)) as LinkRecord[],
    create: (args) => client.link.create(args),
    createMany: (args) => client.link.createMany(args),
    update: async (args) => (await client.link.update(args)) as LinkRecord,
    updateMany: (args) => client.link.updateMany(args),
    delete: async (args) => (await client.link.delete(args)) as LinkRecord,
  },
  user: {
    findFirst: async (args) =>
      (await client.user.findFirst(args)) as PublicUserRecord | null,
  },
});

const createPrismaDatabase = (client: PrismaClient): LinkListDatabase => ({
  $transaction: (operations) =>
    client.$transaction(
      operations.map((operation) =>
        typeof operation === "function" ? operation() : operation,
      ) as unknown as Parameters<typeof client.$transaction>[0],
    ) as Promise<unknown[]>,
  ...createDelegates(client),
});

const createTransactionDatabase = (
  client: Prisma.TransactionClient,
): LinkListDatabase => ({
  $transaction: async (operations) => {
    const results: unknown[] = [];
    for (const operation of operations) {
      results.push(await (typeof operation === "function" ? operation() : operation));
    }
    return results;
  },
  ...createDelegates(client),
});

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

  const enableSlowQueryLogging = process.env.LOG_SLOW_QUERIES === "true";
  const slowQueryThresholdMs = Number(
    process.env.SLOW_QUERY_THRESHOLD_MS ?? 200,
  );
  const baseLogLevels: Prisma.LogLevel[] =
    env.NODE_ENV === "development" ? ["error", "warn"] : ["error"];
  const logConfig: Prisma.PrismaClientOptions["log"] =
    enableSlowQueryLogging
      ? [{ emit: "event", level: "query" }, ...baseLogLevels]
      : env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"];

  const createPrismaClient = () => {
    const client = new PrismaClient({
      log: logConfig,
      adapter: new PrismaPg({ connectionString: datasourceUrl }),
    });

    if (enableSlowQueryLogging) {
      const threshold = Number.isFinite(slowQueryThresholdMs)
        ? slowQueryThresholdMs
        : 200;
      client.$on("query", (event) => {
        if (event.duration >= threshold) {
          console.warn(
            `[Prisma] Slow query (${event.duration}ms) on ${event.target}`,
          );
        }
      });
    }

    return client;
  };

  const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createPrismaClient> | undefined;
  };
  const prismaClient = globalForPrisma.prisma ?? createPrismaClient();

  if (env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;

  dbInternal = createPrismaDatabase(prismaClient);
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

export const withUserDb = async <T>(
  userId: string,
  operation: (scopedDb: LinkListDatabase) => Promise<T>,
): Promise<T> => {
  if (useMock || !prismaSingleton) {
    return operation(dbInternal);
  }

  return prismaSingleton.$transaction(async (tx) => {
    await tx.$executeRaw`SET LOCAL app.current_user_id = ${userId}`;
    const scopedDb = createTransactionDatabase(tx);
    return operation(scopedDb);
  });
};

/**
 * The underlying Prisma client instance, or null if using the mock database.
 */
export const prisma = prismaSingleton;
