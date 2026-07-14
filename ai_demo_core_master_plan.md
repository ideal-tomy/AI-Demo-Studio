# AI Demo Core 全体マスタープラン

**ファイルの役割:** このプロジェクト全体の道しるべ。作業順序、目的、成果物、完了条件を管理する。  
**対象:** 汎用AI Demo Studio → Managed Trial → 文書ファイル投入 → 共通Core化 → 既存デモへの導入 → パッケージ化  
**対応ブランド:** AXEON / ideal / 他社・パートナーブランド  
**対応AI Provider:** OpenAI / Anthropic Claude / Google Gemini  
**最終更新:** 2026-07-15  
**バージョン:** v1.3

---

## 0. このファイルの使い方

このプロジェクトでは、機能を思いつくたびに追加して全体像を見失うことを避ける。

原則として、以下の順番で進める。

1. **Phase 1:** Universal AI Demo Studioを完成させる
2. **Phase 1.5:** Managed Trialを独立実装する
3. **Phase 1.6:** 文書ファイル投入（抽出テキスト → 既存ナレッジ／プロンプト）
4. **Phase 2:** 共通Core / UI / Configへ分離する
5. **Phase 3:** ISOデモへ組み込み、チャット型で再利用性を検証する
6. **Phase 4:** DDデモへ組み込み、フォーム型でも再利用できることを検証する
7. **Phase 5:** 実績を踏まえて正式な共通基盤へ昇格する

**重要:** Phase 1の時点でnpmパッケージ化や過剰な共通化はしない。ただし、Multi-brand / Multi-provider / Access Modeの境界は最初から整理する。

---

# 1. プロジェクトの目的

## 1.1 事業上の目的

AXEON・ideal・他社ブランドで制作する各種AIデモを、単なるサンプル体験から、

> **クライアント自身が、自社の情報を入力して、その場で自社専用AIとして試せる体験**

へ進化させる。

さらに、APIキーを持っていないクライアントには、

> **「〇〇様専用のAI体験環境をご用意しました」**

というManaged Trialの体験コードを提供し、利用開始のハードルをなくす。

理想の流れ:

```text
デモを見る
↓
自社データで試す
↓
ナレッジを2〜3回入れ替える
↓
各ナレッジで2〜3回質問する
↓
自社で使う状態を具体的に想像できる
↓
社内共有・相談につながる
↓
MVP / 本番開発 / 共同開発へ移行する
```

## 1.2 技術上の目的

各デモで毎回ゼロから以下を実装する状態をやめる。

- ブランド表示
- AI Provider選択
- APIキー入力
- モデル選択
- ナレッジ入力
- AIプロンプト構築
- Provider Adapter
- AI API通信
- Usage正規化
- 概算コスト計算
- ブラウザ保存
- セッション管理
- エラーハンドリング
- 設定クリア
- 安全上の注意表示
- 将来のManaged Trial接続

最終的には、デモ固有のUIや業務ロジックを残しながら、AI体験の共通部分を再利用できる状態にする。

## 1.3 今回の確定方針

1. Multi-brandはPhase 1から対応
2. Multi-providerはPhase 1からOpenAI / Claude / Geminiを対象
3. Managed TrialはPhase 1では設計のみ
4. Managed Trialの実装はPhase 1完了後の独立Phase 1.5
5. Trial制限は期間・回数・金額・入力・出力・レート・同時実行・Allowlistの多層制限
6. AIモデル比較ではなく「自社データで動くこと」を主役にする
7. 文書ファイル投入はPhase 1.5完了後の独立Phase 1.6とする
8. Phase 1.6の範囲は「ファイル → テキスト抽出 → 既存ナレッジ／プロンプトへ適用」に閉じる（本格RAG・OCR・構造化解析は対象外）

---

# 2. 最終的に目指す構造

```text
                    Universal AI Demo Core
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
        Brand              Demo             Provider
          │                  │                  │
   AXEON / ideal /        ISO / DD /       OpenAI / Claude /
   Client Brand           建設 / 介護       Gemini
                             │
                             ▼
                      Access Mode
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
          BYOK Direct   Managed Trial   Client Proxy
```

各デモは、共通Coreに対して次のような入力を渡す。

```text
ユーザー入力
    ↓
Input Adapter
    ↓
AI Demo Core
    ↓
Output Adapter
    ↓
各デモ固有UI
```

