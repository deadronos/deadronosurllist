"use client";

import { type FormEvent, useState } from "react";

import { api } from "@/trpc/react";

import { useInvalidateAndRefresh } from "@/hooks/use-invalidate-and-refresh";

import { CollectionCreateFormView } from "./view";

/**
 * Container component for creating a new collection.
 * Manages state and tRPC mutations.
 *
 * @returns {JSX.Element} The form container.
 */
export function CollectionCreateForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const utils = api.useUtils();
  const invalidateAndRefresh = useInvalidateAndRefresh();
  const createMutation = api.collection.create.useMutation({
    onSuccess: async () => {
      setName("");
      setDescription("");
      setIsPublic(false);
      await invalidateAndRefresh(() => utils.collection.invalidate());
    },
  });

  const isSubmitting = createMutation.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    createMutation.mutate({ name, description, isPublic });
  };

  return (
    <CollectionCreateFormView
      name={name}
      onNameChange={setName}
      description={description}
      onDescriptionChange={setDescription}
      isPublic={isPublic}
      onIsPublicChange={setIsPublic}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
