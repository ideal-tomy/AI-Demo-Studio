import { executeTrialAsk } from "@/lib/trial/gateway";
import {
  codeHashFromBearer,
  trialErrorResponse,
} from "@/lib/trial/http";
import type { TrialAskRequestBody } from "@/types/trial";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const codeHash = codeHashFromBearer(req);
    const body = (await req.json()) as TrialAskRequestBody;

    if (!body?.systemPrompt || !Array.isArray(body.messages)) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_BODY",
            message: "リクエスト形式が正しくありません。",
          },
        },
        { status: 400 },
      );
    }

    // Never log body / knowledge / messages
    const result = await executeTrialAsk(codeHash, {
      provider: body.provider,
      model: body.model,
      systemPrompt: body.systemPrompt,
      messages: body.messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content ?? ""),
      })),
      knowledgeCharCount: Number(body.knowledgeCharCount) || 0,
      estimatedInputTokens: Number(body.estimatedInputTokens) || 0,
      responseFormat: body.responseFormat,
      temperature: body.temperature,
    });

    return NextResponse.json(result);
  } catch (e) {
    return trialErrorResponse(e);
  }
}
