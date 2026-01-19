"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import type { PublicCatalog } from "./public-catalog";

const PublicCatalogDynamic = dynamic(
  () => import("./public-catalog").then((mod) => mod.PublicCatalog),
  {
    ssr: false,
    loading: () => (
      <div className="bg-background/55 rounded-xl border p-6 backdrop-blur">
        <div className="space-y-3">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-4 w-80" />
          <div className="grid gap-4 pt-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
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
    ),
  },
);

export function LazyPublicCatalog(props: ComponentProps<typeof PublicCatalog>) {
  return <PublicCatalogDynamic {...props} />;
}
