import type { PrismaClient } from "@prisma/client";

import { env } from "@/env";
import type { CollectionRecord, LinkListDatabase, LinkRecord } from "./db.types";

const useMock = !!process.env.USE_MOCK_DB;

let prismaSingleton: PrismaClient | null = null;

let dbInternal: LinkListDatabase;

if (useMock) {
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
  const prismaClient = globalForPrisma.prisma ?? createPrismaClient();

  if (env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;

  const prismaDb: LinkListDatabase = {
    $transaction: (operations) => prismaClient.$transaction(operations),
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
