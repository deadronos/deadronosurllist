import type { Feedback } from "../types";

/**
 * Model representing a link in a collection for the UI.
 */
export type CollectionLinkModel = {
  id: string;
  name: string;
  url: string;
  comment: string | null;
  order: number;
};

export type { Feedback };
