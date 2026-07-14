import { assertAdminSecret, createTrial, listTrials } from "@/lib/trial/admin";
import { trialErrorResponse } from "@/lib/trial/http";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    assertAdminSecret(req.headers.get("x-admin-secret"));
    const items = await listTrials(50);
    return NextResponse.json({ items });
  } catch (e) {
    return trialErrorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    assertAdminSecret(req.headers.get("x-admin-secret"));
    const body = (await req.json().catch(() => ({}))) as { label?: string };
    const created = await createTrial({ label: body.label });
    return NextResponse.json({
      plaintextCode: created.plaintextCode,
      shortId: created.shortId,
      label: created.record.label,
      expiresAt: created.record.expiresAt,
      maxRequests: created.record.policy.maxRequests,
      hardCapJpy: created.record.policy.hardCapJpy,
      message:
        "体験コードはいま一度だけ表示されます。クライアントへ安全に共有してください。",
    });
  } catch (e) {
    return trialErrorResponse(e);
  }
}
