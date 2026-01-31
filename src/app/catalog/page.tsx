import { LazyPublicCatalog } from "@/app/_components/lazy-public-catalog";
import { StudioShell } from "@/app/_components/studio-shell";

const PUBLIC_CATALOG_PAGE_SIZE = 16;
const PUBLIC_CATALOG_LINK_LIMIT = 10;

export const revalidate = 60;

export default function CatalogPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <StudioShell>
        <div className="grid gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Public catalog
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Browse what the community is publishing. Use tabs to explore
              what's new, and search to find a theme fast.
            </p>
          </div>

          <LazyPublicCatalog
            pageSize={PUBLIC_CATALOG_PAGE_SIZE}
            linkLimit={PUBLIC_CATALOG_LINK_LIMIT}
            showTabs
            autoLoadMore
          />
        </div>
      </StudioShell>
    </div>
  );
}
