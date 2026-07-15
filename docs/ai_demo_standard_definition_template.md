# AI Demo Standard Definition Template

> **目的**  
> 本書は、新規AIデモを作成する際に、共通基盤 `ai-demo-core` への接続と、デモ固有の体験設計を標準化するための共通テンプレートである。
>
> 本書は、各デモ固有の「テーマ別要件定義書」を置き換えるものではない。  
> テーマ別要件定義書で「何を作るか・なぜ作るか・誰のためか」を定義し、本書で「共通Coreをどう使い、どのような体験として実装するか」を定義する。

---

## 0. このテンプレートの使い方

新規デモを作成するときは、原則として次の2種類のMarkdownを用意する。

### A. テーマ別要件定義書

デモ固有の内容を定義する。

例:

- 背景
- 課題
- 対象ユーザー
- 業務シナリオ
- デモの目的
- 必要機能
- Must / Should / Won't
- 画面要件
- 技術要件
- 成功条件

### B. 本書を複製した Demo Definition

共通Coreとの接続と、デモ固有の体験設計を定義する。

主な対象:

- Core接続
- Access Mode
- Provider
- Trial
- UI
- シナリオ
- 演出
- 入力方式
- 結果表示
- Input / Output Adapter
- Demo固有Delta
- 実装PLAN
- 受け入れ条件

---

# 1. Demo Identity

## 1.1 基本情報

- Demo ID:
- Demo Name:
- Brand ID:
- Repository:
- Production URL:
- Demo Type:
  - [ ] Chat
  - [ ] Form
  - [ ] Upload
  - [ ] Dashboard
  - [ ] Workflow
  - [ ] Other

## 1.2 対象ユーザー

- Primary User:
- Secondary User:
- 利用シーン:

## 1.3 テーマ別要件定義書

- Requirement File:
- Master Plan:
- Related Docs:

---

# 2. Demo Goal

## 2.1 このデモで証明すること

このデモを通じて、ユーザーに何を理解・実感してもらうかを一文で定義する。

> 例:  
> 紙帳票をアップロードするだけで、AIが必要項目を抽出し、確認可能な構造化データへ変換できることを体験してもらう。

## 2.2 体験終了時の理想状態

ユーザーが体験後に、次のように感じる状態を目指す。

> 「____________________________________________」

## 2.3 デモとしての最重要価値

- [ ] 分かりやすさ
- [ ] 速さ
- [ ] 驚き
- [ ] 実務感
- [ ] 信頼性
- [ ] AIらしさ
- [ ] 導入後の想像しやすさ
- [ ] その他:

---

# 3. Common Core Integration

## 3.1 基本方針

本デモは、共通基盤 `ai-demo-core` を利用する。

共通Coreは能力と接続契約を提供し、デモ側はユーザー体験を提供する。

```text
Core
= AI接続・Trial・制限・Provider・Knowledge・Input基盤

Demo
= UI・シナリオ・演出・入力方法・結果表示・業務固有ルール
```

原則として、Coreに存在する機能をデモ側へ複製しない。

## 3.2 使用するCore機能

- [ ] AI Request / Transport
- [ ] Provider Adapter
- [ ] OpenAI
- [ ] Claude
- [ ] Gemini
- [ ] Sample Mode
- [ ] BYOK / API Key Mode
- [ ] Managed Trial / Trial Code
- [ ] Trial Status
- [ ] Usage Limit
- [ ] Budget Limit
- [ ] Pricing
- [ ] Knowledge
- [ ] Document Text Ingest
- [ ] Storage
- [ ] Other:

## 3.3 Core Package

- Package Name:
- Package Path:
- Version / Commit:
- Dependency Method:
  - [ ] file:
  - [ ] workspace
  - [ ] private npm
  - [ ] git
  - [ ] other

## 3.4 Core接続の原則

- Coreロジックをデモ側へコピーしない
- デモ固有差分は Adapter / Config / UI に閉じ込める
- Provider固有処理をデモ側に直接書かない
- Trialロジックをデモ側で再実装しない
- Core変更が必要な場合は、まず「本当に共通化すべきか」を判断する
- デモ固有要件を無理にCoreへ入れない

---

# 4. Access Mode

## 4.1 対応モード

- [ ] Sample
- [ ] API Key / BYOK
- [ ] Trial Code
- [ ] Other:

## 4.2 初期モード

- Default Mode:

## 4.3 Mode UI

- ExperienceModeBar:
  - [ ] 使用
  - [ ] 独自UI
  - [ ] 非表示

## 4.4 未設定時の挙動

- API Key未設定時:
- Trial Code未設定時:
- 接続失敗時:
- 設定クリア方法:

---

# 5. Trial Portal Integration

## 5.1 Portal

- Trial Portal URL:
- Demo ID:
- Return URL:
- Brand ID:

## 5.2 導線

推奨フロー:

```text
Demo
↓
「体験コードを取得」
↓
共通 Trial Portal
↓
コード発行
↓
「デモに戻る」
↓
Trial Code入力
↓
AI体験開始
```

## 5.3 URL例

```text
/trial?demo=<demo-id>&return=<encoded-return-url>
```

## 5.4 Trial制限

- 回数上限:
- 金額上限:
- 有効期限:
- Provider:
- Model:
- IP制限:
- その他:

---

# 6. UI Definition

## 6.1 UIの役割

このデモでユーザーが最初に何を見て、何を操作するかを定義する。

## 6.2 画面構成

- Main Screen:
- Secondary Screen:
- Settings:
- Result Screen:
- Mobile Support:

## 6.3 UI方針

- [ ] 操作中心
- [ ] 説明中心
- [ ] シングルスクリーン
- [ ] 複数ステップ
- [ ] 実務ツール型
- [ ] プレゼン型
- [ ] ハイブリッド型
- [ ] Light
- [ ] Dark
- [ ] Brand Adaptive

## 6.4 独自UI

このデモだけに必要なUIを記載する。

- 
- 
- 

## 6.5 共通化しないもの

原則として以下はデモ側に残す。

- 画面レイアウト
- 業務固有コンポーネント
- 結果カード
- 専用フォーム
- シナリオUI
- 業務フロー表現
- 演出

---

# 7. Scenario Definition

## 7.1 Main Scenario

1. ユーザーが:
2. システムが:
3. AIが:
4. 結果として:
5. ユーザーは:

## 7.2 Experience Flow

```text
開始
↓
入力
↓
AI処理
↓
結果表示
↓
詳細確認
↓
次のアクション
```

必要に応じて変更する。

## 7.3 Sample Scenarios

### Scenario A

- Name:
- Input:
- Expected Process:
- Expected Output:

### Scenario B

- Name:
- Input:
- Expected Process:
- Expected Output:

### Scenario C

- Name:
- Input:
- Expected Process:
- Expected Output:

## 7.4 推奨質問・推奨入力

- 
- 
- 

---

# 8. Experience Direction

## 8.1 演出方針

- Loading:
- AI Processing:
- Progress:
- Transition:
- Success:
- Error:
- Retry:

## 8.2 処理中に見せる情報

- [ ] AIが考えている状態
- [ ] 現在の処理ステップ
- [ ] 読み込んだ情報
- [ ] 抽出中の項目
- [ ] 検索中のナレッジ
- [ ] 進捗率
- [ ] 何も見せず高速表示
- [ ] その他:

## 8.3 演出の禁止事項

- 不必要に長い待機演出
- 実際には行っていないAI処理の偽装
- 過剰なアニメーション
- 本質を隠すLP的説明
- ツール体験を阻害する長文

---

# 9. Input Definition

## 9.1 入力方式

- [ ] Text
- [ ] Chat
- [ ] Form
- [ ] PDF
- [ ] Image
- [ ] Audio
- [ ] CSV
- [ ] JSON
- [ ] Sample Data
- [ ] Other:

## 9.2 Input Adapter

- Adapter Name:
- Core Standard Adapter:
  - [ ] 使用
  - [ ] 一部拡張
  - [ ] Demo固有実装

## 9.3 入力制限

- File Size:
- Supported Formats:
- Max Length:
- Required Fields:
- Max Items:

## 9.4 Sample Input

- 
- 
- 

---

# 10. Output Definition

## 10.1 結果表示形式

- [ ] Natural Language
- [ ] Structured Cards
- [ ] Table
- [ ] JSON
- [ ] CSV
- [ ] Report
- [ ] Score
- [ ] Chart
- [ ] Download
- [ ] Other:

## 10.2 最重要結果

ユーザーに最初に見せる結果を定義する。

- Primary Output:

## 10.3 補助情報

- [ ] 根拠
- [ ] 出典
- [ ] 信頼度
- [ ] 推奨アクション
- [ ] 詳細データ
- [ ] 元データとの比較
- [ ] ダウンロード
- [ ] Other:

## 10.4 Output Adapter

- Adapter Name:
- Structured Output:
- responseFormat:
- temperature:
- Demo固有変換:

---

# 11. Demo-Specific Delta

共通Coreでは吸収せず、このデモ固有として残すものを明示する。

## 11.1 UI Delta

- 
- 

## 11.2 Scenario Delta

- 
- 

## 11.3 Input Delta

- 
- 

## 11.4 Output Delta

- 
- 

## 11.5 Business Rule Delta

- 
- 

## 11.6 Provider / Model Delta

- 
- 

---

# 12. Demo Config

デモ固有Configとして持つ項目を定義する。

```ts
export interface DemoConfig {
  demoId: string;
  demoName: string;
  brandId: string;
  demoType: string;
  defaultMode: string;
  trialPortalUrl?: string;
  provider?: string;
  model?: string;
}
```

本デモ:

```ts
export const demoConfig = {
  demoId: "",
  demoName: "",
  brandId: "",
  demoType: "",
  defaultMode: "sample",
};
```

