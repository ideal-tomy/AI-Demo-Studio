/**
 * Catalog of demos that share the AI Demo Platform trial portal.
 * Add an entry when shipping a new demo — portal copy & labels follow this.
 */
export type DemoCatalogEntry = {
  id: string;
  title: string;
  blurb: string;
  /** Suggested label prefix when issuing a trial code */
  labelPrefix: string;
};

export const DEMO_CATALOG: Record<string, DemoCatalogEntry> = {
  "iso-chat": {
    id: "iso-chat",
    title: "ISO・規格ナレッジAI",
    blurb:
      "体験コードを取得すると、規定回数まで社内規程・品質文書へのAI回答を試せます。",
    labelPrefix: "ISO",
  },
  "studio-chat": {
    id: "studio-chat",
    title: "AI Demo Studio（共通基盤）",
    blurb:
      "共通プラットフォーム自体のチャット体験用です。サンプル・APIキー・体験コードの3モードを試せます。",
    labelPrefix: "Studio",
  },
  "dd-diagnosis": {
    id: "dd-diagnosis",
    title: "DD診断デモ（フォーム型）",
    blurb:
      "体験コードを取得すると、企業フォーム入力から診断・ロードマップまでのAI構造化出力を規定回数まで試せます。",
    labelPrefix: "DD",
  },
  "ocr-document": {
    id: "ocr-document",
    title: "OCR帳票デモ",
    blurb: "体験コードを取得すると、帳票AIデモを規定回数まで試せます。",
    labelPrefix: "OCR",
  },
  "speech-struct": {
    id: "speech-struct",
    title: "音声→構造化デモ",
    blurb: "体験コードを取得すると、音声構造化デモを規定回数まで試せます。",
    labelPrefix: "Speech",
  },
  "photo-classify": {
    id: "photo-classify",
    title: "写真分類デモ",
    blurb: "体験コードを取得すると、写真分類デモを規定回数まで試せます。",
    labelPrefix: "Photo",
  },
  "report-gen": {
    id: "report-gen",
    title: "報告書生成デモ",
    blurb: "体験コードを取得すると、報告書生成デモを規定回数まで試せます。",
    labelPrefix: "Report",
  },
};

export const DEFAULT_DEMO_ID = "studio-chat";

export function resolveDemoEntry(demoId: string | null | undefined): DemoCatalogEntry {
  if (demoId && DEMO_CATALOG[demoId]) return DEMO_CATALOG[demoId];
  return {
    id: demoId?.trim() || DEFAULT_DEMO_ID,
    title: "AIデモ体験",
    blurb:
      "体験コードを取得すると、規定回数までAI回答を試すことができます。",
    labelPrefix: demoId?.trim() || "Demo",
  };
}

/** Allow only http(s) absolute URLs for return navigation. */
export function safeReturnUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}
