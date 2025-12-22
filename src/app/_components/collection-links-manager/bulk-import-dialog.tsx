"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  Flex,
  Text,
  TextArea,
  TextField,
  ScrollArea,
  Table,
  Callout,
} from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { api } from "@/trpc/react";

type BulkImportDialogProps = {
  collectionId: string;
  trigger?: React.ReactNode;
};

type ParsedLink = {
  id: string;
  url: string;
  name: string;
};

export function BulkImportDialog({
  collectionId,
  trigger,
}: BulkImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"input" | "preview">("input");
  const [inputText, setInputText] = useState("");
  const [parsedLinks, setParsedLinks] = useState<ParsedLink[]>([]);

  const router = useRouter();
  const utils = api.useUtils();

  const createBatchMutation = api.link.createBatch.useMutation({
    onSuccess: async () => {
      setOpen(false);
      setInputText("");
      setParsedLinks([]);
      setStep("input");
      await utils.collection.getById.invalidate({ id: collectionId });
      router.refresh();
    },
  });

  const handleParse = () => {
    const lines = inputText.split("\n");
    const links: ParsedLink[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        // Basic validation: attempt to create URL object
        const urlObj = new URL(trimmed);
        if (["http:", "https:"].includes(urlObj.protocol)) {
          links.push({
            id: Math.random().toString(36).substring(2),
            url: trimmed,
            name: trimmed, // Default name to URL
          });
        }
      } catch {
        // Skip invalid URLs
      }
    }

    if (links.length > 0) {
      setParsedLinks(links);
      setStep("preview");
    }
  };

  const handleUpdateLink = (
    index: number,
    field: keyof ParsedLink,
    value: string,
  ) => {
    const newLinks = [...parsedLinks];
    newLinks[index] = {
      ...newLinks[index],
      [field]: value,
    } as ParsedLink;
    setParsedLinks(newLinks);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = parsedLinks.filter((_, i) => i !== index);
    setParsedLinks(newLinks);
    if (newLinks.length === 0) {
      setStep("input");
    }
  };

  const handleSubmit = () => {
    createBatchMutation.mutate({
      collectionId,
      links: parsedLinks.map(({ url, name }) => ({ url, name })),
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        {trigger ?? <Button variant="soft">Bulk Import</Button>}
      </Dialog.Trigger>

      <Dialog.Content maxWidth="600px">
        <Dialog.Title>Bulk Import Links</Dialog.Title>
        <Dialog.Description>
          {step === "input"
            ? "Paste a list of URLs (one per line)."
            : "Review and edit links before importing."}
        </Dialog.Description>

        {createBatchMutation.error && (
          <Callout.Root color="red" className="mb-4 mt-4">
            <Callout.Icon>
              <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>{createBatchMutation.error.message}</Callout.Text>
          </Callout.Root>
        )}

        {step === "input" ? (
          <div className="mt-4 flex flex-col gap-4">
            <TextArea
              placeholder="https://example.com/page1&#10;https://example.com/page2"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <Flex justify="end" gap="3">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button onClick={handleParse} disabled={!inputText.trim()}>
                Preview
              </Button>
            </Flex>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: 400 }}>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>URL</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {parsedLinks.map((link, index) => (
                    <Table.Row key={link.id}>
                      <Table.Cell>
                        <TextField.Root
                          value={link.url}
                          onChange={(e) =>
                            handleUpdateLink(index, "url", e.target.value)
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <TextField.Root
                          value={link.name}
                          onChange={(e) =>
                            handleUpdateLink(index, "name", e.target.value)
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          variant="ghost"
                          color="red"
                          onClick={() => handleRemoveLink(index)}
                        >
                          ×
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </ScrollArea>
            <Flex justify="between" align="center">
              <Text size="2" color="gray">
                {parsedLinks.length} valid links found
              </Text>
              <Flex gap="3">
                <Button variant="soft" color="gray" onClick={() => setStep("input")}>
                  Back
                </Button>
                <Button onClick={handleSubmit} loading={createBatchMutation.isPending}>
                  Import {parsedLinks.length} Links
                </Button>
              </Flex>
            </Flex>
          </div>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
