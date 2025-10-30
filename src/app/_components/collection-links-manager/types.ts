export type CollectionLinkModel = {
  id: string;
  name: string;
  url: string;
  comment: string | null;
  order: number;
};

export type Feedback = { type: "success" | "error"; message: string } | null;