将来的な対象入力:

- Text
- Chat
- Form
- PDF
- Image
- Audio
- CSV

将来的な対象出力:

- Text
- Chat
- Structured JSON
- Cards
- Table
- Report
- Dashboard

---

# 3. 共通化する4層

## 3.1 AI Demo Core

UIに依存しない共通ロジック。

想定機能:

- Access Mode管理
- Provider接続
- APIキー管理
- モデル管理
- ナレッジ管理
- プロンプト構築
- Provider-specific Prompt Override
- AIリクエスト
- レスポンス正規化
- Usage取得・正規化
- 概算コスト計算
- ストレージ管理
- セッション管理
- エラーハンドリング
- 設定クリア

将来的なAPIイメージ:

```ts
const result = await askAI({
  accessMode,
  provider,
  model,
  input,
  knowledge,
  systemPrompt,
});
```

## 3.2 AI Demo UI

再利用可能な画面部品。

```text
<ProviderSelector />
<ApiKeyInput />
<ModelSelector />
<KnowledgeEditor />
<SetupWizard />
<CostCounter />
<SecurityNotice />
<ClearSettingsButton />
```

Phase 1.5候補:

```text
<TrialCodeInput />
<RemainingRequests />
<ExpirationNotice />
```

## 3.3 Demo Config

デモごとの差分を設定ファイルへ集約する。

- demoId
- デモ名
- 説明
- AIの役割
- Base Prompt
- Demo-specific Prompt
- Role Preset
- ナレッジ入力案内
- 質問例
- 入力形式
- 出力形式
- 許可Provider
- 許可モデル
- ストレージポリシー
- コスト表示有無
- UI文言

## 3.4 Brand Config / Provider Config

### Brand Config

- brandId
- 会社名
- 製品名
- ロゴ
- Theme
- CTA
- 問い合わせ先
- 法的注意文
- Storage namespace

### Provider Config

- providerId
- Display Name
- Default Model
- Allowed Models
- Pricing
- Usage Mapping
- Error Mapping
- Provider-specific Prompt Override
- Browser Direct availability

---

# 4. 重要な設計原則

## 原則A：共通化するのは「AIを動かす仕組み」

すべてのデモを同じチャットUIにしない。

```text
ISO       → チャット
DD        → 企業情報フォーム → 診断カード
建設写真   → 写真アップロード → 分類結果
介護       → 音声入力 → 構造化記録
報告書     → 複数情報 → レポート
```

## 原則B：Phase 1では過剰に抽象化しない

最初からnpmパッケージ、モノレポ、複雑な正式APIを完成させない。

## 原則C：Coreはブランド中立

CoreにAXEON・ideal・クライアント社名を直書きしない。

## 原則D：CoreはProvider中立

UIはOpenAI / Anthropic / Gemini SDKを直接呼ばない。

```text
UI
↓
sendAiRequest()
↓
Access Mode Transport
↓
Provider Adapter
```

## 原則E：Promptは共通 + デモ + Provider微調整

```text
BASE
＋ DEMO
＋ ROLE
＋ CUSTOM
＋ PROVIDER OVERRIDE
＋ CLIENT KNOWLEDGE
＋ USER INPUT
```

## 原則F：APIキーは「運営者サーバーに保存しない」と「安全」を混同しない

BYOK Directでは、運営者側サーバーへAPIキーを保存しないことは可能。

ただし、ブラウザ側で秘密情報を扱うリスクは残る。

- デフォルトはsessionStorageまたはメモリ
- デモ専用APIキー推奨
- 利用後の削除・ローテーション推奨
- 「漏洩リスクゼロ」と表現しない
- Providerごとに公式安全方針を確認する

## 原則G：Managed Trialは秘密のProvider APIキーを配らない

クライアントにはTrial Codeだけを渡す。

```text
Client
↓ Trial Code
Managed Trial Gateway
↓ Provider Secret
AI Provider
```

## 原則H：Trialは多層制限

金額だけで守らない。

```text
期間
回数
金額Hard Cap
入力文字数
推定入力トークン
最大出力トークン
Rate Limit
同時実行
Provider Allowlist
Model Allowlist
```

---

# 5. 全体ロードマップ

## Phase 1：Universal AI Demo Studioを完成させる

### 目的

