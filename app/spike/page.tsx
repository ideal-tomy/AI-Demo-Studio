"use client";

import { useState } from "react";
import type { AiProvider } from "@/types/access-mode";
import { getProviderConfig } from "@/config/provider.config";
import { sendAiRequest } from "@/lib/demo-core/ai-transport";

/**
 * Task 00 spike page — raw provider path via sendAiRequest (same as product).
 * Use disposable demo keys only. Do not log keys.
 */
export default function SpikePage() {
  const [provider, setProvider] = useState<AiProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(
    getProviderConfig("openai")?.defaultModel ?? "",
  );
  const [log, setLog] = useState("");
  const [busy, setBusy] = useState(false);

  const switchProvider = (p: AiProvider) => {
    setProvider(p);
    setModel(getProviderConfig(p)?.defaultModel ?? "");
  };

  const run = async (mode: "ok" | "invalid") => {
    setBusy(true);
    setLog("running…");
    const key = mode === "invalid" ? "invalid-key-for-spike-test" : apiKey;
    try {
      const started = Date.now();
      const result = await sendAiRequest({
        accessMode: "byok-direct",
        provider,
        apiKey: key,
        model,
        systemPrompt: "Reply with OK only.",
        messages: [{ role: "user", content: "ping" }],
        maxOutputTokens: 16,
      });
      setLog(
        JSON.stringify(
          {
            ok: true,
            ms: Date.now() - started,
            text: result.text,
            usage: result.usage,
            model: result.model,
            provider: result.provider,
          },
          null,
          2,
        ),
      );
    } catch (e) {
      const err = e as { normalized?: unknown; message?: string };
      setLog(
        JSON.stringify(
          {
            ok: false,
            error: err.normalized ?? err.message ?? String(e),
          },
          null,
          2,
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Provider Browser Direct Spike</h1>
      <p className="text-sm text-[var(--brand-muted)]">
        Task 00 verification. Results →{" "}
        <code>docs/provider-browser-direct-spike.md</code>
      </p>

      <label className="block text-sm">
        Provider
        <select
          className="mt-1 w-full rounded border px-2 py-2"
          value={provider}
          onChange={(e) => switchProvider(e.target.value as AiProvider)}
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="google">Gemini</option>
        </select>
      </label>

      <label className="block text-sm">
        Model ID
        <input
          className="mt-1 w-full rounded border px-2 py-2"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </label>

      <label className="block text-sm">
        API Key (session only — not logged)
        <input
          type="password"
          className="mt-1 w-full rounded border px-2 py-2"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          autoComplete="off"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || !apiKey}
          onClick={() => void run("ok")}
          className="rounded bg-[var(--brand-accent)] px-4 py-2 text-white disabled:opacity-40"
        >
          Send test
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void run("invalid")}
          className="rounded border px-4 py-2 disabled:opacity-40"
        >
          Invalid key test
        </button>
      </div>

      <pre className="overflow-auto rounded border bg-white p-3 text-xs whitespace-pre-wrap break-all">
        {log || "No result yet"}
      </pre>
    </div>
  );
}
