"use client";

import { DocumentUploadField } from "@/components/demo-core/DocumentUploadField";

// UI-CANDIDATE
export function PromptEditor({
  value,
  onChange,
  rows = 4,
  label = "カスタム指示",
  placeholder = "例: 回答は簡潔に。根拠がない場合は推測しないでください。",
  collapsible = false,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  label?: string;
  placeholder?: string;
  collapsible?: boolean;
}) {
  const body = (
    <div className="space-y-3">
      <label className="block text-sm">
        {!collapsible ? (
          <span className="mb-1 block font-medium">{label}</span>
        ) : null}
        <textarea
          className="w-full rounded-md border border-[var(--brand-border)] px-3 py-2 text-sm"
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </label>
      <div>
        <p className="mb-2 text-sm font-medium">またはファイルから読み込む</p>
        <DocumentUploadField
          target="prompt"
          onApply={(text) => onChange(text)}
        />
      </div>
    </div>
  );

  if (!collapsible) return body;

  return (
    <details className="rounded-lg border border-[var(--brand-border)] px-3 py-2">
      <summary className="cursor-pointer text-sm font-medium">
        詳細設定（{label}）
      </summary>
      <div className="mt-2">{body}</div>
    </details>
  );
}
