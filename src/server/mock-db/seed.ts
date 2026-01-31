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

  const extraCollectionCount = 18;

  Array.from({ length: extraCollectionCount }).forEach((_, index) => {
    const extraId = `col_public_extra_${index + 1}`;
    const timestamp = new Date(now.getTime() - (index + 1) * 60_000);
    const linkId = `link_extra_${index + 1}`;

    store.collections.set(extraId, {
      id: extraId,
      name: `Resource Roundup ${index + 1}`,
      description: "Seeded public collection for catalog paging.",
      isPublic: true,
      createdById: userId,
      createdAt: timestamp,
      updatedAt: timestamp,
      order: index + 1,
      linkIds: [linkId],
    });

    store.links.set(linkId, {
      id: linkId,
      collectionId: extraId,
      url: `https://example.com/seed/${index + 1}`,
      name: `Seed Link ${index + 1}`,
      comment: null,
      order: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  });
}
