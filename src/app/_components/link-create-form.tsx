"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";

import { api } from "@/trpc/react";
import { BulkImportDialog } from "./collection-links-manager/bulk-import-dialog";

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
    try {
      const u = new URL(url);
      if (["http:", "https:"].includes(u.protocol)) {
        previewMutation.mutate({ url });
      }
    } catch {
      // ignore invalid urls
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !name) return;
    createMutation.mutate({ collectionId, url, name, comment });
  };

  return (
    <Card variant="surface" className="mb-6">
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="4">
          <Flex justify="between" align="center">
            <Heading size="4">Add Link</Heading>
            <BulkImportDialog
              collectionId={collectionId}
              trigger={
                <Button variant="ghost" size="2" type="button">
                  Bulk Import
                </Button>
              }
            />
          </Flex>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                URL <Text color="red">*</Text>
              </Text>
              <TextField.Root
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                disabled={createMutation.isPending}
                required
              />
              {previewMutation.isPending && (
                <Text size="1" color="gray" mt="1">
                  Fetching metadata...
                </Text>
              )}
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Display Name <Text color="red">*</Text>
              </Text>
              <TextField.Root
                placeholder="My Awesome Link"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createMutation.isPending}
                required
              />
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Comment
              </Text>
              <TextField.Root
                placeholder="Optional comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={createMutation.isPending}
              />
            </label>
          </Flex>

          <Button disabled={createMutation.isPending} size="3">
            {createMutation.isPending ? "Adding..." : "Add Link"}
          </Button>
        </Flex>
      </form>
    </Card>
  );
}
