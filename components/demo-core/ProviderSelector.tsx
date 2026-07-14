"use client";

// UI-CANDIDATE
import { getEnabledProviders } from "@/config/provider.config";
import type { AiProvider } from "@/types/access-mode";

export function ProviderSelector({
  value,
  onChange,
}: {
  value: AiProvider;
  onChange: (p: AiProvider) => void;
}) {
  const providers = getEnabledProviders();
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {providers.map((p) => {
        const selected = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`rounded-lg border px-3 py-3 text-left transition ${
              selected
                ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]"
                : "border-[var(--brand-border)] bg-[var(--brand-surface)] hover:border-[var(--brand-accent)]"
            }`}
          >
            <div className="font-medium">{p.displayName}</div>
            <div className="mt-1 text-xs text-[var(--brand-muted)]">
              {selected ? "選択中" : "タップして選択"}
            </div>
          </button>
        );
      })}
    </div>
  );
}
