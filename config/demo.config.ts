// DEMO-SPECIFIC
import type { DemoConfig } from "@/types/demo";

export const demoConfig: DemoConfig = {
  id: "universal-studio",
  name: "Universal AI Demo Studio",
  description: "自社ナレッジを入れて、その場で自社向けAIを試せるデモ環境です。",
  baseSystemPrompt: `あなたはクライアント企業の社内情報を参照して回答するアシスタントです。
参照データに書かれている事実を優先し、根拠がない内容は推測せず「参照データに記載がありません」と伝えてください。
回答は簡潔で実務的な日本語にしてください。`,
  demoSpecificPrompt: `このデモでは、ユーザーが貼り付けた自社ナレッジを根拠として回答します。
ナレッジ内の数値・規定名・手順は、可能な限り正確に引用してください。`,
  rolePresets: [
    {
      id: "faq",
      label: "社内FAQアシスタント",
      description: "社内規定やよくある質問に答える",
      prompt:
        "社内FAQアシスタントとして、質問に対して根拠付きで簡潔に回答してください。",
    },
    {
      id: "manual",
      label: "業務マニュアル検索",
      description: "手順やルールを探す",
      prompt:
        "業務マニュアル検索アシスタントとして、手順・注意点・必要な条件を整理して回答してください。",
    },
    {
      id: "customer",
      label: "顧客対応アシスタント",
      description: "顧客向けの丁寧な回答案を作る",
      prompt:
        "顧客対応アシスタントとして、丁寧で分かりやすい回答案を作成してください。断定できない点は確認が必要である旨を添えてください。",
    },
    {
      id: "sales",
      label: "営業支援アシスタント",
      description: "提案や説明のたたき台を作る",
      prompt:
        "営業支援アシスタントとして、メリット・根拠・次の質問例を含めて提案のたたき台を作成してください。",
    },
    {
      id: "custom",
      label: "自由設定",
      description: "詳細設定の指示を優先する",
      prompt: "追加のカスタム指示に従って回答してください。",
    },
  ],
  defaultRoleId: "faq",
  exampleQuestions: [
    "このナレッジの要点を3つで教えてください",
    "明記されている数値や上限を一覧にしてください",
    "問い合わせがあったときの標準的な手順は？",
  ],
  knowledgeHints: [
    "社内規定",
    "FAQ",
    "業務マニュアル",
    "商品・サービス説明",
  ],
  sampleKnowledge: `【サンプル社内FAQ】

Q. 有給休暇の申請期限は？
A. 利用希望日の3営業日前までに申請してください。緊急時は上長承認があれば当日申請も可です。

Q. 経費精算の上限（日帰り交通費）は？
A. 日帰り交通費は1回あたり上限8,000円です。それ以上は事前稟議が必要です。

Q. リモート勤務の上限日数は？
A. 週3日までです。週4日以上は部門長の書面承認が必要です。

【営業ルール】
・新規提案資料は先方へ送付前に必ず上長レビューを受けること
・契約前見積の有効期限は発行日から14日
`,
  allowedProviders: ["openai", "anthropic", "google"],
  knowledgePolicy: {
    recommendedMax: 20000,
    warningFrom: 20001,
    hardLimit: 30000,
  },
  // Appendix B-1
  chat: {
    maxHistoryMessages: 8,
  },
};
