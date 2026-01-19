import { Badge } from "@/components/ui/badge";

export function HeroBadges() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">Curate links</Badge>
      <Badge variant="secondary">Share collections</Badge>
      <Badge variant="secondary">Fast search</Badge>
      <Badge variant="secondary">Drag & drop</Badge>
    </div>
  );
}
