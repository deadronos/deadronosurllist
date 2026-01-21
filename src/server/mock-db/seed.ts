import { createStore, setStore } from "./store";
import { ensureUser } from "./users";

export function resetStore() {
  const store = createStore();
  setStore(store);

  // Seed with a predictable user/collection/link so the UI has data.
  const now = new Date();
  const userId = "user1";
  ensureUser(userId);

  const collectionId = "col_public_discover";
  const defaultLinks = [
    {
      id: "link_github",
      url: "https://github.com",
      name: "GitHub",
      comment: "Collaborate on code and explore repositories.",
    },
    {
      id: "link_radix",
      url: "https://www.radix-ui.com",
      name: "Radix UI",
      comment: "Accessible primitives and themes for modern web apps.",
    },
    {
      id: "link_nextjs",
      url: "https://nextjs.org",
      name: "Next.js",
      comment: "Full-stack React framework for the web.",
    },
  ];

  store.collections.set(collectionId, {
    id: collectionId,
    name: "Discover Links",
    description: "Curated starters to explore the Deadronos URL List.",
    isPublic: true,
    createdById: userId,
    createdAt: now,
    updatedAt: now,
    order: 0,
    linkIds: defaultLinks.map((link) => link.id),
  });

  defaultLinks.forEach((link, index) => {
    store.links.set(link.id, {
      id: link.id,
      collectionId,
      url: link.url,
      name: link.name,
      comment: link.comment ?? null,
      order: index,
      createdAt: now,
      updatedAt: now,
    });
  });
}
