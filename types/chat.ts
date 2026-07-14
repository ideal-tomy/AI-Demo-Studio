export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  usage?: import("./provider").NormalizedUsage;
  costJpy?: number | null;
  model?: string;
  provider?: import("./access-mode").AiProvider;
  error?: string;
};

export type SessionCostState = {
  totalJpy: number;
  requestCount: number;
};
