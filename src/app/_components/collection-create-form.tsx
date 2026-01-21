"use client";

import { type FormEvent, useState } from "react";

import { SparklesIcon } from "lucide-react";

import { api } from "@/trpc/react";

import { useInvalidateAndRefresh } from "@/hooks/use-invalidate-and-refresh";

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

/**
 * Form component for creating a new collection.
 * Includes fields for name, description, and visibility.
 *
 * @returns {JSX.Element} The form component.
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="e.g. Design inspiration"
              value={name}
              onChange={(event) => setName(event.target.value)}
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
              onChange={(event) => setDescription(event.target.value)}
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
              onCheckedChange={(checked) => setIsPublic(checked)}
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
