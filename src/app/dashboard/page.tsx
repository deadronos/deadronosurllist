import Link from "next/link";

import { api, HydrateClient } from "@/trpc/server";
import { auth } from "@/server/auth";
import { CollectionCreateForm } from "@/app/_components/collection-create-form";

type CollectionSummary = {
  id: string;
  name: string;
  description: string | null;
  _count?: { links?: number | null } | null;
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-2xl font-bold">LinkList</h1>
        <p className="mb-4">Please sign in to view your dashboard.</p>
        <Link
          href="/api/auth/signin"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const collectionsRaw: unknown = await api.collection.getAll();
  if (!Array.isArray(collectionsRaw)) {
    throw new Error("Unexpected collections payload");
  }
  const collectionsResult = collectionsRaw as unknown[];
  if (!collectionsResult.every(isCollectionSummary)) {
    throw new Error("Unexpected collections payload");
  }
  const collections = collectionsResult;

  return (
    <HydrateClient>
      <main className="mx-auto max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Collections</h1>
          <Link
            href="/"
            className="rounded bg-slate-100 px-3 py-1 text-slate-800"
          >
            Home
          </Link>
        </div>
        <CollectionCreateForm />
        <ul className="mt-6 divide-y divide-slate-200 rounded border">
          {collections.map((collection) => (
            <li
              key={collection.id}
              className="flex items-center justify-between p-4"
            >
              <div>
                <Link
                  href={`/collections/${collection.id}`}
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {collection.name}
                </Link>
                {collection.description ? (
                  <p className="text-sm text-slate-600">
                    {collection.description}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>{collection._count?.links ?? 0} links</span>
              </div>
            </li>
          ))}
          {collections.length === 0 && (
            <li className="p-4 text-slate-600">No collections yet.</li>
          )}
        </ul>
      </main>
    </HydrateClient>
  );
}

function isCollectionSummary(value: unknown): value is CollectionSummary {
  if (!value || typeof value !== "object") return false;
  const candidate = value as {
    id?: unknown;
    name?: unknown;
    description?: unknown;
    _count?: unknown;
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
  if (
    candidate._count !== undefined &&
    candidate._count !== null &&
    typeof candidate._count !== "object"
  ) {
    return false;
  }
  if (candidate._count && typeof candidate._count === "object") {
    const links = (candidate._count as { links?: unknown }).links;
    if (links !== undefined && links !== null && typeof links !== "number") {
      return false;
    }
  }
  return true;
}
