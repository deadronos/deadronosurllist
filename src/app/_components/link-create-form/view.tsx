"use client";

import type { FormEvent } from "react";
import { Link2Icon, Wand2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { BulkImportDialog } from "../collection-links-manager/bulk-import-dialog";

export interface LinkCreateFormViewProps {
  collectionId: string;
  url: string;
  onUrlChange: (value: string) => void;
  onUrlBlur: () => void;
  name: string;
  onNameChange: (value: string) => void;
  comment: string;
  onCommentChange: (value: string) => void;
  isSubmitting: boolean;
  isFetchingMetadata: boolean;
  onSubmit: (e: FormEvent) => void;
}

/**
 * Presentational component for the link creation form.
 */
export function LinkCreateFormView({
  collectionId,
  url,
  onUrlChange,
  onUrlBlur,
  name,
  onNameChange,
  comment,
  onCommentChange,
  isSubmitting,
  isFetchingMetadata,
  onSubmit,
}: LinkCreateFormViewProps) {
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
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">URL</label>
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(event) => onUrlChange(event.target.value)}
              onBlur={onUrlBlur}
              disabled={isSubmitting}
              required
            />
            {isFetchingMetadata ? (
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
                onChange={(event) => onNameChange(event.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comment</label>
              <Textarea
                placeholder="Optional context"
                value={comment}
                onChange={(event) => onCommentChange(event.target.value)}
                disabled={isSubmitting}
                rows={1}
                className="min-h-10"
              />
            </div>
          </div>

          <Button
            disabled={isSubmitting}
            size="lg"
            className="w-full"
          >
            {isSubmitting ? "Adding..." : "Add link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