Multi-brand / Multi-provider対応の完成したリファレンスデモを作る。

Phase 1の実装対象:

```text
Brand Config
↓
OpenAI / Claude / Geminiを選択
↓
BYOK APIキーを入力
↓
軽量モデルを選択
↓
自社ナレッジを入力
↓
AI用途を選択
↓
質問する
↓
回答・Usage・概算コストを確認
```

### 主な画面

- `/` : デモ体験画面
- `/setup` : 初回セットアップ
- `/studio` : 設定管理

### 必須機能

- Multi-brand Config
- OpenAI / Claude / Gemini Provider選択
- Provider Adapter
- APIキー入力
- 接続確認
- モデル選択
- ナレッジ入力
- AI用途選択
- Prompt Builder
- Provider-specific Prompt Override
- チャット
- Usage正規化
- 概算コスト表示
- セッション累計コスト
- 設定変更
- 設定クリア
- 安全上の注意表示
- 未設定時ガイド
- 営業品質のエラー表示
- Managed Trialの型・設計のみ

### Task 00

UI実装前にOpenAI / Claude / GeminiごとにBrowser Direct / CORSを検証する。

Go / Conditional Go / No-Goを記録する。

No-Go ProviderはPhase 1のBYOK Directで無理に有効化せず、Phase 1.5 Gateway経由で対応する。

### 成果物

1. `ai_demo_studio_reference_requirements.md`
2. 動作するUniversal AI Demo Studio
3. `docs/provider-browser-direct-spike.md`
4. README
5. 基本テスト項目

### 完了条件

- AXEON / idealの2ブランドで切替確認できる
- ProviderをOpenAI / Claude / Geminiから選択できる
- Go判定ProviderでBYOK Direct体験が成立する
- 自社ナレッジを入力できる
- Usageと概算コストを表示できる
- Provider差を正規化できる
- APIキーを長期保存しない
- Managed Trial設計が型・文書へ反映されている
- PC / モバイルで基本操作できる

### このPhaseではやらない

- Managed Trial本実装
- Trial Code発行管理画面
- Trial Usage DB
- Server-side Gateway
- npmパッケージ化
- モノレポ化
- Vector DB
- 本格RAG
- 本番認証基盤
- 課金
- 全既存デモへの導入

---

## Phase 1.5：Managed Trialを独立実装する

### 目的

APIキーを持っていないクライアントでも、専用体験コードだけで自社ナレッジを使ったAI体験を開始できるようにする。

### 営業体験

```text
〇〇様専用のAI体験環境をご用意しました。

体験期間：7日間
利用回数：最大10回
費用：無料

体験コード：XXXXXXXX
```

### 標準Trial Policy

```text
有効期間                7日
最大利用回数            10回
対外的な最大利用枠      500円
金額Hard Cap            500円
通常想定原価            100円以内を目標（保証ではない）
ナレッジ上限            30,000文字
推定入力トークン上限    40,000 tokens / request
最大出力                2,000 tokens / request
Rate Limit              5 requests / minute
同時実行                1 request
Provider                Allowlist
Model                   軽量モデルのみ
```

### 多層防御

どれか1つでも上限に達したら停止する。

- Expiration
- Request Count
- Spend Hard Cap
- Knowledge Characters
- Estimated Input Tokens
- Output Tokens
- RPM
- Concurrency
- Provider Allowlist
- Model Allowlist

### 推奨体験ガイド

```text
ナレッジA → 2〜3回
ナレッジB → 2〜3回
ナレッジC → 2〜3回
自由質問   → 1回
```

### UI

主表示:

```text
残り 7 / 10 回
有効期限 2026-07-21
```

金額は詳細表示に回してよい。

### アーキテクチャ

```text
Client Browser
↓ Trial Code
Managed Trial Gateway
├ Validation
├ Expiration
├ Request Count
├ Spend Reservation
├ Input / Output Limit
├ Rate Limit
├ Concurrency Lock
├ Provider / Model Allowlist
└ Usage Ledger
↓
OpenAI / Claude / Gemini
```

### セキュリティ方針

- Provider APIキーはブラウザへ返さない
- Trial Codeは十分なEntropyを持たせる
- Trial CodeはHash保存を推奨
- リクエスト本文・ナレッジ本文・回答本文は標準保存しない
- 最小限のUsage / Cost / Statusメタデータだけ保存
- 即時失効可能
- Provider側BudgetだけにHard Capを委ねない

