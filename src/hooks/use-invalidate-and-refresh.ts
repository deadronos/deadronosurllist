"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

type Invalidator = () => Promise<void> | void;

export function useInvalidateAndRefresh() {
  const router = useRouter();

  return useCallback(
    async (invalidate: Invalidator) => {
      await invalidate();
      router.refresh();
    },
    [router],
  );
}
