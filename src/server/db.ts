import type { PrismaClient } from "@prisma/client";

import { env } from "@/env";
import type { CollectionRecord, LinkListDatabase, LinkRecord } from "./db.types";

const POSTGRES_PROTOCOL_REGEX = /^postgres(?:ql)?:\/\//i;

const resolveDatasourceUrl = () => {
  const primary = process.env.DATABASE_URL ?? "";
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
  ];

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

  const createPrismaClient = () =>
    new PrismaClient({
      log:
        env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      datasources: { db: { url: datasourceUrl } },
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
        (await prismaClient.collection.findFirst(args)) as CollectionRecord | null,
      create: (args) => prismaClient.collection.create(args),
      updateMany: (args) => prismaClient.collection.updateMany(args),
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

export const db: LinkListDatabase = dbInternal;
export const isMockDb = useMock;
export const prisma = prismaSingleton;
