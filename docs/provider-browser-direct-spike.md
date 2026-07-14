# Provider Browser Direct / CORS Spike

**Document:** Task 00  
**Project:** Universal AI Demo Studio  
**Date:** 2026-07-15  
**Method:** Raw `fetch` from browser (no official SDK in spike path)

---

## Summary matrix

| Provider | localhost | Vercel / deployed origin | Usage obtainable | Invalid key captured | Verdict |
|---|---|---|---|---|---|
| OpenAI | Conditional Go* | Conditional Go* | Yes (`usage`) | Yes | **Conditional Go** |
| Anthropic | Conditional Go* | Conditional Go* | Yes (`usage`) | Yes | **Conditional Go** |
| Google Gemini | Conditional Go* | Conditional Go* | Yes (`usageMetadata`) | Yes | **Conditional Go** |

\*Runtime Go/No-Go depends on live keys and current CORS policy. Implement adapters with documented headers; verify with `/spike` page before sales demos. If a Provider fails CORS in a target browser, set `browserDirectAvailable: false` in `provider.config.ts` and keep the Adapter for Phase 1.5 Gateway.

---

## OpenAI

| Field | Value |
|---|---|
| API | `POST https://api.openai.com/v1/chat/completions` |
| Auth | `Authorization: Bearer <key>` |
| Browser direct | Possible with raw fetch (officially discouraged; BYOK demo only) |
| Usage | Response `usage` (`prompt_tokens` / `completion_tokens`; newer fields may appear) |
| Max tokens | `max_completion_tokens` (or legacy `max_tokens` depending on model) |
| Streaming usage | Needs `stream_options: { include_usage: true }` if streaming (Phase 1 uses non-stream) |

### Known constraints

- Treat as demo-only BYOK Direct, not production recommendation.
- Phase 1 prefers raw fetch over SDK (`dangerouslyAllowBrowser`).

### Invalid key sample shape (record live body during spike)

```json
{
  "error": {
    "message": "Incorrect API key provided: ...",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

Typical HTTP status: **401**

### Spike checklist

- [ ] localhost 200 with valid key
- [ ] deployed origin 200 with valid key
- [ ] invalid key → auth error (no key in console)
- [ ] usage present
- [ ] max output tokens honored
- [ ] Chrome; Safari if available

---

## Anthropic Claude

| Field | Value |
|---|---|
| API | `POST https://api.anthropic.com/v1/messages` |
| Auth | `x-api-key` |
| **Required browser header** | `anthropic-dangerous-direct-browser-access: true` |
| Other headers | `anthropic-version: 2023-06-01` |
| System | Top-level `system` (not in messages) |
| Max tokens | **Required** — Adapter defaults to 2048 when omitted |
| Usage | `usage.input_tokens` / `usage.output_tokens` (+ cache fields if present) |

### Known constraints

- Missing `anthropic-dangerous-direct-browser-access` causes reject — do **not** mark No-Go without testing this header.
- Phase 1 does **not** implement explicit `cache_control` (Appendix B-2).

### Invalid key sample shape

```json
{
  "type": "error",
  "error": {
    "type": "authentication_error",
    "message": "invalid x-api-key"
  }
}
```

Typical HTTP status: **401**

### Spike checklist

- [ ] with dangerous-direct header: localhost / deployed OK
- [ ] without header: expected reject (not counted as product No-Go)
- [ ] invalid key body recorded
- [ ] usage present

---

## Google Gemini

| Field | Value |
|---|---|
| API | `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` |
| Auth | **`x-goog-api-key` header only** |
| Forbidden | `?key=` query param (NFR-002 — keys must not appear in URLs) |
| System | `systemInstruction.parts[].text` |
| Usage | `usageMetadata.promptTokenCount` / `candidatesTokenCount` / `totalTokenCount` |
| Default model candidate | `gemini-3.1-flash-lite` (fallback: `gemini-3.1-flash-lite-preview`) |

### Known constraints

- Confirm which model ID works in the target project; update `provider.config.ts` accordingly.
- Implicit caching only in Phase 1 — no special cache API wiring.

### Invalid key sample shape

```json
{
  "error": {
    "code": 400,
    "message": "API key not valid. Please pass a valid API key.",
    "status": "INVALID_ARGUMENT"
  }
}
```

Typical HTTP status: **400** (sometimes treated as auth by message matching)

### Spike checklist

- [ ] header auth works (no query key)
- [ ] stable vs preview model ID confirmed → write ID into Provider Config
- [ ] invalid key body recorded
- [ ] usageMetadata present

---

## How to re-run spike

1. `npm run dev`
2. Open `/spike`
3. Paste a disposable demo key per Provider
4. Run “Send test” and “Invalid key test”
5. Paste status + redacted body into this file
6. Set Go / Conditional Go / No-Go
7. If No-Go: `browserDirectAvailable: false` for that Provider

---

## Phase 1 product implication

| Verdict | Action |
|---|---|
| Go / Conditional Go | Enable in Setup UI; document browser limits |
| No-Go | Disable BYOK Direct in Config; keep Adapter for Managed Trial Gateway (Phase 1.5) |

Adapters implemented in-repo assume Conditional Go with documented headers. Operators must complete live checklists above before customer-facing demos.
