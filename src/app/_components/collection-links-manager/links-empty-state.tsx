"use client";

import { Button } from "@/components/ui/button";

type LinksEmptyStateProps = {
  hasFilter: boolean;
  onClearFilter: () => void;
};

export function LinksEmptyState({ hasFilter, onClearFilter }: LinksEmptyStateProps) {
  return (
    <div className="bg-background/35 mt-6 rounded-xl border p-6">
      <div className="text-sm font-medium">{hasFilter ? "No matches" : "No links yet"}</div>
      <div className="text-muted-foreground mt-1 text-sm">
        {hasFilter
          ? "No links match the current filter."
          : "Add your first resource using the form above."}
      </div>
      {hasFilter ? (
        <div className="mt-4">
          <Button type="button" variant="secondary" onClick={onClearFilter}>
            Clear filter
          </Button>
        </div>
      ) : null}
    </div>
  );
}
