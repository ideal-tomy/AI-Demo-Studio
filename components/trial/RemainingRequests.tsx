"use client";

import { trialPolicyConfig } from "@/config/trial-policy.config";
import type { TrialPublicStatus } from "@/types/trial";

export function RemainingRequests({
  status,
  loading = false,
}: {
  status: TrialPublicStatus | null;
  loading?: boolean;
}) {
  const max = status?.maxRequests || trialPolicyConfig.maxRequests;
  const remaining =
    status != null ? status.remainingRequests : trialPolicyConfig.maxRequests;
  const spent = status?.spentJpy ?? 0;
  const hardCap = status?.hardCapJpy ?? trialPolicyConfig.hardCapJpy;

  return (
    <div className="rounded-xl border-2 border-[var(--brand-accent)] bg-[var(--brand-accent-soft)] px-4 py-3">
      <p className="text-xs font-medium text-[var(--brand-accent)]">
        体験コード利用中
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--brand-text)]">
        {loading && !status ? (
          <span className="animate-pulse-soft text-lg">残回数を確認中…</span>
        ) : (
          <>
            残り {remaining} / {max} 回
          </>
        )}
      </p>
      <ExpirationNotice expiresAt={status?.expiresAt} />
      <details className="mt-2 text-xs text-[var(--brand-muted)]">
        <summary className="cursor-pointer">利用枠の詳細（金額）</summary>
        <p className="mt-1">
          消費 約¥{spent.toFixed(1)} / 上限 ¥{hardCap}
          （主表示は残回数です）
        </p>
      </details>
    </div>
  );
}

export function ExpirationNotice({ expiresAt }: { expiresAt?: string }) {
  if (!expiresAt) {
    return (
      <p className="mt-1 text-xs text-[var(--brand-muted)]">
        有効期限は接続確認後に表示されます
      </p>
    );
  }
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return null;
  return (
    <p className="mt-1 text-sm text-[var(--brand-muted)]">
      有効期限 {d.toLocaleDateString("ja-JP")}
    </p>
  );
}

export function TrialLimitReached({
  status,
}: {
  status: TrialPublicStatus | null;
}) {
  if (!status) return null;
  const limited =
    status.revoked ||
    status.expired ||
    status.remainingRequests <= 0;
  if (!limited) return null;
  return (
    <div
      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
      role="status"
    >
      {status.revoked
        ? "この体験コードは失効しています。"
        : status.expired
          ? "体験期間が終了しています。"
          : "体験の利用回数上限に達しました。"}
      続行が必要な場合は運営ブランドへご相談ください。
    </div>
  );
}
