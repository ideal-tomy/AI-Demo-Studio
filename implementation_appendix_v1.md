# 実装指示アペンディックス v1.0

**位置づけ:** `ai_demo_studio_reference_requirements.md` v1.2 Final への追加実装指示。
本書の内容はv1.2の要件に追加される。v1.2と矛盾する箇所は本書を優先する。
**対象:** Phase 1実装(Cursor向け)
**作成日:** 2026-07-15

---

# A. 実装順序の指示

Task 00は要件どおりOpenAI / Anthropic / Geminiの3社すべてを初日に検証する。

ただし、Task 01以降は次の順序で進める。

```text
Step 1: OpenAIのみで縦に貫通させる
        Setup → APIキー → ナレッジ → チャット → Usage → コスト表示
        まで、OpenAI 1社で完全に動く状態を作る

Step 2: Anthropic Adapterを追加する

Step 3: Gemini Adapterを追加する

Step 4: Brand Config切替(AXEON / ideal)の表示確認
```

**理由:** 3 Providerを並行実装すると「どれも半分動く」状態が長く続く。Adapter設計が正しければ、2社目以降の追加は小さい差分で済む。Step 1完了時点が最初の動作確認ポイント。

---

# B. 要件への追加(5項目)

## B-1. 会話履歴の送信ポリシー【FR-012へ追加・必須】

2回目以降の質問時にAPIへ送る会話履歴は、**直近8メッセージ(4往復)まで**とする。

```ts
// demo.config.ts へ追加
chat: {
  maxHistoryMessages: 8,  // APIへ送信する直近メッセージ数
}
```

- 画面上のチャット表示は全履歴を保持してよい。制限するのはAPIへ送る `messages` のみ
- ナレッジ全文はSystem Prompt側に含まれるため、履歴とは別枠(履歴側にナレッジを重複させない)
- 履歴を切り詰めても、System Prompt+ナレッジは毎回送る

**受け入れテスト追加:** 10往復以上会話しても、送信トークンが際限なく増えず、CONTEXT_TOO_LARGEにならない。

## B-2. プロンプトキャッシュ用のプレフィックス安定化【FR-010へ追加】

System Prompt+ナレッジのプレフィックス部分は、**同一セッション内で毎回バイト単位で同一**に保つ。

- タイムスタンプ、乱数、会話ごとに変わる値をSystem Promptやナレッジ区切りに入れない
- 可変要素(会話履歴、ユーザー質問)は必ずプレフィックスの後に置く
- 目的: OpenAIの自動プロンプトキャッシュを効かせる(キャッシュ入力は通常入力の約1/10)

Phase 1でのキャッシュ対応方針:

```text
OpenAI    : 自動キャッシュ。プレフィックスを安定させるだけでよい
Anthropic : 明示的なcache_control指定が必要 → Phase 1では実装しない
Gemini    : 暗黙キャッシュ → Phase 1では特別対応しない
```

いずれのProviderでも、レスポンスにcached input相当のUsageが含まれる場合はUsage Normalizerで拾い、コスト計算に反映する(cached単価が未登録のProviderは通常input単価で計算してよい)。

## B-3. 接続テストの実装方式【FR-003へ追加】

接続テストは、**選択中のモデルへの最小補完リクエスト**で行う。

```text
方式: 選択モデルへ固定の短い質問を送信
     maxOutputTokens をごく小さく制限(例: 16)
理由: モデル一覧取得ではなく実際の利用経路を叩くことで、
     認証・権限・モデル利用可否を1回でまとめて検証できる。
     「接続成功したのに本番の質問で権限エラー」を防ぐ
コスト: 1回1円未満。許容する
```

接続テストの結果はFR-003の状態分類(認証エラー / 権限エラー / モデル利用不可 / 通信エラー)へそのまま正規化する。

## B-4. 対面商談後の全設定クリア【§8へ追加】

運営者管理端末での対面商談(運営者所有キーを使うケース)では、**商談終了後に全設定クリア(FR-019)を実施する**ことを標準運用とする。

