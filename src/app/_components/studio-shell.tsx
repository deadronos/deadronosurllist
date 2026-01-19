import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StudioShellProps = {
  children: ReactNode;
  className?: string;
};

export function StudioShell({ children, className }: StudioShellProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="studio-surface pointer-events-none absolute inset-0 -z-10" />
      <div className="studio-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}
