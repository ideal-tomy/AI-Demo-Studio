import type { AiProvider } from "./access-mode";

// DEMO-SPECIFIC types

export type RolePreset = {
  id: string;
  label: string;
  description: string;
  prompt: string;
};

export type KnowledgePolicy = {
  recommendedMax: number;
  warningFrom: number;
  hardLimit: number;
};

export type ChatConfig = {
  /** Number of recent messages sent to the API (not display). */
  maxHistoryMessages: number;
};

export type DemoConfig = {
  id: string;
  name: string;
  description: string;
  baseSystemPrompt: string;
  demoSpecificPrompt: string;
  rolePresets: RolePreset[];
  defaultRoleId: string;
  exampleQuestions: string[];
  knowledgeHints: string[];
  sampleKnowledge: string;
  allowedProviders: AiProvider[];
  knowledgePolicy: KnowledgePolicy;
  chat: ChatConfig;
};