---

# 13. Implementation Plan

## Step 1 — Theme Requirements Review

テーマ別要件定義書を確認し、目的・対象ユーザー・Must / Should / Won't を確定する。

## Step 2 — Demo Definition

本書で以下を確定する。

- UI
- シナリオ
- 演出
- 入力方式
- 結果表示
- Core利用範囲
- Demo固有Delta

## Step 3 — Core Connection

`ai-demo-core` を接続する。

対象:

- Provider
- Transport
- Access Mode
- Trial
- Usage Limit
- Pricing
- Knowledge / Input

## Step 4 — Demo Config

Brand / Demo / Provider / Trial / Model差分をConfig化する。

## Step 5 — Adapter Implementation

必要な Input Adapter / Output Adapter を実装する。

## Step 6 — UI Implementation

デモ固有UIを実装する。

## Step 7 — Experience Implementation

シナリオ・演出・状態遷移・結果表示を実装する。

## Step 8 — Trial Portal Integration

体験コード取得導線とReturn URLを接続する。

## Step 9 — Acceptance

Sample / BYOK / Trialの主要フローを確認する。

## Step 10 — Deploy

本番デプロイし、Portal / Return URL / Trial Gatewayを本番環境で確認する。

---

# 14. Acceptance Criteria

## 14.1 Demo Experience

- [ ] デモの目的が明確
- [ ] 開いた直後に操作を開始できる
- [ ] メインシナリオが最後まで通る
- [ ] 入力方式が明確
- [ ] AI処理中の状態が分かる
- [ ] 結果の最重要情報が最初に見える
- [ ] エラー時に次の行動が分かる

## 14.2 Core Integration

- [ ] Coreロジックを複製していない
- [ ] Provider接続はCore経由
- [ ] Trial処理はCore経由
- [ ] Usage / Budget LimitはCoreまたは共通契約経由
- [ ] Demo固有差分はConfig / Adapter / UIに閉じている

## 14.3 Access Modes

- [ ] Sample動作
- [ ] BYOK動作
- [ ] Trial Code動作
- [ ] 未設定時UIが適切
- [ ] 設定クリア可能

## 14.4 Trial Portal

- [ ] 取得リンク動作
- [ ] 正しいDemo IDを渡す
- [ ] 正しいReturn URLを渡す
- [ ] 発行後に元デモへ戻れる
- [ ] 発行コードでAI利用できる

## 14.5 Production

- [ ] Build成功
- [ ] Type Check成功
- [ ] 本番URLで主要フロー成功
- [ ] 環境変数整理済み
- [ ] README / HANDOFF更新済み

---

# 15. Definition of Done

本デモは、次の状態を満たしたとき完了とする。

- [ ] テーマ別要件定義書が存在する
- [ ] 本Demo Definitionが完成している
- [ ] Core接続済み
- [ ] Demo固有UIが完成している
- [ ] Main Scenarioが最後まで通る
- [ ] Input / Output Adapterが確定している
- [ ] Demo固有Deltaが明文化されている
- [ ] Sample動作
- [ ] BYOK動作
- [ ] Trial動作
- [ ] Trial Portalへの導線動作
- [ ] 本番デプロイ可能
- [ ] 新規デモ固有のCore複製がない

---

# 16. Design Principle

## Coreは能力を提供する

```text
Provider
Transport
Trial
Limits
Knowledge
Pricing
Input基盤
共通Types
```

## Demoは体験を提供する

```text
UI
Scenario
Experience Direction
Input Method
Output Presentation
Business Rules
Demo-specific Adapter
```

## 判断原則

新しい機能を実装するときは、必ず次を判断する。

> これは複数のデモで本当に共通利用される能力か。  
> それとも、このデモだけの体験か。

共通能力ならCoreを検討する。  
デモ固有の体験ならDemo側に残す。

---

# 17. Recommended Development Contract

新規デモ開発は、原則として次の順序で開始する。

```text
1. テーマ別要件定義書を作る
2. 本Demo Definitionを作る
3. Core利用範囲を決める
4. Demo固有Deltaを決める
5. 実装PLANを作る
6. Coreをつなぐ
7. UI / Scenario / Experienceを実装する
8. Sample / BYOK / Trialを確認する
9. デプロイする
```

原則として、Demo Definitionがない状態では本実装を開始しない。

---

# 18. Final Summary

新規デモ開発では、次の2つを分離する。

```text
テーマ別要件定義書
= 何を、なぜ、誰のために作るか

Demo Definition
= 共通Coreをどう使い、どんな体験として届けるか
```

この分離により、共通Coreの再利用性を保ちながら、各デモではUI・シナリオ・演出・入力方式・結果表示を自由に最適化できる。

目標は、Coreをコピーしてデモを作ることではない。

```text
共通Coreをつなぐ
+
Demo固有の体験を設計する
=
新規AIデモ
```
