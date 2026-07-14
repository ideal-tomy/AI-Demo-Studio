"use client";

export function TrialCodeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">体験コード</span>
      <input
        type="password"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        className="w-full rounded-md border border-[var(--brand-border)] px-3 py-2 font-mono text-sm"
        placeholder="運営から共有されたコードを入力"
      />
      <span className="mt-1 block text-xs text-[var(--brand-muted)]">
        APIキーは不要です。コードはタブのセッション中のみ保持します。
      </span>
    </label>
  );
}
