// CORE-CANDIDATE
export type AccessMode = "byok-direct" | "managed-trial" | "client-proxy";

export type AiProvider = "openai" | "anthropic" | "google";

export type ConnectionStatus =
  | "unchecked"
  | "checking"
  | "success"
  | "auth_error"
  | "permission_error"
  | "model_unavailable"
  | "network_error"
  | "other_error";
