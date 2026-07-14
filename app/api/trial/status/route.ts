import { getTrialStatusForCode } from "@/lib/trial/gateway";
import {
  codeHashFromBearer,
  trialErrorResponse,
} from "@/lib/trial/http";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const codeHash = codeHashFromBearer(req);
    const status = await getTrialStatusForCode(codeHash);
    return NextResponse.json(status);
  } catch (e) {
    return trialErrorResponse(e);
  }
}
