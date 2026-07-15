"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { demoConfig } from "@/config/demo.config";
import { getProviderConfig } from "@/config/provider.config";
import {
  getTrialDefaultModel,
  getTrialDefaultProvider,
} from "@/config/trial-policy.config";
import { evaluateKnowledge } from "@/lib/demo-core/knowledge";
import { useDemoStore } from "@/lib/demo-store";
import { ApiKeyInput } from "@/components/demo-core/ApiKeyInput";
import { ConnectionStatus } from "@/components/demo-core/ConnectionStatus";
import { ErrorBanner } from "@/components/demo-core/ErrorBanner";
import { KnowledgeEditor } from "@/components/demo-core/KnowledgeEditor";
import { ModelSelector } from "@/components/demo-core/ModelSelector";
import { PromptEditor } from "@/components/demo-core/PromptEditor";
import { ProviderSelector } from "@/components/demo-core/ProviderSelector";
import { SecurityNotice } from "@/components/demo-core/SecurityNotice";
import { TrialCodeInput } from "@/components/trial/TrialCodeInput";
import type { AiProvider } from "@/types/access-mode";

// UI-CANDIDATE
const STEPS = ["AI選択", "接続", "ナレッジ", "用途", "確認"] as const;

function applyTrialOpenAiDefaults(
  updateSettings: (partial: Parameters<ReturnType<typeof useDemoStore>["updateSettings"]>[0]) => void,
) {
  const provider = getTrialDefaultProvider();
  const cfg = getProviderConfig(provider);
  updateSettings({
    accessMode: "managed-trial",
    provider,
    model: getTrialDefaultModel() || cfg?.defaultModel || "gpt-5.4-nano",
    connectionStatus: "unchecked",
  });
}

