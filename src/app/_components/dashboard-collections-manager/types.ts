export type DashboardCollectionModel = {
  id: string;
  name: string;
  description: string | null;
  order: number;
  linkCount: number;
};

export type Feedback = { type: "success" | "error"; message: string } | null;
