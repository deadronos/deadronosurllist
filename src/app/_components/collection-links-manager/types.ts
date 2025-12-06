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

/**
 * Feedback state for UI notifications.
 */
export type Feedback = { type: "success" | "error"; message: string } | null;
