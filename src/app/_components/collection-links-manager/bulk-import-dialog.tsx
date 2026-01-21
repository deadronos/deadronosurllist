"use client";

import { useState } from "react";

import { TriangleAlertIcon } from "lucide-react";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

import { useInvalidateAndRefresh } from "@/hooks/use-invalidate-and-refresh";

import type { ParsedLink } from "./bulk-import-parser";
import { parseBulkLinks } from "./bulk-import-parser";
import { BulkImportPreviewTable } from "./bulk-import-preview-table";

type BulkImportDialogProps = {
  collectionId: string;
  trigger?: React.ReactNode;
};

export function BulkImportDialog({
  collectionId,
  trigger,
}: BulkImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"input" | "preview">("input");
  const [inputText, setInputText] = useState("");
  const [parsedLinks, setParsedLinks] = useState<ParsedLink[]>([]);

  const utils = api.useUtils();
  const invalidateAndRefresh = useInvalidateAndRefresh();

  const createBatchMutation = api.link.createBatch.useMutation({
    onSuccess: async () => {
      setOpen(false);
      setInputText("");
      setParsedLinks([]);
      setStep("input");
      await invalidateAndRefresh(() =>
        utils.collection.getById.invalidate({ id: collectionId }),
      );
    },
  });

  const handleParse = () => {
    const links = parseBulkLinks(inputText);

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
              <BulkImportPreviewTable
                links={parsedLinks}
                onUpdate={handleUpdateLink}
                onRemove={handleRemoveLink}
              />
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
