// Shared helpers for Trial API routes
import { hashTrialCode } from "@/lib/trial/hash";
import { TrialConfigError } from "@/lib/trial/redis";
import { TrialGatewayError } from "@/lib/trial/gateway";
import { NextResponse } from "next/server";

export function extractBearer(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h?.toLowerCase().startsWith("bearer ")) return null;
  return h.slice(7).trim() || null;
}

export function codeHashFromBearer(req: Request): string {
  const code = extractBearer(req);
  if (!code) {
    throw new TrialGatewayError(
      "UNAUTHORIZED",
      "体験コードが必要です。",
      401,
    );
  }
  return hashTrialCode(code);
}

export function trialErrorResponse(error: unknown): NextResponse {
  if (error instanceof TrialGatewayError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
  if (error instanceof TrialConfigError) {
    return NextResponse.json(
      { error: { code: "CONFIG", message: error.message } },
      { status: 503 },
    );
  }
  if (error && typeof error === "object" && "status" in error) {
    const status = Number((error as { status: number }).status) || 500;
    if (status === 401) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "認証に失敗しました。" } },
        { status: 401 },
      );
    }
  }
  console.error("[trial-api]", error instanceof Error ? error.message : error);
  return NextResponse.json(
    {
      error: {
        code: "UNKNOWN",
        message: "一時的なエラーが発生しました。しばらくしてからお試しください。",
      },
    },
    { status: 500 },
  );
}
