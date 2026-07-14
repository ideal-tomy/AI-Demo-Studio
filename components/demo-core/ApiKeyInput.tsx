"use client";

import { useState } from "react";

// UI-CANDIDATE
export function ApiKeyInput({
  value,
  onChange,
  hint,
  placeholder = "ここに貼り付け",
}: {
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">APIキー</span>
        <div className="flex gap-2">
          <input
            type={showKey ? "text" : "password"}
            autoComplete="off"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-[var(--brand-border)] px-3 py-2"
            placeholder={placeholder}
          />
          <button
            type="button"
            className="shrink-0 rounded-md border border-[var(--brand-border)] px-3 text-sm"
            onClick={() => setShowKey((v) => !v)}
          >
            {showKey ? "隠す" : "表示"}
          </button>
        </div>
      </label>
      {hint ? (
        <p className="text-xs text-[var(--brand-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
