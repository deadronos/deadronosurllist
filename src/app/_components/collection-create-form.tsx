"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/trpc/react";

export function CollectionCreateForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();
  const createMutation = api.collection.create.useMutation({
    onSuccess: async () => {
      setName("");
      setDescription("");
      setIsPublic(false);
      await utils.collection.invalidate();
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        createMutation.mutate({ name, description, isPublic });
      }}
      className="rounded border p-4"
    >
      <h2 className="mb-3 font-semibold">Create New Collection</h2>
      <div className="mb-2 flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2"
          placeholder="Collection name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <label className="mb-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Public
      </label>
      <div>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {createMutation.isPending ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
