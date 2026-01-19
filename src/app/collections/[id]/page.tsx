import Link from "next/link";
import { notFound } from "next/navigation";

import { api, HydrateClient } from "@/trpc/server";
import { LinkCreateForm } from "@/app/_components/link-create-form";
import { auth } from "@/server/auth";
import { CollectionLinksManager } from "@/app/_components/collection-links-manager";
import { createTypeGuard } from "@/lib/type-guards";

type CollectionLink = {
  id: string;
  name: string;
  url: string;
  comment: string | null;
  order: number;
};

type CollectionWithLinks = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  links: CollectionLink[];
};

const isCollectionWithLinks = createTypeGuard<CollectionWithLinks>([
  { name: "id", type: "string" },
  { name: "name", type: "string" },
  { name: "description", type: "string", optional: true, nullable: true },
  { name: "isPublic", type: "boolean" },
  {
    name: "links",
    type: "array",
    nestedFields: [
      { name: "id", type: "string" },
      { name: "name", type: "string" },
      { name: "url", type: "string" },
      { name: "comment", type: "string", optional: true, nullable: true },
      { name: "order", type: "number" },
    ],
  },
]);

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * The collection detail page.
 * Displays links within a specific collection and allows adding/managing links.
 *
 * @param {PageProps} props - The page properties.
 * @param {Promise<{ id: string }>} props.params - The route parameters containing the collection ID.
 * @returns {Promise<JSX.Element>} The collection page component.
 */
export default async function CollectionPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-2xl font-bold">Collection</h1>
        <p className="mb-4">Please sign in to view this collection.</p>
        <Link
          href="/api/auth/signin"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const collectionResult: unknown = await api.collection.getById({ id });
  if (!collectionResult) notFound();
  if (!isCollectionWithLinks(collectionResult)) {
    throw new Error("Unexpected collection payload");
  }

  const collection = {
    ...collectionResult,
    links: [...collectionResult.links].sort((a, b) => a.order - b.order),
  } satisfies CollectionWithLinks;

  return (
    <HydrateClient>
      <main className="mx-auto max-w-3xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{collection.name}</h1>
            {collection.description ? (
              <p className="text-slate-600">{collection.description}</p>
            ) : null}
          </div>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Back
          </Link>
        </div>

        <LinkCreateForm collectionId={collection.id} />

        <CollectionLinksManager
          collectionId={collection.id}
          initialLinks={collection.links}
          initialIsPublic={collection.isPublic}
        />
      </main>
    </HydrateClient>
  );
}
