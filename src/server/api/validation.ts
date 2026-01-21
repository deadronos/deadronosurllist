import { z } from "zod";

import { isHttpUrl } from "@/lib/url";

/**
 * Validates that the URL uses a safe protocol (http or https).
 * Prevents Stored XSS via javascript: or data: URLs.
 */
export const isSafeUrl = (val: string) => {
  return isHttpUrl(val);
};

export const urlSchema = z.string().url().refine(isSafeUrl, {
  message: "Only http and https URLs are allowed",
});
