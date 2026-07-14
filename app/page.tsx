"use client";

import Link from "next/link";
import { brandConfig } from "@/config/brand.config";
import { demoConfig } from "@/config/demo.config";
import { useDemoStore } from "@/lib/demo-store";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function HomePage() {
  const { hydrated, settings, trialStatus } = useDemoStore();
  const isTrial = settings.accessMode === "managed-trial";

  if (!hydrated) {
    return (
      <p className="animate-pulse-soft text-sm text-[var(--brand-muted)]">
        読み込み中…
      </p>
    );
  }

  if (!settings.setupComplete) {
    return (
      <div className="mx-auto max-w-xl animate-fade-up py-10 text-center sm:py-16">
        <p
          className="text-4xl font-semibold tracking-tight sm:text-5xl"
          style={{ color: "var(--brand-accent)" }}
        >
          {brandConfig.logoText}
        </p>
        <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">
          自社の情報で、AIを試す。
        </h1>
        <p className="mt-4 text-[var(--brand-muted)]">
          APIキー、または体験コードと自社ナレッジを設定すると、
          <br className="hidden sm:block" />
          その場で自社専用AIとして動き始めます。
        </p>
        <p className="mt-2 text-sm text-[var(--brand-muted)]">
          {demoConfig.description}
        </p>
        <Link
          href="/setup"
          className="mt-8 inline-block rounded-md bg-[var(--brand-accent)] px-6 py-3 text-white"
        >
          セットアップを開始
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">体験</h1>
          <p className="text-sm text-[var(--brand-muted)]">
            {isTrial
              ? trialStatus
                ? `体験コード利用中 · 残り ${trialStatus.remainingRequests} / ${trialStatus.maxRequests} 回`
                : "体験コード利用中 · 残回数を確認しています"
              : "貼り付けたナレッジを根拠に回答します。"}
          </p>
        </div>
        <Link
          href="/studio"
          className="text-sm text-[var(--brand-accent)] underline"
        >
          設定を変更
        </Link>
      </div>
      <ChatInterface />
    </div>
  );
}
