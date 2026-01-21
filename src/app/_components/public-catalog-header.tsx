import { type ChangeEvent } from "react";

import { SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PublicCatalogHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  filteredCount: number;
  totalCount: number;
  showTabs: boolean;
  tab: "new" | "updated";
  onTabChange: (tab: "new" | "updated") => void;
};

export function PublicCatalogHeader({
  query,
  onQueryChange,
  filteredCount,
  totalCount,
  showTabs,
  tab,
  onTabChange,
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
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Showing {filteredCount} of {totalCount} public lists
          {hasQuery ? " (filtered)" : ""}.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {showTabs ? (
            <Tabs value={tab} onValueChange={(v) => onTabChange(v as typeof tab)}>
              <TabsList>
                <TabsTrigger value="updated">Recently updated</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
              </TabsList>
            </Tabs>
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
