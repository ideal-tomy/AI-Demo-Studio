import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg space-y-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">ページが見つかりません</h1>
      <p className="text-sm text-[var(--brand-muted)]">
        URL をご確認ください。
      </p>
      <Link href="/" className="text-[var(--brand-accent)] underline">
        トップへ戻る
      </Link>
    </div>
  );
}
