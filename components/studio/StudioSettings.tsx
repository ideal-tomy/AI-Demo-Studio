"use client";

import { useState } from "react";
import { demoConfig } from "@/config/demo.config";
import { getProviderConfig } from "@/config/provider.config";
import {
  getTrialDefaultModel,
  getTrialDefaultProvider,
} from "@/config/trial-policy.config";
import { useDemoStore } from "@/lib/demo-store";
import { ApiKeyInput } from "@/components/demo-core/ApiKeyInput";
import { ClearSettingsButton } from "@/components/demo-core/ClearSettingsButton";
import { ConnectionStatus } from "@/components/demo-core/ConnectionStatus";
import { ErrorBanner } from "@/components/demo-core/ErrorBanner";
import { KnowledgeEditor } from "@/components/demo-core/KnowledgeEditor";
import { ModelSelector } from "@/components/demo-core/ModelSelector";
import { PromptEditor } from "@/components/demo-core/PromptEditor";
import { ProviderSelector } from "@/components/demo-core/ProviderSelector";
import { SecurityNotice } from "@/components/demo-core/SecurityNotice";
import { TrialCodeInput } from "@/components/trial/TrialCodeInput";
import {
  RemainingRequests,
  TrialLimitReached,
} from "@/components/trial/RemainingRequests";
import type { AiProvider } from "@/types/access-mode";

export function StudioSettings() {
  const {
    settings,
    apiKey,
    trialCode,
    trialStatus,
    lastError,
    updateSettings,
    setApiKeyForProvider,
    setTrialCodeValue,
    runConnectionTest,
  } = useDemoStore();
  const [testing, setTesting] = useState(false);
  const provider = getProviderConfig(settings.provider);
  const isTrial = settings.accessMode === "managed-trial";

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold">設定</h1>
        <p className="mt-1 text-sm text-[var(--brand-muted)]">
          Provider・キー・ナレッジ・用途をいつでも変更できます。
        </p>
      </div>

      <Section title="接続方式">
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              updateSettings({
                accessMode: "byok-direct",
                connectionStatus: "unchecked",
              })
            }
            className={`rounded-lg border px-3 py-2 text-left text-sm ${
              !isTrial
                ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]"
                : "border-[var(--brand-border)]"
            }`}
          >
            APIキー（BYOK）
          </button>
          <button
            type="button"
            onClick={() => {
              const p = getTrialDefaultProvider();
              const cfg = getProviderConfig(p);
              updateSettings({
                accessMode: "managed-trial",
                provider: p,
                model: getTrialDefaultModel() || cfg?.defaultModel || "gpt-5.4-nano",
                connectionStatus: "unchecked",
              });
            }}
            className={`rounded-lg border px-3 py-2 text-left text-sm ${
              isTrial
                ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]"
                : "border-[var(--brand-border)]"
            }`}
          >
            体験コード（OpenAI）
          </button>
        </div>
        {isTrial ? (
          <>
            <TrialCodeInput value={trialCode} onChange={setTrialCodeValue} />
            <div className="mt-3 space-y-2">
              <RemainingRequests status={trialStatus} />
              <TrialLimitReached status={trialStatus} />
            </div>
          </>
        ) : (
          <ApiKeyInput
            value={apiKey}
            onChange={(v) => setApiKeyForProvider(settings.provider, v)}
            hint={provider?.apiKeyHint}
          />
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={
              testing || (isTrial ? !trialCode.trim() : !apiKey.trim())
            }
            className="rounded-md bg-[var(--brand-accent)] px-3 py-1.5 text-sm text-white disabled:opacity-50"
            onClick={async () => {
              setTesting(true);
              await runConnectionTest();
              setTesting(false);
            }}
          >
            接続を確認
          </button>
          <ConnectionStatus status={settings.connectionStatus} />
        </div>
        <div className="mt-2">
          <ErrorBanner error={lastError} />
        </div>
      </Section>

      <Section title="利用するAI">
        {isTrial ? (
          <div className="mb-4 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-accent-soft)] px-3 py-3 text-sm">
            <p className="font-medium">OpenAI（体験コード固定）</p>
            <p className="mt-1 text-xs text-[var(--brand-muted)]">
              Managed Trial では Provider を変更できません。
            </p>
          </div>
        ) : (
          <ProviderSelector
            value={settings.provider}
            onChange={(p: AiProvider) => {
              const cfg = getProviderConfig(p);
              updateSettings({
                provider: p,
                model: cfg?.defaultModel ?? settings.model,
                connectionStatus: "unchecked",
              });
            }}
          />
        )}
        <div className={isTrial ? "" : "mt-4"}>
          <ModelSelector
            provider={settings.provider}
            value={settings.model}
            onChange={(model) =>
              updateSettings({ model, connectionStatus: "unchecked" })
            }
          />
        </div>
      </Section>

      <Section title="ナレッジ">
        <KnowledgeEditor
          value={settings.knowledge}
          onChange={(knowledge) => updateSettings({ knowledge })}
        />
      </Section>

      <Section title="AIの用途">
        <div className="mb-3 space-y-2">
          {demoConfig.rolePresets.map((role) => (
            <label
              key={role.id}
              className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2 text-sm ${
                settings.roleId === role.id
                  ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]"
                  : "border-[var(--brand-border)]"
              }`}
            >
              <input
                type="radio"
                checked={settings.roleId === role.id}
                onChange={() => updateSettings({ roleId: role.id })}
              />
              <span>{role.label}</span>
            </label>
          ))}
        </div>
        <PromptEditor
          value={settings.customInstruction}
          onChange={(customInstruction) =>
            updateSettings({ customInstruction })
          }
          rows={3}
        />
      </Section>

      <Section title="セキュリティとクリア">
        <SecurityNotice />
        <div className="mt-4">
          <ClearSettingsButton />
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 sm:p-5">
      <h2 className="mb-3 font-medium">{title}</h2>
      {children}
    </section>
  );
}
