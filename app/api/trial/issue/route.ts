import { createTrial } from "@/lib/trial/admin";
import { trialErrorResponse } from "@/lib/trial/http";
import {
  checkPublicIssueRateLimit,
  clientIpFromRequest,
  isPublicIssueEnabled,
} from "@/lib/trial/public-issue";
import { TrialGatewayError } from "@/lib/trial/gateway";
import { resolveDemoEntry } from "@/config/demo-catalog.config";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Public trial issuance for /trial portal.
 * Disabled by default — enable with TRIAL_PUBLIC_ISSUE=on.
 * Rate-limited per IP when enabled.
 */
export async function POST(req: Request) {
  try {
    if (!isPublicIssueEnabled()) {
      throw new TrialGatewayError(
        "FORBIDDEN",
        "公開での体験コード取得は現在停止しています。営業担当にお問い合わせください。",
        403,
      );
    }

    const limited = await checkPublicIssueRateLimit(clientIpFromRequest(req));
    if (!limited.ok) {
      throw new TrialGatewayError("RATE_LIMIT", limited.message, 429);
    }

    const body = (await req.json().catch(() => ({}))) as {
      demo?: string;
      companyLabel?: string;
    };

    const demo = resolveDemoEntry(body.demo);
    const company = body.companyLabel?.trim();
    const label = company
      ? `${demo.labelPrefix}:${company}`.slice(0, 80)
      : `${demo.labelPrefix}:self-serve`.slice(0, 80);

    const created = await createTrial({ label });
    return NextResponse.json({
      plaintextCode: created.plaintextCode,
      shortId: created.shortId,
      label: created.record.label,
      demoId: demo.id,
      expiresAt: created.record.expiresAt,
      maxRequests: created.record.policy.maxRequests,
      hardCapJpy: created.record.policy.hardCapJpy,
      message:
        "体験コードはいま一度だけ表示されます。控えてデモに戻り、入力してください。",
    });
  } catch (e) {
    return trialErrorResponse(e);
  }
}
