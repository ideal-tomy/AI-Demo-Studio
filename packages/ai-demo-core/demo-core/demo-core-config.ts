import type { AiProvider } from "../types/access-mode";

export type KnowledgePolicy = {
  recommendedMax: number;
  warningFrom: number;
  hardLimit: number;
};

export type RolePreset = {
  id: string;
  label: string;
  description: string;
  prompt: string;
};

export type DemoCoreConfig = {
  storageNamespace: string;
  demoId: string;
  defaultRoleId: string;
  defaultAccessMode?: string;
  defaultModel?: string;
  defaultProvider?: AiProvider;
  knowledgePolicy: KnowledgePolicy;
  chat?: { maxHistoryMessages: number };
  baseSystemPrompt?: string;
  demoSpecificPrompt?: string;
  rolePresets?: RolePreset[];
};

let activeConfig: DemoCoreConfig | null = null;

export function configureDemoCore(config: DemoCoreConfig): void {
  activeConfig = config;
}

export function getDemoCoreConfig(): DemoCoreConfig {
  if (!activeConfig) {
    throw new Error(
      "configureDemoCore() must be called before using @axeon/ai-demo-core storage or knowledge helpers.",
    );
  }
  return activeConfig;
}

export function isDemoCoreConfigured(): boolean {
  return activeConfig !== null;
}
