import { isHttpUrl } from "@/lib/url";

export type ParsedLink = {
  id: string;
  url: string;
  name: string;
};

const createClientId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export function parseBulkLinks(inputText: string): ParsedLink[] {
  const lines = inputText.split("\n");
  const links: ParsedLink[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!isHttpUrl(trimmed)) continue;

    links.push({
      id: createClientId(),
      url: trimmed,
      name: trimmed,
    });
  }

  return links;
}
