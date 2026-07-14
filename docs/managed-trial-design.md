# Managed Trial Design Notes (Phase 1.5 — implemented)

**Status:** Implemented  
**Config:** [`config/trial-policy.config.ts`](../config/trial-policy.config.ts)  
**Types:** [`types/trial.ts`](../types/trial.ts)  
**Persistence:** Upstash Redis  
**Admin UI:** [`/admin/trial`](../app/admin/trial/page.tsx)

## Access modes

```ts
type AccessMode = "byok-direct" | "managed-trial" | "client-proxy";
```

- `byok-direct` — Phase 1（ブラウザから Provider へ）
- `managed-trial` — Phase 1.5（ブラウザ → Gateway → **OpenAI only**）
- `client-proxy` — 未実装

**Provider 方針:** Managed Trial の Allowlist は **OpenAI のみ**。Anthropic / Gemini は BYOK 用 Adapter として残すが、体験コード経路では使わない。

## Flow

```text
Client Browser
  └ Trial Code (Bearer)
       ↓
POST /api/trial/ask
  ├ Validation / Expiration / Revoked
  ├ Request Count
  ├ Rate Limit (5/min)
  ├ Concurrency Lock (1)
  ├ Provider / Model Allowlist
  ├ Knowledge / Input token limits
  ├ Spend Reservation → Provider call → Settle
  └ Usage Ledger (metadata only, no bodies)
       ↓
Server Provider Secret → OpenAI（Trial Allowlist）
```

## Redis keys

| Key | Purpose |
|---|---|
| `trial:code:{sha256}` | Trial record (counts, spend, policy, expiry) |
| `trial:ledger:{sha256}` | Metadata events list |
| `trial:rpm:{sha256}:{yyyyMMddHHmm}` | Rate limit counter |
| `trial:lock:{sha256}` | Concurrency lock |
| `trial:index` | ZSET of code hashes for admin list |

Plaintext trial codes are shown **once at issuance**, stored as SHA-256 only.

## Standard policy

| Limit | Value |
|---|---|
| Validity | 7 days |
| Max requests | 10 |
| Hard Cap | ¥500 |
| Knowledge | 30,000 chars |
| Estimated input | 40,000 tokens / request |
| Max output | 2,000 tokens |
| Rate | 5 / minute |
| Concurrency | 1 |

## APIs

| Route | Auth | Purpose |
|---|---|---|
| `POST /api/trial/ask` | Bearer trial code | Ask AI |
| `GET /api/trial/status` | Bearer trial code | Remaining / expiry |
| `POST /api/admin/trial` | `X-Admin-Secret` | Issue code |
| `GET /api/admin/trial` | `X-Admin-Secret` | List |
| `POST /api/admin/trial/revoke` | `X-Admin-Secret` | Revoke |

## Operations

1. Set env: Upstash + `TRIAL_ADMIN_SECRET` + Provider keys
2. Open `/admin/trial`, enter admin secret
3. Issue code with client label
4. Share plaintext code once with the client
5. Client chooses「体験コードで接続」in Setup
6. After demos or compromise: Revoke from admin

### Sales copy example

```text
〇〇様専用のAI体験環境をご用意しました。

体験期間：7日間
利用回数：最大10回
費用：無料

体験コード：XXXXXXXX
```

## Security

- Provider API keys never returned to the browser
- Request / knowledge / answer bodies are not stored in Redis
- Gateway Hard Cap is source of truth (not Provider monthly budget alone)
