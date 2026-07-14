"use client";

// UI-CANDIDATE
import { getProviderConfig } from "@/config/provider.config";
import type { AiProvider } from "@/types/access-mode";

export function ModelSelector({
  provider,
  value,
  onChange,
}: {
  provider: AiProvider;
  value: string;
  onChange: (modelId: string) => void;
}) {
  const config = getProviderConfig(provider);
  if (!config) return null;

  return (
    <div className="space-y-2">
      {config.allowedModels.map((m) => {
        const selected = value === m.id;
        return (
          <label
            key={m.id}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 ${
              selected
                ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]"
                : "border-[var(--brand-border)] bg-[var(--brand-surface)]"
            }`}
          >
            <input
              type="radio"
              className="mt-1"
              name="model"
              checked={selected}
              onChange={() => onChange(m.id)}
            />
            <span>
              <span className="block font-medium">{m.label}</span>
              <span className="block text-sm text-[var(--brand-muted)]">
                {m.description}
              </span>
              <span className="mt-1 block text-[11px] text-[var(--brand-muted)] opacity-70">
                詳細: {m.id}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
