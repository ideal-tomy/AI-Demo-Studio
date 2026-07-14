// UI-CANDIDATE
export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "warn";
}) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-800"
      : tone === "warn"
        ? "bg-amber-50 text-amber-900"
        : "bg-[var(--brand-accent-soft)] text-[var(--brand-muted)]";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ${cls}`}>
      {children}
    </span>
  );
}