OpenAI ProjectのMonthly BudgetはSoft Thresholdであり、Hard Capではないため、自前Gatewayの制限をSource of Truthとする。

### Spend Reservation

同時リクエストによる上限突破を避けるため、必要に応じて以下を実装する。

```text
最大想定費用を一時予約
↓
AI実行
↓
実費確定
↓
差額解放
```

### 成果物

- Trial Code認証
- Managed Trial Gateway
- Trial Policy
- Usage Ledger
- Hard Cap Enforcement
- Rate Limit
- Concurrency Lock
- Trial UI
- 失効機能
- 最小限の管理運用手順

### 完了条件

- APIキー不要で体験できる
- 7日・10回制限が強制される
- 500円Hard CapがServer-sideで強制される
- 最大出力2,000 tokensが強制される
- 軽量モデルAllowlistが強制される
- Provider Secretがブラウザへ露出しない
- 本文を標準保存しない
- Trial Codeを即時失効できる

---

## Phase 1.6：文書ファイル投入（Document Text Ingestion）

### 目的

テキスト手入力だけでなく、手元の社内資料をそのままアップロードし、抽出テキストを既存のナレッジ／プロンプト枠へ適用できるようにする。

これにより体験を、

```text
用意されたテキストを編集する
```

から、

```text
自社の本物の資料を入れて、その場でAIがどう答えるか試す
```

へ近づける。

Managed Trialとの組み合わせを想定する。

```text
体験コード入力
↓
自社PDF / MD / YAML などをアップロード
↓
抽出内容を確認して適用
↓
質問する
↓
ナレッジやプロンプトを差し替えて再試行
```

### スコープ（このPhaseでやること）

処理パイプラインは次に固定する。

```text
ファイルアップロード
↓
テキスト抽出
↓
内容プレビュー
↓
ユーザー確認
↓
既存ナレッジ欄 または 既存プロンプト欄へ適用
↓
既存の Prompt Builder / 文字数制限 / Trial Policy で動作
```

**ナレッジ投入（Knowledge）とプロンプト投入（Prompt）はUI・用途を分ける。**

| 用途 | 初回対応形式 | 適用先 |
|------|--------------|--------|
| ナレッジ | PDF（テキスト層） / TXT / MD / CSV / YAML / JSON | 既存ナレッジ文字列 |
| プロンプト | TXT / MD / YAML / JSON / PDF（テキスト層） | 既存システムプロンプト文字列 |

YAML / JSON は**構造を解釈してプロンプトDSL化するのではなく**、抽出テキスト（または整形した平文）をそのままプロンプト／ナレッジとして扱う。

### 設計原則

1. **既存フローを壊さない**  
   抽出結果は最終的に今の `knowledge` / system prompt 文字列へ入る。回答経路・Trial Gateway・文字数上限は据え置き。

2. **いきなり適用しない**  
   抽出プレビューを見せ、「この内容を使う」で初めて適用する。

3. **全文コンテキストのまま**  
   Phase 1.6ではチャンク分割・Embedding・Vector Store・検索（本格RAG）を入れない。既存の簡易ナレッジ上限（例: 30,000文字）を超える場合は拒否または短縮を促す。

4. **Managed Trialでは一時利用を原則とする**  
   アップロード原ファイル・抽出本文をサーバへ標準保存しない。ブラウザ／セッション内の利用を基本とし、Trial失効・設定クリア時に破棄する。保存方針を変える場合は別Decisionとする。

5. **失敗を隠さない**  
   テキスト層のないPDF・空抽出・文字化けなどは、営業品質のメッセージで説明する（OCRは次フェーズ以降）。

### 成果物

1. ナレッジ／プロンプト各UIへのファイル選択・ドロップ
2. テキスト抽出ユーティリティ（形式ごとの薄いAdapterでよい）
3. 抽出プレビュー → 適用フロー
4. BYOK / Managed Trial両モードでの動作確認
5. 対応形式・非対応（OCR等）のREADMEまたはヘルプ文言

### 完了条件

- 対応形式のファイルからテキストを抽出し、ナレッジまたはプロンプトとして適用できる
- 適用後は既存のチャット体験・文字数評価・Trial制限がこれまでどおり機能する
- プレビュー確認なしに黙って適用されない
- サーバへアップロード原ファイル／抽出本文を標準保存しない
- OCRが必要なPDFは「未対応」として案内できる