- 対象: APIキーに加え、クライアントのナレッジ・会話履歴(localStorageに残るため)
- READMEの運用手順にも1行記載する

## B-5. デフォルトモデルの品質確認【§29へ追加】

受け入れテストに以下を追加する。

- [ ] 上限近く(25,000〜30,000文字)のナレッジを投入し、各Providerのデフォルトモデルで「ナレッジ内の特定の規定・数値を正しく引用して回答できるか」を確認する
- [ ] 品質が不足するProviderがあれば、そのProviderの `defaultModel` を上位モデルへ変更する(Config変更のみで対応)

**背景:** 軽量モデル(特にgpt-5.4-nano)は長文コンテキストからの情報検索精度に弱点の報告がある。このデモの核心は「貼り付けたナレッジから正しく答える」ことなので、初期値はテスト結果で確定する。

---

# C. Task 00 Provider別の既知の注意点

Task 00で以下を前提知識として持って検証すること。**知らないとNo-Go誤判定や手戻りが発生する。**

## C-1. Anthropic

- ブラウザからの直接通信はCORS対応済み。ただしリクエストヘッダーに以下が**必須**:

```text
anthropic-dangerous-direct-browser-access: true
```

- このヘッダーなしのリクエストは拒否される。付けずに失敗してもNo-Go判定しないこと
- Anthropic APIは `max_tokens` が**必須パラメータ**。`AiRequest.maxOutputTokens` はoptionalのため、**Anthropic Adapter側で必ずデフォルト値を補う**(例: 2048)
- System Promptはmessages配列ではなくトップレベルの `system` パラメータへ渡す

## C-2. Google Gemini

- APIキーは **`x-goog-api-key` ヘッダー方式**を使う
- `?key=` のURLクエリパラメータ方式はドキュメント・サンプルに多いが、**NFR-002「APIキーをURLへ含めない」に違反するため禁止**(URLに載ったキーはログ・履歴に残る)
- System Promptは `systemInstruction` フィールドへ渡す
- モデルIDは `gemini-3.1-flash-lite`(Stable)を第一候補とするが、preview ID(`gemini-3.1-flash-lite-preview`)しか通らない環境があるため、Task 00で実際に通るIDを確定し、Provider Configへ記録する

## C-3. OpenAI

- 素のfetchでのブラウザ直接通信は可能(公式には非推奨のため、あくまでBYOK Direct限定デモとして扱う。v1.2 §9のとおり)
- 公式SDKを使う場合は `dangerouslyAllowBrowser: true` が必要になるが、Phase 1は素のfetch優先でよい
- Usageはレスポンスの `usage` フィールドから取得(streaming採用時は `stream_options: { include_usage: true }` が必要)

## C-4. 3社共通

- Task 00の結果は要件どおり `docs/provider-browser-direct-spike.md` へ記録する
- 各社のエラーレスポンス形式は異なる。Task 00の時点で「無効キー時の生レスポンス」を3社分記録しておくと、Task 14(Error Normalizer)の実装が速くなる

---

# D. チェックリスト(本アペンディックス分)

- [ ] B-1: maxHistoryMessagesがConfigにあり、送信messagesが制限される
- [ ] B-1: 10往復以上でもコンテキスト超過しない
- [ ] B-2: System+ナレッジのプレフィックスに可変値が含まれない
- [ ] B-3: 接続テストが最小補完方式で実装されている
- [ ] B-4: READMEに商談後クリアの運用が記載されている
- [ ] B-5: 上限近くナレッジでのデフォルトモデル品質確認を実施した
- [ ] C-1: Anthropic Adapterがヘッダーとmax_tokensデフォルトを持つ
- [ ] C-2: GeminiのAPIキーがヘッダー方式で、URLに含まれない
- [ ] C-4: 3社の無効キー時レスポンスがspikeドキュメントに記録されている

---

**本書の扱い:** Phase 1完了時、本書の内容が要件定義書v1.3へ統合されるか、実装済みとして本書をアーカイブするかを判断する。
