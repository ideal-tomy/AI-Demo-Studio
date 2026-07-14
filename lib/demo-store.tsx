"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { demoConfig } from "@/config/demo.config";
import { getProviderConfig } from "@/config/provider.config";
import { trialPolicyConfig } from "@/config/trial-policy.config";
import {
  AiTransportError,
  sendAiRequest,
  testConnection,
  testTrialConnection,
} from "@/lib/demo-core/ai-transport";
import { connectionStatusFromError } from "@/lib/demo-core/error-normalizer";
import { countCharacters, evaluateKnowledge, estimateTokens } from "@/lib/demo-core/knowledge";
import { calculateCost } from "@/lib/demo-core/pricing";
import {
  buildSystemPrompt,
  selectHistoryForApi,
} from "@/lib/demo-core/prompt-builder";
import {
  clearAll,
  clearChatAndCost,
  getApiKey,
  getChatJson,
  getSessionCostJson,
  getSettings,
  getTrialCode,
  setApiKey,
  setChatJson,
  setSessionCostJson,
  setSettings,
  setTrialCode as persistTrialCode,
  type StudioSettings,
} from "@/lib/demo-core/storage";
import type { AiProvider, ConnectionStatus } from "@/types/access-mode";
import type { ChatMessage, SessionCostState } from "@/types/chat";
import type { NormalizedError } from "@/types/errors";
import type { TrialPublicStatus } from "@/types/trial";

type DemoStore = {
  hydrated: boolean;
  settings: StudioSettings;
  apiKey: string;
  trialCode: string;
  trialStatus: TrialPublicStatus | null;
  messages: ChatMessage[];
  sessionCost: SessionCostState;
  isSending: boolean;
  lastError: NormalizedError | null;
  updateSettings: (partial: Partial<StudioSettings>) => void;
  setApiKeyForProvider: (provider: AiProvider, key: string) => void;
  setTrialCodeValue: (code: string) => void;
  refreshTrialStatus: () => Promise<boolean>;
  runConnectionTest: () => Promise<boolean>;
  sendMessage: (content: string) => Promise<void>;
  resetChat: () => void;
  clearEverything: () => void;
};

