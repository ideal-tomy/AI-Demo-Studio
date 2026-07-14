import { assertAdminSecret, revokeTrial } from "@/lib/trial/admin";
import { trialErrorResponse } from "@/lib/trial/http";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    assertAdminSecret(req.headers.get("x-admin-secret"));
    const body = (await req.json()) as {
      codeHash?: string;
      code?: string;
    };
    const target = body.codeHash || body.code;
    if (!target?.trim()) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_BODY",
            message: "codeHash または code が必要です。",
          },
        },
        { status: 400 },
      );
    }
    const ok = await revokeTrial(target.trim());
    if (!ok) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "対象の体験コードが見つかりません。" } },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, revoked: true });
  } catch (e) {
    return trialErrorResponse(e);
  }
}
