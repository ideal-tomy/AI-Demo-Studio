"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { brandConfig } from "@/config/brand.config";
import { trialPolicyConfig } from "@/config/trial-policy.config";
import {
  resolveDemoEntry,
  safeReturnUrl,
} from "@/config/demo-catalog.config";

function TrialPortalInner() {
  const search = useSearchParams();
  const demoId = search.get("demo");
  const returnRaw = search.get("return");
  const demo = useMemo(() => resolveDemoEntry(demoId), [demoId]);
  const returnUrl = useMemo(() => safeReturnUrl(returnRaw), [returnRaw]);
  const contactUrl = brandConfig.contactUrl || brandConfig.ctaUrl;

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

      <section className="space-y-4 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5">
        <h2 className="text-lg font-medium">体験コードについて</h2>
        <p className="text-sm text-[var(--brand-text)]">
          体験コードご希望の方は、お問い合わせください。
        </p>
        <p className="rounded-lg bg-[var(--brand-accent-soft)] px-3 py-2 text-sm text-[var(--brand-text)]">
          お問い合わせ時に『体験コード希望』とご記載ください。
        </p>
        <p className="text-xs text-[var(--brand-muted)]">
          コードをお持ちの方は、各デモの「体験コードで接続」に入力してご利用ください。
          公開での自己発行は現在停止しています。
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={contactUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-md bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-medium text-white"
          >
            お問い合わせへ
          </a>
          {returnUrl ? (
            <a
              href={returnUrl}
              className="inline-flex rounded-md border border-[var(--brand-border)] px-4 py-2.5 text-sm"
            >
              デモに戻る
            </a>
          ) : (
            <Link
              href="/"
              className="inline-flex rounded-md border border-[var(--brand-border)] px-4 py-2.5 text-sm"
            >
              Studioのチャットへ
            </Link>
          )}
        </div>
      </section>

      <p className="text-center text-xs text-[var(--brand-muted)]">
        <Link href="/" className="underline">
          共通基盤のチャットデモ
        </Link>
        {" · "}
        <Link href="/admin/trial" className="underline">
          運営者の方
        </Link>
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
