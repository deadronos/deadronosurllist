"use client";

import dynamic from "next/dynamic";
import { Flex, Text } from "@radix-ui/themes";
import type { ComponentProps } from "react";
import { type PublicCatalog } from "./public-catalog";

const PublicCatalogDynamic = dynamic(
  () => import("./public-catalog").then((mod) => mod.PublicCatalog),
  {
    ssr: false,
    loading: () => (
      <Flex align="center" justify="center" p="9">
        <Text color="gray">Loading public catalog...</Text>
      </Flex>
    ),
  },
);

export function LazyPublicCatalog(props: ComponentProps<typeof PublicCatalog>) {
  return <PublicCatalogDynamic {...props} />;
}
