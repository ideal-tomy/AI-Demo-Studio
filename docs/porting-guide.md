# 移植ガイド（Phase 5 — `@axeon/ai-demo-core`）

新規デモへ共通基盤を導入する手順です。vendor コピーは廃止し、**ローカルパッケージ**を参照します。

## 1. 依存関係

各デモの `package.json`:

```json
{
  "dependencies": {
    "@axeon/ai-demo-core": "file:../AI-Demo-Studio/packages/ai-demo-core"
  },
  "scripts": {
    "build:core": "npm run build --prefix ../AI-Demo-Studio/packages/ai-demo-core",
    "prebuild": "npm run build:core"
  }
}
```

Studio 本体:

```json
"@axeon/ai-demo-core": "file:./packages/ai-demo-core"
```

Next.js は `transpilePackages: ["@axeon/ai-demo-core"]` を設定。

## 2. 起動時設定（必須）

ブラウザ側の storage / knowledge は `configureDemoCore()` が必要です。

```ts
import { configureDemoCore } from "@axeon/ai-demo-core/demo-core";
import { demoConfig } from "./config/demo.config";

configureDemoCore({
  storageNamespace: "axeon", // または brandConfig.storageNamespace
  demoId: demoConfig.id,
  defaultRoleId: demoConfig.defaultRoleId,
  knowledgePolicy: demoConfig.knowledgePolicy,
  defaultAccessMode: demoConfig.defaultAccessMode,
  defaultModel: demoConfig.defaultModel,
  defaultProvider: demoConfig.defaultProvider,
  // チャット型のみ
  baseSystemPrompt: demoConfig.baseSystemPrompt,
  demoSpecificPrompt: demoConfig.demoSpecificPrompt,
  rolePresets: demoConfig.rolePresets,
  chat: demoConfig.chat,
});
```

`/ai` や診断ページのエントリで **1 回** 呼ぶ（例: `src/lib/ai-demo-core-setup.ts`）。

## 3. インポート境界

| 用途 | インポート先 |
|------|----------------|
| クライアント AI 通信 | `@axeon/ai-demo-core/demo-core` |
| ストレージ | `@axeon/ai-demo-core/demo-core/storage` |
| 型 | `@axeon/ai-demo-core/types/*` |
| Provider 設定 | `@axeon/ai-demo-core/config/provider.config` |
| Trial API（サーバー） | `@axeon/ai-demo-core/trial/gateway` · `trial/http` |
| ルート `@axeon/ai-demo-core` | **サーバー専用**（crypto 含む。ブラウザから import しない） |

## 4. デモ固有に残すもの

- Brand / Demo Config（文言・Prompt・Role）
- ExperienceModeBar / AccessModePanel
- Input / Output Adapter（`iso-input` · `dd-input` 等）
- 既存 UI（チャット・フォーム・演出）

## 5. Access Mode

```ts
accessMode: "byok-direct" | "managed-trial"
```

- **BYOK:** `sendAiRequest` → Provider Adapter
- **Managed Trial:** `/api/trial/ask` → Gateway（OpenAI のみ）

体験コード取得は各デモに持たず、`VITE_TRIAL_PORTAL_URL` → Studio `/admin/trial`。

## 6. 構造化 JSON（フォーム型）

`AiRequest` に `responseFormat` / `temperature` を指定。Trial 経路では `TrialAskRequestBody` にも同フィールドを渡す（Gateway は既定値を付けない）。

## 7. 新規デモ最短手順

```text
1. @axeon/ai-demo-core を file: 依存で追加
2. configureDemoCore + Demo/Brand Config
3. ExperienceModeBar + Access Mode 配線
4. Input/Output Adapter
5. VITE_TRIAL_PORTAL_URL → /admin/trial?demo=…&return=…
6. 薄い api/trial/ask · status（gateway を呼ぶだけ）
7. npm run build（prebuild で core を自動ビルド）
```

## 8. Core 更新手順

```text
1. AI-Demo-Studio/packages/ai-demo-core を修正
2. npm run build --prefix packages/ai-demo-core
3. 各デモで npm install（必要時）→ npm run build
```

Studio から同期する場合: `node scripts/sync-ai-demo-core-package.mjs` → `npm run build`（packages 内）。

## 9. 参考実装

| デモ | 型 | 参照 |
|------|-----|------|
| Studio | チャット | `lib/ai-demo-core-setup.ts` |
| product_flow | チャット + RAG | `src/lib/ai-demo-core-setup.ts` |
| dd_demo | フォーム + JSON | `src/lib/ai-demo-core-setup.ts` |

詳細: `docs/PHASE5_HANDOFF.md`

## 10. 禁止事項（従来どおり）

- UI から Provider `fetch` 直叩き
- storage API 直触り
- Trial へのナレッジ永続化
- OCR / 本格 RAG を標準対応と謳う
