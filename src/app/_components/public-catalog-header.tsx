import { type ChangeEvent } from "react";

import { ChevronDownIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type PublicCatalogHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  filteredCount: number;
  totalCount: number;
  showSort: boolean;
  sortKey: "updated" | "newest" | "name-asc" | "name-desc" | "links-desc";
  sortLabel: string;
  sortOptions: Array<{ key: string; label: string }>;
  onSortKeyChange: (
    key: "updated" | "newest" | "name-asc" | "name-desc" | "links-desc",
  ) => void;
};

export function PublicCatalogHeader({
  query,
  onQueryChange,
  filteredCount,
  totalCount,
  showSort,
  sortKey,
  sortLabel,
  sortOptions,
  onSortKeyChange,
}: PublicCatalogHeaderProps) {
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  return (
    <CardHeader className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-lg">All current public lists</CardTitle>
          <CardDescription>Browse collections published by the community.</CardDescription>
        </div>

        <div className="relative w-full md:w-80">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={handleQueryChange}
            placeholder="Search by name or description"
            className="pl-9"
            aria-label="Search catalog"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Showing {filteredCount} of {totalCount} public lists
          {hasQuery ? " (filtered)" : ""}.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {showSort ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  Sort: {sortLabel}
                  <ChevronDownIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={sortKey}
                  onValueChange={(value) =>
                    onSortKeyChange(
                      value as
                        | "updated"
                        | "newest"
                        | "name-asc"
                        | "name-desc"
                        | "links-desc",
                    )
                  }
                >
                  {sortOptions.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.key}
                      value={option.key}
                    >
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {hasQuery ? (
            <Badge variant="secondary">Filtered</Badge>
          ) : (
            <Badge variant="secondary">Live catalog</Badge>
          )}
        </div>
      </div>
    </CardHeader>
  );
}
