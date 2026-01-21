"use client";

import { useEffect, useRef } from "react";

type UseIntersectionLoadMoreOptions = {
  enabled: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
};

export function useIntersectionLoadMore({
  enabled,
  onLoadMore,
  rootMargin = "400px 0px",
}: UseIntersectionLoadMoreOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        onLoadMore();
      },
      {
        root: null,
        rootMargin,
        threshold: 0.01,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [enabled, onLoadMore, rootMargin]);

  return { sentinelRef };
}
