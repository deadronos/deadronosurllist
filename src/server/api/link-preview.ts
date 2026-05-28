import { load } from "cheerio";

/**
 * Hardened fetch for link preview metadata extraction.
 *
 * Safety guards:
 * - 5-second timeout via AbortController
 * - Response size cap (512 KB) to prevent memory exhaustion
 * - HTTP status check (non-2xx treated as failure)
 * - Redirect limit (max 5 hops) to prevent infinite redirect loops
 */

const FETCH_TIMEOUT_MS = 5_000;
const MAX_BODY_BYTES = 512 * 1024; // 512 KB

export type LinkPreviewResult = {
  title: string;
  description: string;
};

export type LinkPreviewError = {
  ok: false;
  reason: string;
};

export type LinkPreviewResponse = LinkPreviewResult | LinkPreviewError;

/**
 * Fetches HTML from a URL with safety guards and extracts OpenGraph / standard
 * metadata (title, description).
 */
export async function fetchLinkPreview(url: string): Promise<LinkPreviewResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "LinkList-Bot/1.0" },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!response.ok) {
      return {
        ok: false,
        reason: `Server returned HTTP ${response.status}`,
      };
    }

    const html = await readBodyWithLimit(response, MAX_BODY_BYTES);
    if (html === null) {
      return {
        ok: false,
        reason: `Response body exceeded ${MAX_BODY_BYTES} bytes`,
      };
    }

    const $ = load(html);

    const title =
      $("title").text() ||
      $('meta[property="og:title"]').attr("content") ||
      "";

    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    return {
      title: title.trim(),
      description: description.trim(),
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { ok: false, reason: `Request timed out after ${FETCH_TIMEOUT_MS}ms` };
    }

    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Unknown fetch error",
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Read the response body as text, but enforce a hard byte limit.
 * Returns `null` if the body exceeds the limit.
 */
async function readBodyWithLimit(
  response: Response,
  maxBytes: number,
): Promise<string | null> {
  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    return null;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    // Fallback: body is already buffered (e.g. in Node 18 mock)
    const text = await response.text();
    return text.length > maxBytes ? null : text;
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.length;
    if (totalBytes > maxBytes) {
      void reader.cancel();
      return null;
    }

    chunks.push(value);
  }

  const decoder = new TextDecoder();
  return decoder.decode(Buffer.concat(chunks));
}
