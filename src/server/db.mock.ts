// In-memory Prisma-like client used for local development and tests when the
// real database is not available. The goal is to provide the minimal surface
// area that our routers interact with while keeping behaviour predictable.

import type { LinkListDatabase } from "./db.types";

import { collectionDelegate } from "./mock-db/collection-delegate";
import { linkDelegate } from "./mock-db/link-delegate";
import { runTransaction } from "./mock-db/transactions";
import { ensureUser } from "./mock-db/users";
import { resetStore } from "./mock-db/seed";
import { getStore } from "./mock-db/store";

/**
 * The in-memory mock database implementation.
 * Mimics the Prisma client interface for supported operations.
 */
export const db = {
  $transaction: runTransaction,
  collection: collectionDelegate,
  link: linkDelegate,
} as LinkListDatabase;

/**
 * Helper utilities for managing the in-memory mock database state.
 * Useful for testing and development.
 */
export const __memoryDb = {
  reset: resetStore,
  ensureUser,
};

if (getStore().collections.size === 0) {
  resetStore();
}