### このPhaseではやらない

- 本格RAG（チャンク・Embedding・Vector DB・関連部分だけ送信）
- スキャンPDF / 画像PDFのOCR
- DOCX / XLSX の本格対応（必要なら後続の拡張候補へ）
- Excelの数値分析・表クエリ専用エンジン
- YAML/JSONのスキーマ解釈によるプロンプトDSL化
- 複数ファイルの同時ナレッジDB化（必要なら結合して1テキストにする程度に留める）
- npmパッケージ化・Core本分離（それはPhase 2）

### Phase配置の理由

Phase 1.5で「体験コードだけで自社データを試す」土台ができた直後に、**資料そのものを入れる導線**を足すと営業価値が最も上がる。  
Phase 2のCore分離より前に薄い実装を固めることで、分離時に「文書テキスト投入」を共通候補へ含めやすい。

---

## Phase 2：Core / UI / Configへ分離する

### 目的

Phase 1・Phase 1.5・Phase 1.6の完成コードから、共通部分とデモ固有部分を分離する。

### 想定構成

```text
/lib/demo-core/
  ai-transport.ts
  access-mode-transport.ts
  storage.ts
  prompt-builder.ts
  pricing.ts
  knowledge.ts
  document-text-ingest.ts
  errors.ts

/lib/providers/
  openai-adapter.ts
  anthropic-adapter.ts
  gemini-adapter.ts

/components/demo-core/
  ProviderSelector.tsx
  ApiKeyInput.tsx
  KnowledgeEditor.tsx
  PromptEditor.tsx
  DocumentUploadField.tsx
  ModelSelector.tsx
  SetupWizard.tsx
  CostCounter.tsx
  SecurityNotice.tsx

/config/
  brand.config.ts
  demo.config.ts
  provider.config.ts
  pricing.config.ts
  trial-policy.config.ts
```

Phase 1.6で入れた「ファイル → 抽出テキスト → 既存欄へ適用」は、Core候補（抽出）とUI候補（アップロード／プレビュー）へ分ける。

### 成果物

- 共通Core候補
- 共通UI候補
- Brand / Demo / Provider Configスキーマ
- Access Mode Transport
- Document Text Ingest（Phase 1.6成果の整理）
- 移植ガイド初版

### 完了条件

- 汎用Studio自体が、分離後も正常動作する
- ブランド固有設定をBrand Configへ集約できる
- デモ固有設定をDemo Configへ集約できる
- Provider差をAdapterへ集約できる
- 各画面が直接Storage APIを触らない
- AI通信処理がUIから分離されている

---

## Phase 3：ISOデモへ組み込む

### 目的

チャット型AIデモに、本当に共通基盤を再利用できるか検証する。

### 推奨UI

```text
[ サンプルデータで試す ]
[ 自社の資料で試す ]
[ 専用体験コードで試す ]
```

### 検証ポイント

- Coreをコピーせず再利用できるか
- ISO固有PromptをConfigだけで設定できるか
- Providerを変更してもISO体験が成立するか
- Managed Trialを組み込めるか
- 既存UIを壊さないか

### 完了条件

- 汎用StudioとISOデモが同じCore候補を利用する
- ISO専用コードにAI接続ロジックを重複実装しない
- 「サンプル」「BYOK」「体験コード」の体験が必要に応じて成立する

---

## Phase 4：DDデモへ組み込む

### 目的

共通基盤がチャット専用ではなく、フォーム型・構造化出力型でも利用できることを証明する。

### 入力例

- 企業名
- 業種
- 売上規模
- 従業員数
- 現在の課題
- 利用中システム
- 自由記述

### 出力例

- Diagnosis
- Tech Opportunity
- Development Options
- Priority
- Investment & Impact
- Prototype
- Roadmap

### このPhaseで追加する概念

```text
Input Adapter
AI Demo Core
Output Adapter
```

### 完了条件

- 同じCoreでチャット型とフォーム型を動かせる
- 構造化JSON出力を扱える
- DD固有の入力・出力UIを保ったままAI基盤を再利用できる

---

## Phase 5：正式な共通基盤へ昇格する

### 目的

