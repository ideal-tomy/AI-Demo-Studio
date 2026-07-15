import { configureDemoCore } from "@axeon/ai-demo-core/demo-core";
import { brandConfig } from "@/config/brand.config";
import { demoConfig } from "@/config/demo.config";

let configured = false;

/** Call once before any storage / knowledge / prompt-builder usage. */
export function ensureAiDemoCoreConfigured(): void {
  if (configured) return;
  configureDemoCore({
    storageNamespace: brandConfig.storageNamespace,
    demoId: demoConfig.id,
    defaultRoleId: demoConfig.defaultRoleId,
    defaultAccessMode: "byok-direct",
    defaultModel: demoConfig.allowedProviders.includes("openai")
      ? "gpt-5.4-nano"
      : undefined,
    defaultProvider: "openai",
    knowledgePolicy: demoConfig.knowledgePolicy,
    chat: demoConfig.chat,
    baseSystemPrompt: demoConfig.baseSystemPrompt,
    demoSpecificPrompt: demoConfig.demoSpecificPrompt,
    rolePresets: demoConfig.rolePresets,
  });
  configured = true;
}
