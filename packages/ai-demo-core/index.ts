/**
 * @axeon/ai-demo-core — Universal AI Demo Platform core
 */
export * from "./demo-core/index";

export {
  executeTrialAsk,
  getTrialStatusForCode,
  TrialGatewayError,
} from "./trial/gateway";

export {
  createTrial,
  revokeTrial,
  listTrials,
  assertAdminSecret,
} from "./trial/admin";

export {
  hashTrialCode,
  generateTrialCode,
  shortHash,
} from "./trial/hash";

export {
  extractBearer,
  codeHashFromBearer,
  trialErrorPayload,
} from "./trial/http";
export type { TrialErrorJson } from "./trial/http";

export { openaiAdapter, openaiConnectionTest } from "./providers/openai-adapter";
export { anthropicAdapter } from "./providers/anthropic-adapter";
export { geminiAdapter } from "./providers/gemini-adapter";

export {
  getProviderConfig,
  getEnabledProviders,
  providerConfigs,
} from "./config/provider.config";

export { pricingConfig } from "./config/pricing.config";
export {
  trialPolicyConfig,
  getTrialDefaultModel,
  getTrialDefaultProvider,
} from "./config/trial-policy.config";

export type { AiProvider, AccessMode, ConnectionStatus } from "./types/access-mode";
export type {
  AiRequest,
  AiResult,
  NormalizedMessage,
  NormalizedUsage,
  ProviderConfig,
  AllowedModel,
} from "./types/provider";
export type {
  TrialPolicy,
  TrialRecord,
  TrialPublicStatus,
  TrialAskRequestBody,
  TrialAskResponse,
  StudioAccessMode,
} from "./types/trial";
export type { NormalizedError, InternalErrorCode } from "./types/errors";
export type { PricingConfig, ModelPricing } from "./types/usage";