実際に複数ブランド・複数Provider・2〜3種類のデモで利用した結果をもとに、正式な共通基盤として固定する。

### 候補名称

- `Universal AI Demo Core`
- `AI Demo Kit`
- private package名は実装時に決定

### 想定構成

```text
@internal/ai-demo-core
@internal/ai-demo-ui
```

または、必要性が確認できた場合のみモノレポ化する。

### 判断項目

- private npm packageにするか
- Git subtree / shared packageにするか
- monorepo化するか
- Provider Adapterをどこまで正式対応するか
- Managed Trial Gatewayを共通化するか
- Phase 1.6の文書テキスト投入を標準Input Adapterへ昇格するか
- 画像・音声・OCRを標準Input Adapterに含めるか

### 完了条件

- 新規デモで共通基盤を短時間で導入できる
- AI接続ロジックの重複実装がない
- Brand / Demo / Provider Configで大半の差分を吸収できる
- 既存デモの独自UIを維持できる
- BYOK / Managed Trialを選択できる
- 更新・保守方法が明確

---

# 6. Phase 5終了後の拡張候補

## 6.1 Input Adapter拡張

Phase 1.6で「ファイル → 抽出テキスト → 既存ナレッジ／プロンプト」は先行実装済みとする。ここでの拡張はそれ以降の高度化。

- スキャンPDF / 画像PDFのOCR
- DOCX / XLSX
- Image（図表説明など）
- Audio
- 複数ファイルの個別管理・差し替えUI高度化

## 6.2 Output Adapter拡張

- Structured JSON
- Cards
- Table
- Report
- Dashboard
- Downloadable file

## 6.3 本格RAG

Phase 1.6の全文コンテキスト投入を超える場合の候補。

- チャンク分割
- Embedding
- Vector Store
- Supabase pgvector
- Provider File Search等
- 大きい資料向け Temporary RAG / 関連部分のみ送信

## 6.4 Provider拡張

- その他AI Provider
- Azure OpenAI等
- Bedrock / Vertex経由

ただし、対応Provider数を目的化しない。

## 6.5 Client-Owned Proxy Mode

高機密・本番用途向けに、クライアント自身が管理するバックエンド / Serverless Function経由でAI APIを利用するモード。

---

# 7. 現在地

## 現在のフェーズ

**Phase 2：Core / UI / Config 分離 — 実施中／完了確認**

## 現在の作業

Phase 1.6 文書投入を含むコードを `lib/demo-core` / `components/demo-core` / Config 境界で整理。  
Managed Trial は OpenAI 限定。移植ガイド初版あり。

## 次の作業

1. Phase 2 回帰（BYOK / Trial OpenAI / 文書投入 / Brand 切替）
2. Phase 3 ISOデモへ組み込み

---

# 8. 進行チェックリスト

- [x] 共通基盤構想を整理
- [x] 初版ロードマップを作成
- [x] Phase 1要件定義書 v1.1を作成
- [x] Multi-brand方針を確定
- [x] Multi-provider方針を確定
- [x] Managed Trial採用を確定
- [x] Trial標準枠を確定
- [x] Managed TrialをPhase 1.5として追加
- [x] Phase 1要件定義書 v1.2を作成
- [x] Phase 1要件定義書 v1.2をレビュー・確定
- [x] Task 00 Provider Browser Direct / CORS Spike
- [x] Universal AI Demo Studio実装
- [x] Phase 1動作確認
- [x] Phase 1.5 Managed Trial実装
- [x] Phase 1.5動作確認
- [x] Phase 1.6をマスタープランへ追加（スコープ確定）
- [x] Phase 1.6 文書ファイル投入の実装
- [ ] Phase 1.6動作確認
- [x] Phase 2 Core / UI / Config分離（実装）
- [ ] Phase 2動作確認
- [ ] Phase 3 ISOデモへ導入
- [ ] Phase 4 DDデモへ導入
- [ ] Phase 5 正式パッケージ化判断

---

# 9. 意思決定ログ

## Decision 001

**Phase 1からnpmパッケージ化しない。**

理由: 実際に複数デモへ導入する前は、本当に共通化すべき境界が確定していないため。

## Decision 002

**すべてのデモをチャットUIへ統一しない。**

理由: 共通化対象はAI実行基盤であり、UIは用途ごとに最適化すべきため。

## Decision 003

