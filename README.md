# Universal AI Demo Studio

AXEON / ideal 向けのリファレンス実装です。

- **Phase 1:** BYOK Direct（自社 APIキー）
- **Phase 1.5:** Managed Trial（体験コード・APIキー不要）
- **Phase 1.6:** 文書ファイル投入（ブラウザ内テキスト抽出 → ナレッジ／カスタム指示）

## 起動方法

```bash
npm install
cp .env.example .env.local   # 値を記入
npm run dev
```

ブラウザ: [http://localhost:3000](http://localhost:3000)

- チャットデモ: `/`
- **体験コード取得（お客様向け）: `/trial`**
- Trial 管理（管理者）: `/admin/trial`

## 環境変数（Managed Trial）

| 変数 | 用途 |
|---|---|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Trial Ledger / lock / rate limit |
| `TRIAL_ADMIN_SECRET` | `/admin/trial` 認証 |
| `TRIAL_PUBLIC_ISSUE` | `off` で公開 `/trial` の自己発行を停止（既定は有効） |
| `OPENAI_API_KEY` | **サーバー専用**（Managed Trial は OpenAI のみ） |
| `ANTHROPIC_API_KEY` / `GOOGLE_API_KEY` | BYOK 用（Trial では未使用） |
| `TRIAL_DEFAULT_MODEL` | Trial 既定モデル（OpenAI Allowlist 内） |
| `NEXT_PUBLIC_BRAND_ID` | `axeon` / `ideal` |

## Multi-brand

```bash
NEXT_PUBLIC_BRAND_ID=axeon npm run dev
NEXT_PUBLIC_BRAND_ID=ideal npm run dev
```

## BYOK Direct

- Setup で「APIキーで接続」
- キーは sessionStorage、ブラウザから Provider へ直接通信
- 漏洩リスクゼロとは言いません。デモ専用キー推奨

## Managed Trial

APIキーを持たないクライアント向け。**お客様は `/trial` で自己取得**、運営は `/admin/trial` で一覧・失効。  
**Provider は OpenAI のみ**（Anthropic / Gemini は BYOK 用に残置）。

デモ量産時は各デモから:

```text
https://demo.axeon.jp/trial?demo=<demo-id>&return=<デモのURL>
```

へ誘導する（`config/demo-catalog.config.ts` にエントリを追加）。

### お客様手順

1. `/trial`（または各デモの「体験コードを取得」）でコード発行
2. 平文コードを控える（この画面でのみ表示）
3. デモ側の「体験コードで試す」に入力

### 運営手順

1. Upstash と **`OPENAI_API_KEY`**、`TRIAL_ADMIN_SECRET` を設定
2. `/admin/trial` でシークレット認証 → 一覧・失効・特権発行
3. 公開発行を止めたいときは `TRIAL_PUBLIC_ISSUE=off`

### 営業文例

```text
〇〇様専用のAI体験環境をご用意しました。

体験期間：7日間
利用回数：最大10回
費用：無料

体験コード：XXXXXXXX
```

詳細: [`docs/managed-trial-design.md`](docs/managed-trial-design.md)

## 文書ファイル投入（Phase 1.6）

セットアップ／設定のナレッジ欄・カスタム指示欄から、手元の資料を読み込めます。

| 用途 | 対応形式 | 適用先 |
|---|---|---|
| ナレッジ | PDF（テキスト層） / TXT / MD / CSV / YAML / JSON | ナレッジ文字列 |
| プロンプト | TXT / MD / YAML / JSON / PDF（テキスト層） | カスタム指示 |

- 抽出は**ブラウザ内のみ**。原ファイルをサーバーへアップロードしません
- 必ず**プレビュー確認後**に「この内容を使う」で適用します
- 未対応: スキャンPDF（OCR）、DOCX、Excel、本格 RAG
- ナレッジは既存の文字数上限（hardLimit）を超えると適用できません

## 運用：対面商談後の全設定クリア

運営者管理端末（BYOK）では、商談終了後に **設定 → 全設定をクリア**。  
Trial コード自体の無効化は `/admin/trial` の失効を使います。

## Storage

| データ | 既定 |
|---|---|
| APIキー / 体験コード | sessionStorage |
| 設定・ナレッジ・会話 | localStorage（brand/demo prefix） |
| Trial 回数・Hard Cap | Upstash Redis（サーバー） |

## Pricing

`config/pricing.config.ts` の単価と `updatedAt` を更新。UI に価格直書きしません。

## Known Limitations

- BYOK はデモ体験用
- **Managed Trial は OpenAI のみ**（Anthropic / Gemini の Trial は未対応）
- 全文挿入型ナレッジ（本格 RAG なし）
- スキャンPDF（OCR）・DOCX・Excel は未対応（テキスト層 PDF / TXT / MD 等は対応）

## Phase 2 移植

[`docs/porting-guide.md`](docs/porting-guide.md)

## 受け入れ

[`docs/acceptance-checklist.md`](docs/acceptance-checklist.md)
