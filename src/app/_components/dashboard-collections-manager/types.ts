/**
 * Model representing a collection on the dashboard.
 */
export type DashboardCollectionModel = {
  id: string;
  name: string;
  description: string | null;
  order: number;
  linkCount: number;
};

/**
 * Feedback state for UI notifications.
 */
export type Feedback = { type: "success" | "error"; message: string } | null;
