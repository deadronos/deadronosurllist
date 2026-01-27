"use client";

import { type FormEvent, useState } from "react";

import { api } from "@/trpc/react";

import { isHttpUrl } from "@/lib/url";
import { useInvalidateAndRefresh } from "@/hooks/use-invalidate-and-refresh";

import { LinkCreateFormView } from "./view";

/**
 * Container component for adding a new link to a collection.
 * Manages state, mutations, and metadata prefetching.
 *
 * @param {object} props - The component props.
 * @param {string} props.collectionId - The ID of the collection to add the link to.
 * @returns {JSX.Element} The form container.
 */
export function LinkCreateForm({ collectionId }: { collectionId: string }) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const utils = api.useUtils();
  const invalidateAndRefresh = useInvalidateAndRefresh();
  const createMutation = api.link.create.useMutation({
    onSuccess: async () => {
      setUrl("");
      setName("");
      setComment("");
      await invalidateAndRefresh(() =>
        utils.collection.getById.invalidate({ id: collectionId }),
      );
    },
  });

  const previewMutation = api.link.preview.useMutation({
    onSuccess: (data) => {
      if (!name && data.title) {
        setName(data.title);
      }
      if (!comment && data.description) {
        setComment(data.description);
      }
    },
  });

  const handleUrlBlur = () => {
    if (!url) return;
    if (!isHttpUrl(url)) return;
    previewMutation.mutate({ url });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url || !name) return;
    createMutation.mutate({ collectionId, url, name, comment });
  };

  return (
    <LinkCreateFormView
      collectionId={collectionId}
      url={url}
      onUrlChange={setUrl}
      onUrlBlur={handleUrlBlur}
      name={name}
      onNameChange={setName}
      comment={comment}
      onCommentChange={setComment}
      isSubmitting={createMutation.isPending}
      isFetchingMetadata={previewMutation.isPending}
      onSubmit={handleSubmit}
    />
  );
}
