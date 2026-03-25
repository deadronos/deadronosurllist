import { afterEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

import type * as ServerDbModule from "@/server/db";

type QueryRawImplementation = (
  strings: TemplateStringsArray,
  userId: string,
) => Promise<Array<{ set_config: string }>>;

type MockTransactionClient = {
  $queryRaw: Mock<QueryRawImplementation>;
  collection: {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
  };
  link: {
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    createMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  user: {
    findFirst: ReturnType<typeof vi.fn>;
  };
};

const createMockTransactionClient = (): MockTransactionClient => ({
  $queryRaw: vi.fn<QueryRawImplementation>(async () => [
    { set_config: "user-123" },
  ]),
  collection: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  link: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
  },
});

describe("withUserDb", () => {
  const originalUseMockDb = process.env.USE_MOCK_DB;
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("@prisma/client");
    vi.doUnmock("@prisma/adapter-pg");
    process.env.USE_MOCK_DB = originalUseMockDb;
    process.env.DATABASE_URL = originalDatabaseUrl;
    delete (globalThis as { prisma?: unknown }).prisma;
  });

  it("sets the transaction-local RLS user context with set_config", async () => {
    const tx = createMockTransactionClient();
    const prismaClient = {
      $transaction: vi.fn(async (callback: (client: MockTransactionClient) => Promise<unknown>) =>
        callback(tx),
      ),
    };

    class MockPrismaClient {
      constructor(_options: unknown) {
        return prismaClient;
      }
    }

    class MockPrismaPg {
      constructor(_options: unknown) {
        return { adapter: "pg" };
      }
    }

    vi.doMock("@prisma/client", () => ({
      PrismaClient: MockPrismaClient,
    }));
    vi.doMock("@prisma/adapter-pg", () => ({
      PrismaPg: MockPrismaPg,
    }));

    process.env.USE_MOCK_DB = "false";
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/app";

    const { withUserDb } = await vi.importActual<typeof ServerDbModule>(
      "@/server/db",
    );

    const result = await withUserDb("user-123", async () => "ok");

    expect(result).toBe("ok");
    expect(prismaClient.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);

    const firstCall = tx.$queryRaw.mock.calls[0];

    expect(firstCall).toBeDefined();

    if (!firstCall) {
      throw new Error("Expected $queryRaw to be called");
    }

    const [templateStrings, boundUserId] = firstCall;
    const sql = templateStrings.join("?");

    expect(sql).toContain("SELECT set_config('app.current_user_id', ");
    expect(sql).toContain(", true)");
    expect(boundUserId).toBe("user-123");
  });
});