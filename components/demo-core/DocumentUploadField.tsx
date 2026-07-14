"use client";

// UI-CANDIDATE
import { useCallback, useId, useMemo, useRef, useState } from "react";
import {
  acceptAttribute,
  DocumentIngestError,
  extractDocumentText,
  formatHelpLabel,
  type ExtractResult,
  type IngestTarget,
} from "@/lib/demo-core/document-text-ingest";
import { evaluateKnowledge, estimateTokens } from "@/lib/demo-core/knowledge";

type Props = {
  target: IngestTarget;
  onApply: (text: string) => void;
};

export function DocumentUploadField({ target, onApply }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ExtractResult | null>(null);

  const knowledgeStatus = useMemo(
    () => (preview && target === "knowledge" ? evaluateKnowledge(preview.text) : null),
    [preview, target],
  );

  const canApply =
    Boolean(preview?.text.trim()) &&
    (target !== "knowledge" || knowledgeStatus?.withinHardLimit !== false);

  const resetPreview = useCallback(() => {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file) return;
      setBusy(true);
      setError(null);
      setPreview(null);
      try {
        const result = await extractDocumentText(file, target);
        setPreview(result);
      } catch (err) {
        const message =
          err instanceof DocumentIngestError
            ? err.message
            : "ファイルの処理中にエラーが発生しました。";
        setError(message);
      } finally {
        setBusy(false);
      }
    },
    [target],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      void handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="space-y-3">
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-lg border border-dashed px-3 py-4 text-center transition-colors ${
          dragging
            ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]"
            : "border-[var(--brand-border)]"
        }`}
      >
        <p className="text-sm text-[var(--brand-muted)]">
          {formatHelpLabel(target)}をドロップ、または
        </p>
        <label
          htmlFor={inputId}
          className="mt-2 inline-block cursor-pointer text-sm font-medium text-[var(--brand-accent)] underline"
        >
          ファイルを選択
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          accept={acceptAttribute(target)}
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            void handleFile(file);
          }}
        />
        <p className="mt-2 text-xs text-[var(--brand-muted)]">
          ブラウザ内でテキスト化し、確認後に適用します。サーバーへ原ファイルは送りません。
          スキャンPDF・DOCX・Excelは未対応です。
        </p>
      </div>

      {busy ? (
        <p className="text-sm text-[var(--brand-muted)]" role="status">
          内容を読み取っています…
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {preview ? (
        <div className="space-y-2 rounded-lg border border-[var(--brand-border)] p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium">{preview.fileName}</p>
            <p className="text-xs text-[var(--brand-muted)]">
              {preview.characterCount.toLocaleString()}文字
              {target === "knowledge"
                ? ` / 推定 約${estimateTokens(preview.text).toLocaleString()} tokens`
                : ""}
            </p>
          </div>
          {preview.warning ? (
            <p className="text-sm text-amber-800">{preview.warning}</p>
          ) : null}
          {knowledgeStatus?.message ? (
            <p
              className={`text-sm ${
                knowledgeStatus.withinHardLimit ? "text-amber-800" : "text-red-700"
              }`}
            >
              {knowledgeStatus.message}
            </p>
          ) : null}
          <textarea
            readOnly
            value={preview.text}
            rows={8}
            className="w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-bg,transparent)] px-3 py-2 text-sm leading-relaxed"
            aria-label="抽出プレビュー"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canApply}
              className="rounded-md bg-[var(--brand-accent)] px-3 py-1.5 text-sm text-white disabled:opacity-50"
              onClick={() => {
                if (!preview || !canApply) return;
                onApply(preview.text);
                resetPreview();
              }}
            >
              この内容を使う
            </button>
            <button
              type="button"
              className="rounded-md border border-[var(--brand-border)] px-3 py-1.5 text-sm"
              onClick={resetPreview}
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
