import { NextResponse } from "next/server";
import {
  extractBearer,
  codeHashFromBearer,
  trialErrorPayload,
} from "@axeon/ai-demo-core/trial/http";

export { extractBearer, codeHashFromBearer };

export function trialErrorResponse(error: unknown): NextResponse {
  const payload = trialErrorPayload(error);
  return NextResponse.json(payload.body, { status: payload.status });
}
