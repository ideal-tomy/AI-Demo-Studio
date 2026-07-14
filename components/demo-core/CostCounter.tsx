"use client";

// UI-CANDIDATE
import { formatJpy } from "@/lib/demo-core/pricing";

export function CostCounter({
  sessionTotal,
  lastCost,
  requestCount,
  pricingUpdatedAt,
}: {
  sessionTotal: number;
  lastCost?: number | null;
  requestCount: number;
  pricingUpdatedAt?: string | null;
}) {
  return (
    <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[var(--brand-muted)]">セッション累計</span>
        <span className="font-medium">{formatJpy(sessionTotal)}</span>
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-2 text-xs text-[var(--brand-muted)]">
        <span>
          {requestCount}回
          {lastCost != null ? ` · 直前 ${formatJpy(lastCost)}` : ""}
        </span>
        {pricingUpdatedAt ? <span>料金表 {pricingUpdatedAt}</span> : null}
      </div>
    </div>
  );
}
