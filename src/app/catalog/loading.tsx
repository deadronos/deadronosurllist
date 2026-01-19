import { StudioShell } from "@/app/_components/studio-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function CatalogLoading() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <StudioShell>
        <div className="grid gap-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="bg-background/55 rounded-xl border p-6 backdrop-blur">
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-background/40 rounded-xl border p-5"
                >
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </StudioShell>
    </div>
  );
}
