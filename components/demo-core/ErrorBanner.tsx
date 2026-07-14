"use client";

// UI-CANDIDATE
import type { NormalizedError } from "@/types/errors";

export function ErrorBanner({
  error,
  onDismiss,
}: {
  error: NormalizedError | null;
  onDismiss?: () => void;
}) {
  if (!error) return null;
  return (
    <div
      className="animate-fade-up rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{error.userMessage}</p>
          <p className="mt-1 text-red-800/80">{error.recommendedAction}</p>
          {error.technicalDetail ? (
            <details className="mt-2 text-xs text-red-800/70">
              <summary className="cursor-pointer">詳細</summary>
              <pre className="mt-1 whitespace-pre-wrap break-all">
                {error.technicalDetail}
              </pre>
            </details>
          ) : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-xs underline"
          >
            閉じる
          </button>
        ) : null}
      </div>
    </div>
  );
}
