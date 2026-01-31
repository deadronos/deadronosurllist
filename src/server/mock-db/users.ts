import { getStore } from "./store";

export function ensureUser(userId: string) {
  const store = getStore();

  if (!store.users.has(userId)) {
    const now = new Date();
    store.users.set(userId, {
      id: userId,
      name: "Mock User",
      email: `${userId}@example.com`,
      image: null,
      createdAt: now,
      updatedAt: now,
    });
  }
}
