"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Trash2Icon, TriangleAlertIcon } from "lucide-react";

import { api } from "@/trpc/react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="secondary" type="button">
            Bulk import
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk import links</DialogTitle>
          <DialogDescription>
            {step === "input"
              ? "Paste a list of URLs (one per line)."
              : "Review and edit links before importing."}
          </DialogDescription>
        </DialogHeader>

        {createBatchMutation.error ? (
          <Alert variant="destructive">
            <TriangleAlertIcon className="size-4" />
            <AlertDescription>
              {createBatchMutation.error.message}
            </AlertDescription>
          </Alert>
        ) : null}

        {step === "input" ? (
          <div className="grid gap-4">
            <Textarea
              placeholder="https://example.com/page1\nhttps://example.com/page2"
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              rows={10}
              className="font-mono text-sm"
            />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleParse}
                disabled={!inputText.trim()}
              >
                Preview
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <ScrollArea className="max-h-[420px] rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-0"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedLinks.map((link, index) => (
                    <TableRow key={link.id}>
                      <TableCell className="align-top">
                        <Input
                          value={link.url}
                          onChange={(event) =>
                            handleUpdateLink(index, "url", event.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <Input
                          value={link.name}
                          onChange={(event) =>
                            handleUpdateLink(index, "name", event.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveLink(index)}
                          aria-label="Remove"
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground text-sm">
                {parsedLinks.length} valid links found
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep("input")}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={createBatchMutation.isPending}
                >
                  {createBatchMutation.isPending
                    ? "Importing..."
                    : `Import ${parsedLinks.length} links`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
