"use client";

export function CollectionsEmptyState() {
  return (
    <div className="bg-background/35 rounded-xl border border-dashed p-6">
      <div className="text-sm font-medium">No collections yet</div>
      <div className="text-muted-foreground mt-1 text-sm">
        Use the form to create your first collection and start saving links.
      </div>
    </div>
  );
}
