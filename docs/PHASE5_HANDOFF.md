# Phase 5 完了 — 正式共通基盤 `@axeon/ai-demo-core`

Phase 5 では vendor コピー連鎖を廃止し、Studio 正の **`@axeon/ai-demo-core`** パッケージへ集約した。

## 成果物

| 項目 | パス |
|------|------|
| 正式 Core パッケージ | `AI-Demo-Studio/packages/ai-demo-core/` |
| 同期スクリプト | `AI-Demo-Studio/scripts/sync-ai-demo-core-package.mjs` |
| 移植ガイド | `AI-Demo-Studio/docs/porting-guide.md` |
| Studio 設定 | `AI-Demo-Studio/lib/ai-demo-core-setup.ts` |
| ISO 設定 | `product_flow/src/lib/ai-demo-core-setup.ts` |
| DD 設定 | `dd_demo/src/lib/ai-demo-core-setup.ts` |

## 判断（Decision 022）

- **共有形態:** `packages/ai-demo-core` + 各デモ `file:` 依存
- **monorepo / private npm:** Phase 5 では未実施（必要時に同パッケージを publish 可能）
- **UI パッケージ:** 作らない（`components/demo-core` は Studio 参考実装のまま）
- **LOCAL DELTA:** `responseFormat` / `temperature` を Studio へ逆マージ。Trial Gateway は呼び出し側指定

## 廃止したもの

- `product_flow/src/vendor/ai-demo/`（削除）
- `dd_demo/src/vendor/ai-demo/`（削除）
- `product_flow/scripts/copy-vendor-phase3.mjs`（削除）
- `dd_demo/scripts/copy-vendor-phase4.mjs`（削除）
- `dd_demo` の `npm run copy-vendor`

## ビルド

各プロジェクトで `npm run build` 成功（`prebuild` が core を tsup ビルド）。

```bash
# Core 単体
cd AI-Demo-Studio/packages/ai-demo-core && npm run build

# 各デモ（prebuild 経由で core もビルド）
cd product_flow && npm run build
cd dd_demo && npm run build
cd AI-Demo-Studio && npm run build
```

## 受け入れチェック

- [x] `@axeon/ai-demo-core` パッケージ切り出し
- [x] Studio / product_flow / dd_demo が package 経由のみで AI 接続
- [x] vendor コピー削除
- [x] `responseFormat` / `temperature` の Trial 透過
- [x] `configureDemoCore` によるデモ別 storage 名前空間
- [x] 3 プロジェクト `npm run build` 成功
- [ ] 手動: BYOK / Trial 実機確認（任意）

## ブラウザ import 注意

クライアントコードは **`@axeon/ai-demo-core/demo-core`** 等のサブパスを使う。ルート `@axeon/ai-demo-core` は Trial/crypto を含むためサーバー専用。

## 次の作業

- 新規デモ横展開（porting-guide 手順）
- 将来: private npm publish または DNS `demo.axeon.jp`
- §6 拡張（OCR / RAG / 画像・音声）は Phase 5 対象外
