"use client";

import { EyeIcon, EyeOffIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type LinksToolbarProps = {
  isPublic: boolean;
  onToggleVisibility: (checked: boolean) => void;
  visibilityDisabled: boolean;
  filterTerm: string;
  onFilterChange: (value: string) => void;
};

export function LinksToolbar({
  isPublic,
  onToggleVisibility,
  visibilityDisabled,
  filterTerm,
  onFilterChange,
}: LinksToolbarProps) {
  return (
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="bg-background/35 flex items-center justify-between gap-4 rounded-xl border px-4 py-3 sm:w-[360px]">
        <div className="flex items-center gap-2">
          {isPublic ? (
            <EyeIcon className="text-muted-foreground size-4" />
          ) : (
            <EyeOffIcon className="text-muted-foreground size-4" />
          )}
          <div>
            <div className="text-sm font-medium">
              {isPublic ? "Visible to anyone" : "Only you can see this"}
            </div>
            <div className="text-muted-foreground text-xs">
              Toggle to publish or hide this collection.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isPublic ? "default" : "secondary"}>
            {isPublic ? "Public" : "Private"}
          </Badge>
          <Switch
            checked={isPublic}
            onCheckedChange={onToggleVisibility}
            disabled={visibilityDisabled}
            aria-label="Toggle collection visibility"
          />
        </div>
      </div>

      <div className="relative w-full sm:w-72">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Filter links..."
          value={filterTerm}
          onChange={(event) => onFilterChange(event.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
