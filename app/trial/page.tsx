"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { trialPolicyConfig } from "@/config/trial-policy.config";
import {
  resolveDemoEntry,
  safeReturnUrl,
} from "@/config/demo-catalog.config";

type Issued = {
  plaintextCode: string;
  shortId: string;
  label: string;
  expiresAt: string;
  maxRequests: number;
  hardCapJpy: number;
  message: string;
};

function TrialPortalInner() {
  const search = useSearchParams();
  const demoId = search.get("demo");
  const returnRaw = search.get("return");
  const demo = useMemo(() => resolveDemoEntry(demoId), [demoId]);
  const returnUrl = useMemo(() => safeReturnUrl(returnRaw), [returnRaw]);

  const [companyLabel, setCompanyLabel] = useState("");
  const [issued, setIssued] = useState<Issued | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const issue = async () => {
    setBusy(true);
    setError(null);
    setIssued(null);
    try {
      const res = await fetch("/api/trial/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demo: demo.id,
          companyLabel: companyLabel || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? "発行に失敗しました");
        return;
      }
      setIssued(data as Issued);
    } catch {
      setError("通信に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6 animate-fade-up">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--brand-muted)]">
          AI Demo Platform
        </p>
        <h1 className="mt-1 text-2xl font-semibold">{demo.title}</h1>
        <p className="mt-2 text-sm text-[var(--brand-muted)]">{demo.blurb}</p>
        <p className="mt-2 text-xs text-[var(--brand-muted)]">
          標準枠: {trialPolicyConfig.maxRequests}回 · 有効{" "}
          {trialPolicyConfig.validityDays}日 · 上限目安 ¥
          {trialPolicyConfig.publicBudgetLabelJpy}
        </p>
      </div>

      {!issued ? (
        <section className="space-y-3 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
          <label className="block text-sm">
            会社名・ご担当者名（任意）
            <input
              className="mt-1 w-full rounded-md border border-[var(--brand-border)] px-3 py-2"
              value={companyLabel}
              onChange={(e) => setCompanyLabel(e.target.value)}
              placeholder="例: 株式会社ミナトテック"
              maxLength={60}
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void issue()}
            className="w-full rounded-md bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {busy ? "発行中…" : "体験コードを取得"}
          </button>
          <p className="text-xs text-[var(--brand-muted)]">
            APIキーは不要です。取得したコードを各デモの「体験コードで試す」に入力してください。
          </p>
        </section>
      ) : (
        <section className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-medium text-amber-900">{issued.message}</p>
          <p className="break-all font-mono text-lg text-amber-950">
            {issued.plaintextCode}
          </p>
          <p className="text-xs text-amber-800">
            ID: {issued.shortId} · 期限{" "}
            {new Date(issued.expiresAt).toLocaleString("ja-JP")} ·{" "}
            {issued.maxRequests}回 · 上限約¥{issued.hardCapJpy}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs"
              onClick={() => void navigator.clipboard.writeText(issued.plaintextCode)}
            >
              コードをコピー
            </button>
            {returnUrl ? (
              <a
                href={returnUrl}
                className="rounded-md bg-[var(--brand-accent)] px-3 py-1.5 text-xs text-white"
              >
                デモに戻る
              </a>
            ) : (
              <Link
                href="/"
                className="rounded-md bg-[var(--brand-accent)] px-3 py-1.5 text-xs text-white"
              >
                Studioのチャットへ
              </Link>
            )}
          </div>
        </section>
      )}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      <p className="text-center text-xs text-[var(--brand-muted)]">
        <Link href="/" className="underline">
          共通基盤のチャットデモ
        </Link>
        {" · "}
        管理者向けは別画面です
      </p>
    </div>
  );
}

export default function TrialPortalPage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-[var(--brand-muted)]">読み込み中…</p>
      }
    >
      <TrialPortalInner />
    </Suspense>
  );
}
