"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/trpc/react";
import {
  Button,
  Card,
  Checkbox,
  Flex,
  Heading,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";

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

  const isSubmitting = createMutation.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    createMutation.mutate({ name, description, isPublic });
  };

  return (
    <Card
      asChild
      variant="surface"
      className="border border-white/10 bg-white/5 backdrop-blur"
    >
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="4">
          <Heading as="h2" size="6">
            Create New Collection
          </Heading>
          <Flex direction="column" gap="3">
            <TextField.Root
              size="3"
              placeholder="Collection name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              required
              aria-label="Collection name"
            />
            <TextArea
              size="3"
              placeholder="Description (optional)"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting}
              aria-label="Collection description"
              rows={3}
            />
            <Flex align="center" gap="2">
              <Checkbox
                size="2"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked === true)}
                disabled={isSubmitting}
                aria-label="Make collection public"
              />
              <Text size="2" color="gray">
                Public
              </Text>
            </Flex>
          </Flex>
          <Button type="submit" size="3" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </Flex>
      </form>
    </Card>
  );
}