**APIキーはデフォルトでsessionStorageまたはメモリ保持とする。**

理由: localStorageへの長期保存を標準にしないため。

## Decision 004

**BYOK Direct Modeは限定的なデモ体験として扱う。**

理由: 運営者側サーバーへキーを保存しない利点はあるが、ブラウザ側で秘密情報を扱うリスクは残るため。

## Decision 005

**Phase 1からMulti-brand対応する。**

理由: AXEONだけでなくideal・他社デモでも利用するため。

## Decision 006

**Phase 1からOpenAI / Claude / GeminiのProvider Adapterを対象とする。**

理由: Providerを交換可能にし、クライアントが選択できる体験を作るため。

## Decision 007

**各Providerでは軽量モデルを標準とする。**

理由: 10回程度の体験では十分な品質を狙いつつ、原価を低く抑えやすいため。

## Decision 008

**Provider一覧・モデル一覧を大量に見せない。**

理由: 主役はモデル比較ではなく、自社情報で動く体験だから。

## Decision 009

**Managed Trialを採用する。**

理由: APIキーを持たないSMEでも、専用体験コードだけで試せるようにするため。

## Decision 010

**Managed TrialはPhase 1では設計のみ、Phase 1.5で独立実装する。**

理由: Phase 1を完成させつつ、営業価値の高い機能を明確な次段階として実装するため。

## Decision 011

**Trial標準は7日・10回・500円Hard Cap。**

追加制限:

- 30,000文字
- 40,000推定入力tokens / request
- 2,000出力tokens / request
- 5 requests / minute
- 同時実行1
- 軽量モデルAllowlist

## Decision 012

**Trial UIは残り回数を主表示する。**

理由: クライアントにとって金額より「あと何回試せるか」の方が分かりやすいため。

## Decision 013

**Trialは金額だけで守らない。**

理由: 料金変更・計算ミス・競合リクエストに対して多層防御を残すため。

## Decision 014

**Managed Trialの本文は標準保存しない。**

理由: 必要以上に顧客ナレッジ・会話本文を保持しないため。

## Decision 015

**Provider側のBudgetだけをHard Capとして信用しない。**

特にOpenAI Project Monthly BudgetはSoft Thresholdであり、超過後もリクエストが継続するため、自前GatewayでHard Capを強制する。

## Decision 016

**文書ファイル投入を Phase 1.6 として独立実装する。**

配置: Phase 1.5（Managed Trial）の直後、Phase 2（Core分離）の直前。

理由:

- Trialで「自社データで試す」導線ができた直後に、資料そのものを入れる体験を足すと営業価値が高い
- Phase 2より前に薄い実装を固めると、Core分離時に共通候補へ含めやすい

## Decision 017

**Phase 1.6の範囲は「ファイル → テキスト抽出 → 既存ナレッジ／プロンプト」に閉じる。**

含む:

- ナレッジとプロンプトの投入UI分離
- PDF（テキスト層）/ TXT / MD / CSV / YAML / JSON などからの抽出
- プレビュー確認後の適用
- 既存の文字数上限・Prompt Builder・Trial Policyの再利用
- アップロード原ファイル／抽出本文のサーバ標準非保存

含まない:

- 本格RAG
- OCR
- DOCX / XLSXの本格対応
- YAML/JSONのプロンプトDSL化
- Excel数値分析エンジン

理由: 既存の簡易ナレッジモードを壊さず、最短で「本物の資料で試す」体験を足すため。高度化は Phase 5終了後の拡張候補（6.1 / 6.3）へ送る。

---

# 10. このプロジェクトの最終価値

この共通基盤の最終目的は、単なる開発効率化ではない。

各ブランドの各デモに、共通して次の体験を追加することにある。

> **「サンプルを見る」から、「自社の情報を入れて、本当に自社の場合を試す」へ。**

さらにAPIキーを持たないクライアントには、

> **「あなたの会社のために専用体験環境を用意しました」**

という関係性を深める営業体験を提供する。

最終的な強みは、OpenAI・Claude・Geminiそのものではない。

> **どんな会社のどんなデータを受け取り、どの内部Promptと制約で、どんな出力体験に変換するか。**

これを、業界・企業ごとの実際に触れるAIデモとして提供し、本番開発・MVP・共同開発・M&A後のバリューアップ案件へつなげる。
