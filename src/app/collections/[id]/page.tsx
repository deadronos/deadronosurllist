import Link from "next/link";
import { notFound } from "next/navigation";

import { api, HydrateClient } from "@/trpc/server";
import { LinkCreateForm } from "@/app/_components/link-create-form";
import { auth } from "@/server/auth";

interface Props {
  params: { id: string };
}

export default async function CollectionPage({ params }: Props) {
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

  const collection = await api.collection.getById({ id: params.id });
  if (!collection) notFound();

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

        <ul className="mt-6 divide-y rounded border">
          {collection.links.map((l) => (
            <li key={l.id} className="flex items-center justify-between p-4">
              <div>
                <a
                  className="font-medium text-blue-600 hover:underline"
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l.name}
                </a>
                {l.comment ? (
                  <p className="text-sm text-slate-600">{l.comment}</p>
                ) : null}
              </div>
              <span className="text-xs text-slate-500">#{l.order}</span>
            </li>
          ))}
          {collection.links.length === 0 && (
            <li className="p-4 text-slate-600">No links yet.</li>
          )}
        </ul>
      </main>
    </HydrateClient>
  );
}

