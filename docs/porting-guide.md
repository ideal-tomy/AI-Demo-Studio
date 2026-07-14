# 移植ガイド初版（Phase 2）

Universal AI Demo Studio から、別デモ（例: ISO）へ共通部分を持ち出すときの手順です。  
npm パッケージ化前の「コピー／参照用」ガイドです。

## 1. 持ち出すもの

| 領域 | パス | タグ |
|---|---|---|
| Core | `lib/demo-core/`（`index.ts` から利用） | `CORE-CANDIDATE` |
| Providers | `lib/providers/` | `PROVIDER-SPECIFIC` |
| Trial Gateway | `lib/trial/` + `app/api/trial` / `app/api/admin/trial` | server only |
| UI 候補 | `components/demo-core/` | `UI-CANDIDATE` |
| Config | `config/*.ts` | BRAND / DEMO / PROVIDER |
| Types | `types/` | — |

デモ固有として残しがちなもの: `components/chat` / `studio` / `trial` / `brand` / `app` ページ構成。

## 2. Brand / Demo Config

1. `config/brand.config.ts` にブランドを追加し `NEXT_PUBLIC_BRAND_ID` で切替
2. `config/demo.config.ts` でデモ名・Prompt・Role・質問例・ナレッジ上限を差し替え
3. Core / UI に社名・デモ固有文言を直書きしない

## 3. Access Mode

```ts
accessMode: "byok-direct" | "managed-trial"
```

- **BYOK:** ブラウザ → Provider Adapter（クライアントの APIキー）
- **Managed Trial:** ブラウザ → `/api/trial/ask` → Gateway → **サーバーの OpenAI キーのみ**

Trial の Allowlist は OpenAI のみ（`config/trial-policy.config.ts`）。

必要な env（Trial）:

- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
- `TRIAL_ADMIN_SECRET`
- `OPENAI_API_KEY`（サーバー専用）

発行 UI: `/admin/trial`

## 4. Document Text Ingest（Phase 1.6）

```text
ファイル選択
→ extractDocumentText (Core, ブラウザ内)
→ DocumentUploadField でプレビュー
→ ユーザーが適用
→ knowledge または customInstruction 文字列へ
→ 既存 Prompt Builder / 文字数制限 / Trial Policy
```

- Knowledge: PDF(テキスト層) / TXT / MD / CSV / YAML / JSON
- Prompt: TXT / MD / YAML / JSON / PDF(テキスト層)
- サーバへ原ファイル・抽出本文は標準保存しない
- OCR が必要な PDF は未対応としてユーザーへ案内

取り込み例:

```tsx
import { DocumentUploadField } from "@/components/demo-core/DocumentUploadField";
import { KnowledgeEditor } from "@/components/demo-core/KnowledgeEditor";
```

## 5. 禁止事項

- UI から OpenAI / Anthropic / Gemini の `fetch` を直接呼ばない（`sendAiRequest` 経由）
- 画面から `localStorage` / `sessionStorage` を直接触らない（`lib/demo-core/storage.ts`）
- Trial Gateway にナレッジ／回答本文を永続化しない
- Trial で Anthropic / Gemini を有効化しない（現状方針）
- OCR・本格 RAG を「標準対応」と謳わない

## 6. 最小配線チェック

- [ ] Brand Config だけで表示が変わる
- [ ] Demo Config だけで Prompt / 質問例が変わる
- [ ] BYOK で質問できる
- [ ] Trial（OpenAI）で残回数が出る
- [ ] 文書アップロード → プレビュー → 適用 → 質問
- [ ] `npm run build` が通る
