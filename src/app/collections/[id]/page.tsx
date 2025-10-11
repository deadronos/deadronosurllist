import Link from "next/link";
import { notFound } from "next/navigation";

import { api, HydrateClient } from "@/trpc/server";
import { LinkCreateForm } from "@/app/_components/link-create-form";
import { auth } from "@/server/auth";
import { CollectionLinksManager } from "@/app/_components/collection-links-manager";

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

interface PageProps {
  params: Promise<{ id: string }>;
}

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

function isCollectionWithLinks(value: unknown): value is CollectionWithLinks {
  if (!value || typeof value !== "object") return false;

  const candidate = value as {
    id?: unknown;
    name?: unknown;
    description?: unknown;
    isPublic?: unknown;
    links?: unknown;
  };

  if (typeof candidate.id !== "string") return false;
  if (candidate.name !== undefined && typeof candidate.name !== "string") {
    return false;
  }
  if (
    candidate.description !== undefined &&
    candidate.description !== null &&
    typeof candidate.description !== "string"
  ) {
    return false;
  }
  if (typeof candidate.isPublic !== "boolean") {
    return false;
  }
  if (!Array.isArray(candidate.links)) return false;
  return candidate.links.every((link) => {
    if (!link || typeof link !== "object") return false;
    const linkCandidate = link as {
      id?: unknown;
      name?: unknown;
      url?: unknown;
      order?: unknown;
      comment?: unknown;
    };
    const hasComment =
      linkCandidate.comment === null ||
      linkCandidate.comment === undefined ||
      typeof linkCandidate.comment === "string";
    return (
      typeof linkCandidate.id === "string" &&
      typeof linkCandidate.name === "string" &&
      typeof linkCandidate.url === "string" &&
      typeof linkCandidate.order === "number" &&
      hasComment
    );
  });
}
