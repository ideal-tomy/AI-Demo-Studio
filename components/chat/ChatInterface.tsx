"use client";

import { useEffect, useRef, useState } from "react";
import { demoConfig } from "@/config/demo.config";
import { getProviderConfig } from "@/config/provider.config";
import { pricingConfig } from "@/config/pricing.config";
import { formatJpy } from "@/lib/demo-core/pricing";
import { useDemoStore } from "@/lib/demo-store";
import { CostCounter } from "@/components/demo-core/CostCounter";
import { ErrorBanner } from "@/components/demo-core/ErrorBanner";
import { StatusPill } from "@/components/demo-core/StatusPill";
import {
  RemainingRequests,
  TrialLimitReached,
} from "@/components/trial/RemainingRequests";
import type { ChatMessage } from "@/types/chat";

export function ChatInterface() {
  const {
    settings,
    trialStatus,
    messages,
    sessionCost,
    isSending,
    lastError,
    sendMessage,
    refreshTrialStatus,
  } = useDemoStore();
  const isTrial = settings.accessMode === "managed-trial";
  const [draft, setDraft] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const provider = getProviderConfig(settings.provider);
  const pricingUpdatedAt = pricingConfig.providers.find(
    (p) => p.providerId === settings.provider,
  )?.updatedAt;
  const lastCost = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.costJpy != null)?.costJpy;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    if (!isTrial) return;
    let cancelled = false;
    setStatusLoading(true);
    void refreshTrialStatus().finally(() => {
      if (!cancelled) setStatusLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isTrial, refreshTrialStatus]);

  const onSubmit = async () => {
    const text = draft;
    setDraft("");
    await sendMessage(text);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="order-2 space-y-3 lg:order-1">
        {isTrial ? (
          <>
            <RemainingRequests status={trialStatus} loading={statusLoading} />
            <TrialLimitReached status={trialStatus} />
          </>
        ) : null}
        <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3 text-sm">
          <p className="text-xs text-[var(--brand-muted)]">現在の設定</p>
          <div className="mt-2 space-y-2">
            <StatusPill tone={isTrial ? "ok" : "neutral"}>
              {isTrial ? "体験コード" : "BYOK"} · {provider?.displayName}
            </StatusPill>
            <p className="text-xs text-[var(--brand-muted)]">
              モデル: {settings.model}
            </p>
            <p className="text-xs text-[var(--brand-muted)]">
              ナレッジ: {[...settings.knowledge].length.toLocaleString()}文字
            </p>
            <p className="text-xs text-[var(--brand-muted)]">
              用途:{" "}
              {demoConfig.rolePresets.find((r) => r.id === settings.roleId)
                ?.label ?? "—"}
            </p>
          </div>
        </div>
        {!isTrial ? (
          <CostCounter
            sessionTotal={sessionCost.totalJpy}
            lastCost={lastCost}
            requestCount={sessionCost.requestCount}
            pricingUpdatedAt={pricingUpdatedAt}
          />
        ) : null}
      </aside>

      <section className="order-1 flex min-h-[60vh] flex-col rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] lg:order-2">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.length === 0 ? (
            <EmptyState onPick={(q) => setDraft(q)} />
          ) : (
            messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
          {isSending ? (
            <p className="animate-pulse-soft text-sm text-[var(--brand-muted)]">
              回答を生成しています…
            </p>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-[var(--brand-border)] p-3 sm:p-4">
          <ErrorBanner error={lastError} />
          <div className="mt-2 flex gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder="質問を入力（Enterで送信 / Shift+Enterで改行）"
              className="w-full resize-none rounded-md border border-[var(--brand-border)] px-3 py-2 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void onSubmit();
                }
              }}
              disabled={isSending}
            />
            <button
              type="button"
              disabled={isSending || !draft.trim()}
              onClick={() => void onSubmit()}
              className="shrink-0 self-end rounded-md bg-[var(--brand-accent)] px-4 py-2 text-sm text-white disabled:opacity-40"
            >
              送信
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="animate-fade-up py-8 text-center">
      <p className="text-lg font-medium">自社の情報で、聞いてみる</p>
      <p className="mt-2 text-sm text-[var(--brand-muted)]">
        例の質問から始めるか、自由に入力してください。
      </p>
      <div className="mx-auto mt-6 flex max-w-md flex-col gap-2">
        {demoConfig.exampleQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="rounded-lg border border-[var(--brand-border)] px-3 py-2 text-left text-sm hover:bg-[var(--brand-accent-soft)]"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={`animate-fade-up flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed sm:max-w-[80%] ${
          isUser
            ? "bg-[var(--brand-accent)] text-white"
            : message.error
              ? "border border-red-200 bg-red-50 text-red-900"
              : "bg-[var(--brand-accent-soft)] text-[var(--brand-text)]"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser && !message.error ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] opacity-70">
            {message.usage ? (
              <span>
                in {message.usage.inputTokens ?? "—"} / out{" "}
                {message.usage.outputTokens ?? "—"}
                {message.usage.cachedInputTokens
                  ? ` / cached ${message.usage.cachedInputTokens}`
                  : ""}
              </span>
            ) : null}
            {message.costJpy != null ? (
              <span>{formatJpy(message.costJpy)}</span>
            ) : null}
            <CopyButton text={message.content} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="underline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* ignore */
        }
      }}
    >
      {done ? "コピー済み" : "コピー"}
    </button>
  );
}
