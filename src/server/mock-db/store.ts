import type { Store } from "./types";

export const createStore = (): Store => ({
  users: new Map(),
  collections: new Map(),
  links: new Map(),
});

const globalForMock = globalThis as unknown as {
  mockStore: Store | undefined;
};

let store: Store = globalForMock.mockStore ?? createStore();
globalForMock.mockStore = store;

export function getStore() {
  return store;
}

export function setStore(next: Store) {
  store = next;
  globalForMock.mockStore = next;
}
