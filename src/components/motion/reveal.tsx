import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  return (
    <div
      className={cn(
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:ease-out",
        className,
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