const DemoContext = createContext<DemoStore | null>(null);

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [settings, setSettingsState] = useState<StudioSettings>(getSettings());
  const [apiKey, setApiKeyState] = useState("");
  const [trialCode, setTrialCodeState] = useState("");
  const [trialStatus, setTrialStatus] = useState<TrialPublicStatus | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionCost, setSessionCost] = useState<SessionCostState>({
    totalJpy: 0,
    requestCount: 0,
  });
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<NormalizedError | null>(null);

  useEffect(() => {
    const s = getSettings();
    setSettingsState(s);
    setApiKeyState(getApiKey(s.provider));
    setTrialCodeState(getTrialCode());
    const chatRaw = getChatJson();
    if (chatRaw) {
      try {
        setMessages(JSON.parse(chatRaw) as ChatMessage[]);
      } catch {
        setMessages([]);
      }
    }
    const costRaw = getSessionCostJson();
    if (costRaw) {
      try {
        setSessionCost(JSON.parse(costRaw) as SessionCostState);
      } catch {
        /* ignore */
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setChatJson(JSON.stringify(messages));
  }, [messages, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (settings.accessMode === "managed-trial" && getTrialCode()) {
      void testTrialConnection(getTrialCode(), settings.provider).then(
        (result) => {
          if (result.ok) setTrialStatus(result.status);
        },
      );
    }
  }, [hydrated, settings.accessMode, settings.provider]);

  useEffect(() => {
    if (!hydrated) return;
    setSessionCostJson(JSON.stringify(sessionCost));
  }, [sessionCost, hydrated]);

  const updateSettings = useCallback((partial: Partial<StudioSettings>) => {
    const next = setSettings(partial);
    setSettingsState(next);
    if (partial.provider) {
      setApiKeyState(getApiKey(partial.provider));
    }
  }, []);

  const setApiKeyForProvider = useCallback(
    (provider: AiProvider, key: string) => {
      setApiKey(provider, key);
      if (provider === settings.provider) setApiKeyState(key);
    },
    [settings.provider],
  );

  const setTrialCodeValue = useCallback((code: string) => {
    persistTrialCode(code);
    setTrialCodeState(code);
  }, []);

  const refreshTrialStatus = useCallback(async () => {
    if (!trialCode.trim()) {
      setTrialStatus(null);
      return false;
    }
    const result = await testTrialConnection(trialCode, settings.provider);
    if (result.ok) {
      setTrialStatus(result.status);
      return true;
    }
    setTrialStatus(null);
    setLastError(result.error);
    return false;
  }, [settings.provider, trialCode]);

  const runConnectionTest = useCallback(async () => {
    updateSettings({ connectionStatus: "checking" satisfies ConnectionStatus });
    setLastError(null);

    if (settings.accessMode === "managed-trial") {
      const result = await testTrialConnection(trialCode, settings.provider);
      if (result.ok) {
        setTrialStatus(result.status);
        updateSettings({ connectionStatus: "success" });
        return true;
      }
      updateSettings({
        connectionStatus: connectionStatusFromError(result.error.code),
      });
      setLastError(result.error);
      return false;
    }

    const result = await testConnection({
      provider: settings.provider,
      apiKey,
      model: settings.model,
    });
    if (result.ok) {
      updateSettings({ connectionStatus: "success" });
      return true;
    }
    updateSettings({
      connectionStatus: connectionStatusFromError(result.error.code),
    });
    setLastError(result.error);
    return false;
  }, [
    apiKey,
    settings.accessMode,
    settings.model,
    settings.provider,
    trialCode,
    updateSettings,
  ]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isSending) return;

      const knowledgeStatus = evaluateKnowledge(settings.knowledge);
      if (!knowledgeStatus.withinHardLimit) {
        setLastError({
          code: "CONTEXT_TOO_LARGE",
          provider: settings.provider,
          userMessage: knowledgeStatus.message ?? "ナレッジが上限を超えています。",
          recommendedAction: "ナレッジを短くしてください。",
        });
        return;
      }

      const isTrial = settings.accessMode === "managed-trial";
      if (isTrial && !trialCode.trim()) {
        setLastError({
          code: "AUTH_ERROR",
          provider: settings.provider,
          userMessage: "体験コードが未設定です。",
          recommendedAction: "セットアップで体験コードを入力してください。",
        });
        return;
      }
      if (!isTrial && !apiKey) {
        setLastError({
          code: "AUTH_ERROR",
          provider: settings.provider,
          userMessage: "APIキーが未設定です。",
          recommendedAction: "セットアップでAPIキーを入力してください。",
        });
        return;
      }

      if (
        isTrial &&
        trialStatus &&
        trialStatus.remainingRequests <= 0
      ) {
        setLastError({
          code: "QUOTA_EXCEEDED",
          provider: settings.provider,
          userMessage: "体験の利用回数上限に達しました。",
          recommendedAction: "新しい体験コードについて運営にご相談ください。",
        });
        return;
      }

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };

      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setIsSending(true);
      setLastError(null);

      try {
        const history = nextMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const forApi = selectHistoryForApi(
          history,
          demoConfig.chat.maxHistoryMessages,
        );
        const systemPrompt = buildSystemPrompt({
          provider: settings.provider,
          roleId: settings.roleId,
          customInstruction: settings.customInstruction,
          knowledge: settings.knowledge,
        });

        const estimatedInputTokens =
          estimateTokens(systemPrompt) +
          forApi.reduce((sum, m) => sum + estimateTokens(m.content), 0);

        const result = await sendAiRequest(
          {
            accessMode: isTrial ? "managed-trial" : "byok-direct",
            provider: settings.provider,
            apiKey: isTrial ? undefined : apiKey,
            model: settings.model,
            systemPrompt,
            messages: forApi,
            maxOutputTokens: isTrial
              ? trialPolicyConfig.maxOutputTokens
              : undefined,
          },
          isTrial
            ? {
                trialCode,
                knowledgeCharCount: countCharacters(settings.knowledge),
                estimatedInputTokens,
              }
            : undefined,
        );

        const costJpy =
          result.costJpyOverride != null
            ? result.costJpyOverride
            : calculateCost(result.provider, result.model, result.usage).jpy;

        if (result.trialStatus) {
          setTrialStatus((prev) => ({
            valid: true,
            remainingRequests: result.trialStatus!.remainingRequests,
            maxRequests:
              result.trialStatus!.maxRequests ||
              prev?.maxRequests ||
              trialPolicyConfig.maxRequests,
            expiresAt: result.trialStatus!.expiresAt,
            spentJpy: result.trialStatus!.spentJpy,
            hardCapJpy:
              result.trialStatus!.hardCapJpy ||
              prev?.hardCapJpy ||
              trialPolicyConfig.hardCapJpy,
            revoked: false,
            expired: false,
            label: prev?.label,
          }));
        }

        const assistantMsg: ChatMessage = {
          id: uid(),
          role: "assistant",
          content: result.text || "（空の応答）",
          createdAt: Date.now(),
          usage: result.usage,
          costJpy,
          model: result.model,
          provider: result.provider,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setSessionCost((prev) => ({
          totalJpy: prev.totalJpy + (costJpy ?? 0),
          requestCount: prev.requestCount + 1,
        }));
      } catch (e) {
        const err =
          e instanceof AiTransportError
            ? e.normalized
            : {
                code: "UNKNOWN" as const,
                provider: settings.provider,
                userMessage: "送信に失敗しました。",
                recommendedAction: "もう一度お試しください。",
              };
        setLastError(err);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content: err.userMessage,
            createdAt: Date.now(),
            error: err.userMessage,
            provider: settings.provider,
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [apiKey, isSending, messages, settings, trialCode, trialStatus],
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    setSessionCost({ totalJpy: 0, requestCount: 0 });
    clearChatAndCost();
    setLastError(null);
  }, []);

  const clearEverything = useCallback(() => {
    clearAll();
    const fresh = getSettings();
    setSettingsState(fresh);
    setApiKeyState("");
    setTrialCodeState("");
    setTrialStatus(null);
    setMessages([]);
    setSessionCost({ totalJpy: 0, requestCount: 0 });
    setLastError(null);
  }, []);

  const value = useMemo<DemoStore>(
    () => ({
      hydrated,
      settings,
      apiKey,
      trialCode,
      trialStatus,
      messages,
      sessionCost,
      isSending,
      lastError,
      updateSettings,
      setApiKeyForProvider,
      setTrialCodeValue,
      refreshTrialStatus,
      runConnectionTest,
      sendMessage,
      resetChat,
      clearEverything,
    }),
    [
      hydrated,
      settings,
      apiKey,
      trialCode,
      trialStatus,
      messages,
      sessionCost,
      isSending,
      lastError,
      updateSettings,
      setApiKeyForProvider,
      setTrialCodeValue,
      refreshTrialStatus,
      runConnectionTest,
      sendMessage,
      resetChat,
      clearEverything,
    ],
  );

  return (
    <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
  );
}

export function useDemoStore(): DemoStore {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemoStore must be used within DemoProvider");
  return ctx;
}

export function useProviderLabel(): string {
  const { settings } = useDemoStore();
  return getProviderConfig(settings.provider)?.displayName ?? settings.provider;
}
