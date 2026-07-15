/**
 * Sync Studio Core sources → packages/ai-demo-core (Phase 5).
 * Run from AI-Demo-Studio: node scripts/sync-ai-demo-core-package.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = path.join(root, "packages", "ai-demo-core");

const copies = [
  ["lib/demo-core/access-mode-transport.ts", "demo-core"],
  ["lib/demo-core/ai-transport.ts", "demo-core"],
  ["lib/demo-core/document-text-ingest.ts", "demo-core"],
  ["lib/demo-core/error-normalizer.ts", "demo-core"],
  ["lib/demo-core/knowledge.ts", "demo-core"],
  ["lib/demo-core/managed-trial-transport.ts", "demo-core"],
  ["lib/demo-core/pricing.ts", "demo-core"],
  ["lib/demo-core/prompt-builder.ts", "demo-core"],
  ["lib/demo-core/storage.ts", "demo-core"],
  ["lib/demo-core/usage-normalizer.ts", "demo-core"],
  ["lib/providers/openai-adapter.ts", "providers"],
  ["lib/providers/anthropic-adapter.ts", "providers"],
  ["lib/providers/gemini-adapter.ts", "providers"],
  ["lib/trial/admin.ts", "trial"],
  ["lib/trial/concurrency-lock.ts", "trial"],
  ["lib/trial/gateway.ts", "trial"],
  ["lib/trial/hash.ts", "trial"],
  ["lib/trial/http.ts", "trial"],
  ["lib/trial/rate-limiter.ts", "trial"],
  ["lib/trial/redis.ts", "trial"],
  ["lib/trial/server-adapters.ts", "trial"],
  ["lib/trial/spend-reservation.ts", "trial"],
  ["lib/trial/trial-validator.ts", "trial"],
  ["lib/trial/usage-ledger.ts", "trial"],
  ["types/access-mode.ts", "types"],
  ["types/errors.ts", "types"],
  ["types/provider.ts", "types"],
  ["types/trial.ts", "types"],
  ["types/usage.ts", "types"],
  ["config/pricing.config.ts", "config"],
  ["config/provider.config.ts", "config"],
  ["config/trial-policy.config.ts", "config"],
];

function rewriteImports(content, fromDir) {
  const map = {
    "@/types/": fromDir === "types" ? "./" : "../types/",
    "@/config/": fromDir === "config" ? "./" : "../config/",
    "@/lib/demo-core/": fromDir === "demo-core" ? "./" : "../demo-core/",
    "@/lib/providers/": fromDir === "providers" ? "./" : "../providers/",
    "@/lib/trial/": fromDir === "trial" ? "./" : "../trial/",
  };
  let c = content;
  for (const [a, b] of Object.entries(map)) c = c.split(a).join(b);
  return c;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

for (const dir of ["demo-core", "providers", "trial", "types", "config"]) {
  ensureDir(path.join(pkg, dir));
}

for (const [rel, dir] of copies) {
  const src = path.join(root, rel);
  const dest = path.join(pkg, dir, path.basename(rel));
  let content = fs.readFileSync(src, "utf8");
  content = rewriteImports(content, dir);
  fs.writeFileSync(dest, content);
  console.log("wrote", path.relative(pkg, dest));
}

console.log("sync complete");
