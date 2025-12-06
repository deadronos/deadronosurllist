"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/trpc/react";

/**
 * Form component for adding a new link to a collection.
 *
 * @param {object} props - The component props.
 * @param {string} props.collectionId - The ID of the collection to add the link to.
 * @returns {JSX.Element} The form component.
 */
export function LinkCreateForm({ collectionId }: { collectionId: string }) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const router = useRouter();
  const utils = api.useUtils();
  const createMutation = api.link.create.useMutation({
    onSuccess: async () => {
      setUrl("");
      setName("");
      setComment("");
      await utils.collection.getById.invalidate({ id: collectionId });
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!url || !name) return;
        createMutation.mutate({ collectionId, url, name, comment });
      }}
      className="rounded border p-4"
    >
      <h2 className="mb-3 font-semibold">Add Link</h2>
      <div className="mb-2">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={createMutation.isPending}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {createMutation.isPending ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
