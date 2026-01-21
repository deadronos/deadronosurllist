"use client";

import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";

type CollectionsToolbarProps = {
  filterTerm: string;
  onFilterChange: (value: string) => void;
};

export function CollectionsToolbar({
  filterTerm,
  onFilterChange,
}: CollectionsToolbarProps) {
  return (
    <div className="relative">
      <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        placeholder="Filter collections..."
        value={filterTerm}
        onChange={(event) => onFilterChange(event.target.value)}
        className="pl-9"
      />
    </div>
  );
}
