import { z } from "zod";

/**
 * Validates that the URL uses a safe protocol (http or https).
 * Prevents Stored XSS via javascript: or data: URLs.
 */
export const isSafeUrl = (val: string) => {
  try {
    const protocol = new URL(val).protocol;
    return ["http:", "https:"].includes(protocol);
  } catch {
    return false;
  }
};

export const urlSchema = z.string().url().refine(isSafeUrl, {
  message: "Only http and https URLs are allowed",
});
