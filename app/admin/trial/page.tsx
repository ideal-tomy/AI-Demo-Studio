"use client";

import { useCallback, useState } from "react";

type TrialListItem = {
  shortId: string;
  codeHash: string;
  label: string;
  createdAt: string;
  expiresAt: string;
  remainingRequests: number;
  maxRequests: number;
  spentJpy: number;
  revoked: boolean;
  expired: boolean;
};

type Issued = {
  plaintextCode: string;
  shortId: string;
  label: string;
  expiresAt: string;
  maxRequests: number;
  hardCapJpy: number;
  message: string;
};

export default function AdminTrialPage() {
  const [secret, setSecret] = useState("");
  const [label, setLabel] = useState("");
  const [items, setItems] = useState<TrialListItem[]>([]);
  const [issued, setIssued] = useState<Issued | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      "X-Admin-Secret": secret,
    }),
    [secret],
  );

  const refresh = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/trial", { headers: headers() });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? "一覧の取得に失敗しました");
        return;
      }
      setItems(data.items ?? []);
    } catch {
      setError("通信に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const issue = async () => {
    setBusy(true);
    setError(null);
    setIssued(null);
    try {
      const res = await fetch("/api/admin/trial", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ label: label || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? "発行に失敗しました");
        return;
      }
      setIssued(data as Issued);
      await refresh();
    } catch {
      setError("通信に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (codeHash: string) => {
    if (!confirm("この体験コードを失効しますか？")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/trial/revoke", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ codeHash }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message ?? "失効に失敗しました");
        return;
      }
      await refresh();
    } catch {
      setError("通信に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold">Managed Trial 管理</h1>
        <p className="mt-1 text-sm text-[var(--brand-muted)]">
          体験コードの発行・一覧・即時失効。Provider APIキーはここには表示されません。
        </p>
      </div>

      <section className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 space-y-3">
        <label className="block text-sm">
          <span className="font-medium">運営者シークレット</span>
          <input
            type="password"
            autoComplete="off"
            className="mt-1 w-full rounded-md border border-[var(--brand-border)] px-3 py-2"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="TRIAL_ADMIN_SECRET"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!secret || busy}
            onClick={() => void refresh()}
            className="rounded-md border border-[var(--brand-border)] px-3 py-1.5 text-sm disabled:opacity-40"
          >
            一覧を更新
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 space-y-3">
        <h2 className="font-medium">新規発行</h2>
        <label className="block text-sm">
          ラベル（任意・社名など）
          <input
            className="mt-1 w-full rounded-md border border-[var(--brand-border)] px-3 py-2"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="〇〇株式会社様"
          />
        </label>
        <button
          type="button"
          disabled={!secret || busy}
          onClick={() => void issue()}
          className="rounded-md bg-[var(--brand-accent)] px-4 py-2 text-sm text-white disabled:opacity-40"
        >
          体験コードを発行
        </button>
        {issued ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
            <p className="font-medium text-amber-900">{issued.message}</p>
            <p className="mt-2 break-all font-mono text-base text-amber-950">
              {issued.plaintextCode}
            </p>
            <p className="mt-2 text-xs text-amber-800">
              ID: {issued.shortId} · 期限 {new Date(issued.expiresAt).toLocaleString("ja-JP")} ·{" "}
              {issued.maxRequests}回 · 上限約¥{issued.hardCapJpy}
            </p>
            <button
              type="button"
              className="mt-2 underline text-xs"
              onClick={async () => {
                await navigator.clipboard.writeText(issued.plaintextCode);
              }}
            >
              コードをコピー
            </button>
          </div>
        ) : null}
      </section>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      <section className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
        <h2 className="mb-3 font-medium">発行一覧</h2>
        {items.length === 0 ? (
          <p className="text-sm text-[var(--brand-muted)]">
            まだありません。「一覧を更新」で読み込みます。
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.codeHash}
                className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--brand-border)] pb-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {item.label}{" "}
                    <span className="font-mono text-xs text-[var(--brand-muted)]">
                      {item.shortId}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--brand-muted)]">
                    残り {item.remainingRequests} / {item.maxRequests} · 期限{" "}
                    {new Date(item.expiresAt).toLocaleDateString("ja-JP")} · 消費 約¥
                    {item.spentJpy.toFixed(1)}
                    {item.revoked ? " · 失効済" : ""}
                    {item.expired ? " · 期限切れ" : ""}
                  </p>
                </div>
                {!item.revoked ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void revoke(item.codeHash)}
                    className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-800"
                  >
                    失効
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
