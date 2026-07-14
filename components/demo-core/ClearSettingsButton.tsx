"use client";

// UI-CANDIDATE
import { useState } from "react";
import { useDemoStore } from "@/lib/demo-store";

export function ClearSettingsButton() {
  const { clearEverything, resetChat } = useDemoStore();
  const [confirm, setConfirm] = useState<"none" | "chat" | "all">("none");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setConfirm("chat")}
          className="rounded-md border border-[var(--brand-border)] px-3 py-1.5 text-sm hover:bg-[var(--brand-accent-soft)]"
        >
          会話をリセット
        </button>
        <button
          type="button"
          onClick={() => setConfirm("all")}
          className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-800 hover:bg-red-50"
        >
          全設定をクリア
        </button>
      </div>

      {confirm !== "none" ? (
        <div
          className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3 text-sm"
          role="dialog"
          aria-modal="true"
        >
          <p>
            {confirm === "all"
              ? "APIキー・ナレッジ・会話・累計コストをすべて削除します。よろしいですか？"
              : "会話履歴と累計コストを削除します。よろしいですか？"}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="rounded-md bg-[var(--brand-accent)] px-3 py-1.5 text-white"
              onClick={() => {
                if (confirm === "all") clearEverything();
                else resetChat();
                setConfirm("none");
              }}
            >
              削除する
            </button>
            <button
              type="button"
              className="rounded-md border border-[var(--brand-border)] px-3 py-1.5"
              onClick={() => setConfirm("none")}
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
