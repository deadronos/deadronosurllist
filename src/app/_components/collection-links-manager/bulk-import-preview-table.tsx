"use client";

import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { ParsedLink } from "./bulk-import-parser";

type BulkImportPreviewTableProps = {
  links: ParsedLink[];
  onUpdate: (index: number, field: keyof ParsedLink, value: string) => void;
  onRemove: (index: number) => void;
};

export function BulkImportPreviewTable({
  links,
  onUpdate,
  onRemove,
}: BulkImportPreviewTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>URL</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="w-0"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link, index) => (
          <TableRow key={link.id}>
            <TableCell className="align-top">
              <Input
                value={link.url}
                onChange={(event) => onUpdate(index, "url", event.target.value)}
              />
            </TableCell>
            <TableCell className="align-top">
              <Input
                value={link.name}
                onChange={(event) => onUpdate(index, "name", event.target.value)}
              />
            </TableCell>
            <TableCell className="align-top">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => onRemove(index)}
                aria-label="Remove"
              >
                <Trash2Icon className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
