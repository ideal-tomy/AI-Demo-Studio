"use client";

// UI-CANDIDATE
import type { ConnectionStatus } from "@/types/access-mode";

const LABELS: Record<ConnectionStatus, string> = {
  unchecked: "未確認",
  checking: "確認中…",
  success: "接続成功",
  auth_error: "認証エラー",
  permission_error: "権限エラー",
  model_unavailable: "モデル利用不可",
  network_error: "通信エラー",
  other_error: "その他エラー",
};

export function ConnectionStatus({ status }: { status: string }) {
  const s = (status in LABELS ? status : "unchecked") as ConnectionStatus;
  const ok = s === "success";
  const busy = s === "checking";
  const bad = !ok && !busy && s !== "unchecked";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
        ok
          ? "bg-emerald-50 text-emerald-800"
          : bad
            ? "bg-red-50 text-red-800"
            : busy
              ? "bg-amber-50 text-amber-800 animate-pulse-soft"
              : "bg-[var(--brand-accent-soft)] text-[var(--brand-muted)]"
      }`}
      role="status"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          ok ? "bg-emerald-600" : bad ? "bg-red-600" : "bg-[var(--brand-muted)]"
        }`}
        aria-hidden
      />
      {LABELS[s]}
    </span>
  );
}
