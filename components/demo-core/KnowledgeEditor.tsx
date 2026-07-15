"use client";

import { useMemo } from "react";
import { demoConfig } from "@/config/demo.config";
import { evaluateKnowledge } from "@/lib/demo-core/knowledge";
import { DocumentUploadField } from "@/components/demo-core/DocumentUploadField";

// UI-CANDIDATE
export function KnowledgeEditor({
  value,
  onChange,
  rows = 10,
  showSampleButton = false,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  showSampleButton?: boolean;
}) {
  const knowledgeStatus = useMemo(() => evaluateKnowledge(value), [value]);

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-md border border-[var(--brand-border)] px-3 py-2 text-sm leading-relaxed"
        placeholder="ここに対象企業情報を貼り付け"
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--brand-muted)]">
        <span>
          {knowledgeStatus.characters.toLocaleString()}文字 / 推定 約
          {knowledgeStatus.estimatedTokens.toLocaleString()} tokens
          <span className="ml-1 opacity-70">
            ※内容により実際のトークン数は異なります
          </span>
        </span>
        {showSampleButton ? (
          <button
            type="button"
            className="underline"
            onClick={() => onChange(demoConfig.sampleKnowledge)}
          >
            サンプルを入れる
          </button>
        ) : null}
      </div>
      {knowledgeStatus.message ? (
        <p
          className={`text-sm ${
            knowledgeStatus.withinHardLimit ? "text-amber-800" : "text-red-700"
          }`}
        >
          {knowledgeStatus.message}
        </p>
      ) : null}
      <div>
        <p className="mb-2 text-sm font-medium">またはファイルから読み込む</p>
        <DocumentUploadField
          target="knowledge"
          onApply={(text) => onChange(text)}
        />
      </div>
    </div>
  );
}
