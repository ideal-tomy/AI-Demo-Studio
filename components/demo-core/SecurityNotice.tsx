"use client";

// UI-CANDIDATE
import { useState } from "react";

export function SecurityNotice({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  if (compact) {
    return (
      <p className="text-xs leading-relaxed text-[var(--brand-muted)]">
        このデモではAPIキーを運営者側の顧客データ保存用DBへ保存しません。標準では、このタブのセッション中のみ保持します。
        <button
          type="button"
          className="ml-1 underline"
          onClick={() => setOpen((v) => !v)}
        >
          詳細
        </button>
        {open ? <FullText /> : null}
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 text-sm">
      <p className="font-medium">安全上の注意</p>
      <FullText />
    </div>
  );
}

function FullText() {
  return (
    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[var(--brand-muted)]">
      <li>APIキーはブラウザ内（sessionStorage）に保持され、会話・ナレッジと共に外部AI Providerへ送信されます。</li>
      <li>漏洩リスクがゼロであること、本番推奨構成であることは主張しません。</li>
      <li>デモ専用キーの利用と、利用後の削除・ローテーションを推奨します。</li>
      <li>対面商談（運営者所有キー）では、終了後に全設定クリアを実施してください。</li>
    </ul>
  );
}
