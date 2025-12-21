import type { Feedback } from "../types";

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

export type { Feedback };