export function SetupWizard() {
  const router = useRouter();
  const {
    settings,
    apiKey,
    trialCode,
    lastError,
    updateSettings,
    setApiKeyForProvider,
    setTrialCodeValue,
    runConnectionTest,
    refreshTrialStatus,
  } = useDemoStore();
  const [step, setStep] = useState(0);
  const [testing, setTesting] = useState(false);

  const provider = getProviderConfig(settings.provider);
  const isTrial = settings.accessMode === "managed-trial";
  const knowledgeStatus = useMemo(
    () => evaluateKnowledge(settings.knowledge),
    [settings.knowledge],
  );

  const canNext = () => {
    if (step === 0) return Boolean(settings.provider && settings.model);
    if (step === 1) {
      return isTrial ? trialCode.trim().length > 0 : apiKey.trim().length > 0;
    }
    if (step === 2)
      return knowledgeStatus.withinHardLimit && settings.knowledge.trim().length > 0;
    if (step === 3) return Boolean(settings.roleId);
    return true;
  };

  const finish = () => {
    updateSettings({ setupComplete: true });
    if (settings.accessMode === "managed-trial") {
      void refreshTrialStatus();
    }
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          セットアップ
        </h1>
        <p className="mt-2 text-[var(--brand-muted)]">
          数分で、自社情報を参照するAI体験を始められます。
        </p>
      </div>

      <ol className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`rounded-full px-3 py-1 text-xs ${
              i === step
                ? "bg-[var(--brand-accent)] text-white"
                : i < step
                  ? "bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]"
                  : "bg-[var(--brand-surface)] text-[var(--brand-muted)] border border-[var(--brand-border)]"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-sm sm:p-6">
        {step === 0 && (
          <section className="space-y-5">
            <div>
              <h2 className="text-lg font-medium">利用するAI</h2>
              <p className="mt-1 text-sm text-[var(--brand-muted)]">
                主役はモデル比較ではなく、自社データで動くことです。
                {isTrial
                  ? " 体験コード利用時は OpenAI のみです。"
                  : ""}
              </p>
            </div>
            {isTrial ? (
              <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-accent-soft)] px-3 py-3 text-sm">
                <p className="font-medium">OpenAI（体験コード固定）</p>
                <p className="mt-1 text-xs text-[var(--brand-muted)]">
                  Managed Trial は OpenAI の軽量モデルのみ利用できます。
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
                }
                }
              />
            )}
            <div>
              <h3 className="mb-2 text-sm font-medium">モデル</h3>
              <ModelSelector
                provider={settings.provider}
                value={settings.model}
                onChange={(model) =>
                  updateSettings({ model, connectionStatus: "unchecked" })
                }
              />
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-medium">接続方法</h2>
              <p className="mt-1 text-sm text-[var(--brand-muted)]">
                ご自身のAPIキー、または運営から共有された体験コードで開始できます。
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  updateSettings({
                    accessMode: "byok-direct",
                    connectionStatus: "unchecked",
                  })
                }
                className={`rounded-lg border px-3 py-3 text-left text-sm ${
                  !isTrial
                    ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]"
                    : "border-[var(--brand-border)]"
                }`}
              >
                <span className="font-medium">APIキーで接続</span>
                <span className="mt-1 block text-xs text-[var(--brand-muted)]">
                  ご自身のProviderキーを使用（BYOK）
                </span>
              </button>
              <button
                type="button"
                onClick={() => applyTrialOpenAiDefaults(updateSettings)}
                className={`rounded-lg border px-3 py-3 text-left text-sm ${
                  isTrial
                    ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]"
                    : "border-[var(--brand-border)]"
                }`}
              >
                <span className="font-medium">体験コードで接続</span>
                <span className="mt-1 block text-xs text-[var(--brand-muted)]">
                  APIキー不要 · OpenAI のみ
                </span>
              </button>
            </div>

            {isTrial ? (
              <>
                <TrialCodeInput
                  value={trialCode}
                  onChange={setTrialCodeValue}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/admin/trial"
                    className="inline-flex rounded-md border border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] px-4 py-2 text-sm font-medium text-[var(--brand-accent)]"
                  >
                    体験コード取得
                  </Link>
                  <span className="text-xs text-[var(--brand-muted)]">
                    コードをお持ちでない方はこちら（お問い合わせ／運営者）
                  </span>
                </div>
                <p className="text-xs text-[var(--brand-muted)]">
                  体験は回数・期間・金額上限でサーバ側に制限されます。Provider
                  は OpenAI 固定です。
                </p>
              </>
            ) : (
              <>
                <ApiKeyInput
                  value={apiKey}
                  onChange={(v) =>
                    setApiKeyForProvider(settings.provider, v)
                  }
                  hint={provider?.apiKeyHint}
                />
                <SecurityNotice compact />
              </>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={
                  testing ||
                  (isTrial ? !trialCode.trim() : !apiKey.trim())
                }
                onClick={async () => {
                  setTesting(true);
                  await runConnectionTest();
                  setTesting(false);
                }}
                className="rounded-md bg-[var(--brand-accent)] px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                接続を確認
              </button>
              <ConnectionStatus status={settings.connectionStatus} />
            </div>
            <ErrorBanner error={lastError} />
            {!isTrial ? (
              <div className="rounded-lg bg-[var(--brand-accent-soft)] px-3 py-2 text-xs text-[var(--brand-muted)]">
                <p className="font-medium text-[var(--brand-text)]">
                  APIキーをお持ちでない方へ
                </p>
                <ul className="mt-1 list-disc pl-4">
                  <li>
                    上の「体験コードで接続」を選ぶ（運営からコードを受け取った場合）
                  </li>
                  {provider?.apiKeyHelpUrl ? (
                    <li>
                      <a
                        href={provider.apiKeyHelpUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {provider.displayName}のキー取得手順
                      </a>
                    </li>
                  ) : null}
                  <li>次のステップでサンプルナレッジを利用できます</li>
                </ul>
              </div>
            ) : null}
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-medium">自社ナレッジ</h2>
              <p className="mt-1 text-sm text-[var(--brand-muted)]">
                規定・FAQ・マニュアルなど、参照させたい文書を貼り付けるか、ファイルから読み込んでください。
              </p>
            </div>
            <KnowledgeEditor
              value={settings.knowledge}
              onChange={(knowledge) => updateSettings({ knowledge })}
              rows={12}
              showSampleButton
            />
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-medium">AIの用途</h2>
              <p className="mt-1 text-sm text-[var(--brand-muted)]">
                システムプロンプトをゼロから書かなくても使えます。
              </p>
            </div>
            <div className="space-y-2">
              {demoConfig.rolePresets.map((role) => (
                <label
                  key={role.id}
                  className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-3 ${
                    settings.roleId === role.id
                      ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]"
                      : "border-[var(--brand-border)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={settings.roleId === role.id}
                    onChange={() => updateSettings({ roleId: role.id })}
                  />
                  <span>
                    <span className="block font-medium">{role.label}</span>
                    <span className="block text-sm text-[var(--brand-muted)]">
                      {role.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <PromptEditor
              value={settings.customInstruction}
              onChange={(customInstruction) =>
                updateSettings({ customInstruction })
              }
              collapsible
            />
          </section>
        )}

        {step === 4 && (
          <section className="space-y-3 text-sm">
            <h2 className="text-lg font-medium">確認</h2>
            <ReviewRow
              label="接続方式"
              value={
                isTrial
                  ? "体験コード（Managed Trial / OpenAI）"
                  : "APIキー（BYOK）"
              }
            />
            <ReviewRow label="AI" value={provider?.displayName ?? ""} />
            <ReviewRow label="モデル" value={settings.model} />
            <ReviewRow
              label="接続"
              value={
                settings.connectionStatus === "success"
                  ? "確認済み"
                  : "未確認（後からでも可）"
              }
            />
            <ReviewRow
              label="ナレッジ"
              value={`${knowledgeStatus.characters.toLocaleString()}文字`}
            />
            <ReviewRow
              label="用途"
              value={
                demoConfig.rolePresets.find((r) => r.id === settings.roleId)
                  ?.label ?? ""
              }
            />
            <SecurityNotice compact />
          </section>
        )}

        <div className="mt-6 flex justify-between gap-3">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-md border border-[var(--brand-border)] px-4 py-2 text-sm disabled:opacity-40"
          >
            戻る
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canNext()}
              onClick={() => setStep((s) => s + 1)}
              className="rounded-md bg-[var(--brand-accent)] px-4 py-2 text-sm text-white disabled:opacity-40"
            >
              次へ
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="rounded-md bg-[var(--brand-accent)] px-4 py-2 text-sm text-white"
            >
              体験を始める
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--brand-border)] py-2">
      <span className="text-[var(--brand-muted)]">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
