// CORE-CANDIDATE
import { getDemoCoreConfig } from "./demo-core-config";
import type { AiProvider } from "../types/access-mode";
import type { StudioAccessMode } from "../types/trial";

function getPrefix(): string {
  const c = getDemoCoreConfig();
  return `aidemo:${c.storageNamespace}:${c.demoId}`;
}

function key(parts: string[]): string {
  return [getPrefix(), ...parts].join(":");
}

function safeGet(storage: Storage | undefined, k: string): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(k);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage | undefined, k: string, value: string): void {
  if (!storage) return;
  try {
    storage.setItem(k, value);
  } catch {
    // Quota / private mode — ignore
  }
}

function safeRemove(storage: Storage | undefined, k: string): void {
  if (!storage) return;
  try {
    storage.removeItem(k);
  } catch {
    // ignore
  }
}

function browserSession(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.sessionStorage;
}

function browserLocal(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}

export type StudioSettings = {
  accessMode: StudioAccessMode | string;
  provider: AiProvider;
  model: string;
  roleId: string;
  customInstruction: string;
  knowledge: string;
  setupComplete: boolean;
  connectionStatus: string;
};

function defaultSettings(): StudioSettings {
  const c = getDemoCoreConfig();
  return {
    accessMode: (c.defaultAccessMode as StudioAccessMode) ?? "byok-direct",
    provider: c.defaultProvider ?? "openai",
    model: c.defaultModel ?? "gpt-5-nano",
    roleId: c.defaultRoleId,
    customInstruction: "",
    knowledge: "",
    setupComplete: false,
    connectionStatus: "unchecked",
  };
}

export const storageKeys = {
  apiKey: (provider: AiProvider) => key(["apiKey", provider]),
  trialCode: () => key(["trialCode"]),
  settings: () => key(["settings"]),
  chat: () => key(["chat"]),
  sessionCost: () => key(["sessionCost"]),
};

/** API keys: sessionStorage only (not long-lived by default). */
export function getApiKey(provider: AiProvider): string {
  return safeGet(browserSession(), storageKeys.apiKey(provider)) ?? "";
}

export function setApiKey(provider: AiProvider, apiKey: string): void {
  if (!apiKey) {
    safeRemove(browserSession(), storageKeys.apiKey(provider));
    return;
  }
  safeSet(browserSession(), storageKeys.apiKey(provider), apiKey);
}

/** Trial code: sessionStorage only. */
export function getTrialCode(): string {
  return safeGet(browserSession(), storageKeys.trialCode()) ?? "";
}

export function setTrialCode(code: string): void {
  if (!code) {
    safeRemove(browserSession(), storageKeys.trialCode());
    return;
  }
  safeSet(browserSession(), storageKeys.trialCode(), code);
}

export function getSettings(): StudioSettings {
  const raw = safeGet(browserLocal(), storageKeys.settings());
  const defaults = defaultSettings();
  if (!raw) return { ...defaults };
  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export function setSettings(partial: Partial<StudioSettings>): StudioSettings {
  const next = { ...getSettings(), ...partial };
  safeSet(browserLocal(), storageKeys.settings(), JSON.stringify(next));
  return next;
}

export function getChatJson(): string | null {
  return safeGet(browserLocal(), storageKeys.chat());
}

export function setChatJson(json: string): void {
  safeSet(browserLocal(), storageKeys.chat(), json);
}

export function getSessionCostJson(): string | null {
  return safeGet(browserLocal(), storageKeys.sessionCost());
}

export function setSessionCostJson(json: string): void {
  safeSet(browserLocal(), storageKeys.sessionCost(), json);
}

/** Clears only this app's storage keys for the active brand/demo. */
export function clearAll(): void {
  const prefix = getPrefix();
  const storages = [browserSession(), browserLocal()].filter(
    Boolean,
  ) as Storage[];
  for (const storage of storages) {
    const toRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(prefix)) toRemove.push(k);
    }
    toRemove.forEach((k) => storage.removeItem(k));
  }
}

export function clearChatAndCost(): void {
  safeRemove(browserLocal(), storageKeys.chat());
  safeRemove(browserLocal(), storageKeys.sessionCost());
}
