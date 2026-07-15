// CORE-CANDIDATE — server only
import { createHash } from "crypto";
import { getRedis, trialKeys } from "@/lib/trial/redis";

function hourBucket(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  return `${y}${m}${day}${h}`;
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/**
 * Rate-limit public trial code issuance (default: 5 / IP / hour).
 * Disable public portal with TRIAL_PUBLIC_ISSUE=off.
 */
export async function checkPublicIssueRateLimit(
  ip: string,
  limitPerHour = 5,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const redis = getRedis();
  const key = trialKeys.issueHour(hashIp(ip || "unknown"), hourBucket());
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 3600 + 60);
  }
  if (count > limitPerHour) {
    return {
      ok: false,
      message:
        "短時間に発行リクエストが集中しています。しばらくしてから再度お試しください。",
    };
  }
  return { ok: true };
}

/**
 * Public self-serve issuance is OFF by default (cost / abuse control).
 * Enable only with TRIAL_PUBLIC_ISSUE=on when intentionally opening the portal.
 */
export function isPublicIssueEnabled(): boolean {
  const flag = process.env.TRIAL_PUBLIC_ISSUE?.trim().toLowerCase();
  if (flag === "on" || flag === "1" || flag === "true") return true;
  return false;
}

export function clientIpFromRequest(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
