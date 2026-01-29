"use client";

import type { FormEvent } from "react";
import { SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export interface CollectionCreateFormViewProps {
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  isPublic: boolean;
  onIsPublicChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}

/**
 * Presentational component for the collection creation form.
 */
export function CollectionCreateFormView({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  isPublic,
  onIsPublicChange,
  onSubmit,
  isSubmitting,
}: CollectionCreateFormViewProps) {
  return (
    <Card className="bg-background/55 border backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Create a collection</CardTitle>
            <CardDescription>
              A new space for a trail of links. Make it public whenever.
            </CardDescription>
          </div>
          <div className="bg-background/40 inline-flex size-9 items-center justify-center rounded-lg border">
            <SparklesIcon className="text-muted-foreground size-4" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="e.g. Design inspiration"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              disabled={isSubmitting}
              required
              aria-label="Collection name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="What lives in here?"
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              disabled={isSubmitting}
              aria-label="Collection description"
              rows={3}
            />
          </div>

          <div className="bg-background/35 flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
            <div>
              <div className="text-sm font-medium">Public</div>
              <div className="text-muted-foreground text-xs">
                Anyone with the link can browse.
              </div>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={onIsPublicChange}
              disabled={isSubmitting}
              aria-label="Make collection public"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Creating..." : "Create collection"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
