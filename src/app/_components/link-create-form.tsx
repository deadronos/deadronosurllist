"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Link2Icon, Wand2Icon } from "lucide-react";

import { api } from "@/trpc/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
    <Card className="bg-background/55 mb-6 border backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Link2Icon className="text-muted-foreground size-4" />
            <CardTitle className="text-base">Add a link</CardTitle>
          </div>

          <BulkImportDialog
            collectionId={collectionId}
            trigger={
              <Button variant="secondary" size="sm" type="button">
                Bulk import
              </Button>
            }
          />
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">URL</label>
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onBlur={handleUrlBlur}
              disabled={createMutation.isPending}
              required
            />
            {previewMutation.isPending ? (
              <div className="text-muted-foreground text-xs">
                <Wand2Icon className="mr-1 inline size-3" />
                Fetching metadata...
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display name</label>
              <Input
                placeholder="My awesome link"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={createMutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comment</label>
              <Textarea
                placeholder="Optional context"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                disabled={createMutation.isPending}
                rows={1}
                className="min-h-10"
              />
            </div>
          </div>

          <Button
            disabled={createMutation.isPending}
            size="lg"
            className="w-full"
          >
            {createMutation.isPending ? "Adding..." : "Add link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
