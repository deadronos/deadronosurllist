import * as React from "react";

import { cn } from "@/lib/utils";

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  baseDelayMs?: number;
};

export function Stagger({
  children,
  className,
  itemClassName,
  baseDelayMs = 70,
}: StaggerProps) {
  const items = React.Children.toArray(children);

  return (
    <div className={cn(className)}>
      {items.map((child, index) => (
        <div
          key={index}
          className={cn(
            "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:ease-out",
            itemClassName,
          )}
          style={{ animationDelay: `${index * baseDelayMs}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
