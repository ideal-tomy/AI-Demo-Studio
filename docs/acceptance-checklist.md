# Acceptance Checklist

## Phase 1（BYOK）

要件 §29 + 実装アペンディックス D。

### Task 00 / Spike

- [ ] OpenAI / Anthropic / Gemini を `/spike` で個別検証
- [ ] 無効キー時レスポンスを spike ドキュメントへ記録
- [ ] Go / Conditional Go / No-Go を確定

### Multi-brand / Provider / Chat

- [ ] AXEON / ideal 切替
- [ ] 接続テスト（最小補完）
- [ ] ナレッジ上限・履歴8・Usage/Cost・クリア

### Appendix

- [ ] 商談後クリアが README にある
- [ ] Anthropic ヘッダー + max_tokens / Gemini キー非URL

---

## Phase 1.5（Managed Trial）

- [ ] Upstash + `TRIAL_ADMIN_SECRET` + Provider サーバーキーを設定できる
- [ ] `/admin/trial` で発行できる（平文は1回のみ）
- [ ] `/admin/trial` で即時失効できる
- [ ] Setup で体験コード接続でき、APIキーなしで質問できる
- [ ] UI に「残り N / 10 回」と有効期限が主表示される
- [ ] 10回超過・期限切れ・失効でサーバ拒否される
- [ ] Hard Cap（予約込み）でサーバ拒否される
- [ ] max output 2000・モデル Allowlist がサーバ強制される
- [ ] Network 応答に Provider Secret が含まれない
- [ ] Redis に質問/ナレッジ/回答本文が保存されない（ledger は metadata のみ）
- [ ] Rate limit / 同時実行1 が効く
- [ ] Trial Provider が OpenAI のみ（他社を選べない／サーバ Allowlist）

---

## Phase 1.6（Document Text Ingestion）

- [ ] Setup のナレッジ欄から TXT / MD / PDF（テキスト層）等を読み込み、プレビュー後に適用できる
- [ ] Setup / Studio のカスタム指示に YAML / MD / TXT 等を適用できる
- [ ] スキャンPDF（テキスト抽出不可）で営業品質の未対応メッセージが出る
- [ ] ナレッジ hardLimit（30,000文字）超過時は適用ボタンが無効になる
- [ ] ファイル用の upload API が存在せず、原ファイルをサーバーへ送らない
- [ ] 適用後は既存チャット・Trial 制限がこれまでどおり機能する

---

## Phase 2（Core / UI / Config 分離）

- [ ] 再利用UIが `components/demo-core/` にある
- [ ] `lib/demo-core/index.ts` から Core を import できる
- [ ] DocumentText Ingest が Core / UI に分離されている
- [ ] 画面が Storage API を直接触らない
- [ ] Managed Trial が OpenAI 限定である
- [ ] [`docs/porting-guide.md`](porting-guide.md) がある
- [ ] 分離後も BYOK / Trial / 文書投入が動く
- [ ] `npm run build` が通る
