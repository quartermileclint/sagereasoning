# Canonical Patterns — Reusable Working Patterns Promoted Under PR8

**Status:** Adopted 2026-04-26 under D-CANONICAL-PATTERNS-CREATED. See decision-log entry of the same date.
**Source:** First entry promoted from PR5 candidate observations under PR8's third-recurrence rule (Console-snippet auth-cookie discovery — observed 4 times across Sessions 3.5, 4, 5, 6 of ADR-PE-01).
**Governs:** A small set of reusable working patterns that have earned canonical status by surviving repeated successful use across sessions. Each entry names what the pattern is, when to use it, the exact mechanic, and the recurrence trail that justified promotion.
**Does not govern:** The work itself (manifest + project instructions + ADRs do that), how sessions open or close (session-opening-protocol does that), or knowledge gaps requiring re-derivation (knowledge-gaps.md does that). Canonical patterns are working tools, not knowledge gaps — they earned promotion by working repeatedly, not by causing confusion.

---

## Maintenance

- **Promotion criterion:** Three successful uses in distinct sessions without rediscovery (PR8). The recurrence trail and the promotion entry's session list cite the three.
- **Where candidates live:** `/operations/knowledge-gaps.md` Carry-Forward Notes section (PR5 candidates) and individual session handoffs (PR8 candidate counters). When a candidate reaches 3-of-3, it migrates here.
- **Append-only structure:** New patterns are added at the bottom under their own `## CP-N — [Short Name]` heading. No reordering of existing entries; no in-place edits beyond clarifying notes (with a "Revised [date]" line).
- **Retirement:** A canonical pattern that has been superseded by a better one (or whose underlying mechanic has changed) is moved to a "Retired" section at the bottom, with the supersession reason and the new replacement named. Original wording preserved.

---

## CP-1 — Console-snippet Auth-Cookie Discovery

**Promoted:** 2026-04-26 (this file's creation entry).
**Source observations:**
- **Session 3 (ADR-PE-01)** — original rediscovery; required three iterations to land on the correct cookie shape.
- **Session 3.5 (ADR-PE-01)** — first successful reuse without rediscovery.
- **Session 4 (ADR-PE-01)** — second successful reuse.
- **Session 5 (ADR-PE-01)** — third successful reuse (loader verification, five probes via consolidated snippet).
- **Session 6 (ADR-PE-01)** — fourth successful reuse (reflect verification, three probes via consolidated snippet).
- **Recurrence count at promotion:** 4 of 3 (conservative; PR8 promotion threshold met one session prior, deferred until the cleanup pass).

**When to use:** When verifying a deployed API endpoint from the browser's developer Console on any authenticated page of `sagereasoning.com`. The pattern lets you call any same-origin API route directly from the Console with a valid Authorization header, without leaving the page or running a local script.

**The mechanic:**

```javascript
// Read the Supabase auth cookie directly from document.cookie
const cookies = Object.fromEntries(
  document.cookie.split('; ').map(c => {
    const [key, ...val] = c.split('=');
    return [key, val.join('=')];
  })
);

// The auth cookie 'sb-access-token' contains the raw JWT directly.
// NOT a JSON envelope, NOT a chunked pattern. URL-decode it once.
const accessToken = decodeURIComponent(cookies['sb-access-token']);

// Use it as the Authorization header on a same-origin fetch call.
const response = await fetch('/api/[your-endpoint]', {
  method: 'POST',  // or GET, etc.
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({ /* your payload */ }),
});

const result = await response.json();
console.log({ status: response.status, ...result });
```

**Why this works:**
- Supabase's browser SDK stores the access token in a single cookie named `sb-access-token`.
- The cookie value is the raw JWT, URL-encoded once (the `decodeURIComponent` call reverses the URL encoding).
- The JWT is what server-side `getUser()` validates; passing it as the `Authorization: Bearer <token>` header authenticates the same-origin fetch call exactly as if it came from the page's normal client code.
- Running the snippet from `https://www.sagereasoning.com/[any-authenticated-page]` ensures same-origin (no CORS), valid cookie scope, and a fresh JWT (refreshed automatically by the SDK).

**What this is NOT:**
- NOT a JSON envelope. Earlier rediscoveries assumed the cookie value was JSON containing a `currentSession.access_token` field — that is the SDK's localStorage/IndexedDB pattern, not its cookie-storage pattern. The cookie is the raw JWT.
- NOT a chunked pattern. Some Supabase configurations split very large session objects across multiple cookies (`sb-access-token.0`, `sb-access-token.1`, etc.) — that pattern applies to localStorage, not cookies, and not to this project's deployment.
- NOT a way to bypass authentication. The token is the founder's own session token; the same authentication checks apply as for any normal page request.

**Required preconditions:**
- Founder is signed in to `sagereasoning.com` in the same browser tab.
- The Console snippet is run on a page served from the same origin (any `https://www.sagereasoning.com/*` page works; `/founder-hub` is the standard choice because it loads quickly and is already authenticated).
- The endpoint being called is a same-origin API route (`/api/*`).

**Verification probe template (consolidated multi-probe snippet):**

```javascript
// Multi-probe verification snippet — adapt the bodies for the endpoint under test.
const cookies = Object.fromEntries(
  document.cookie.split('; ').map(c => {
    const [key, ...val] = c.split('=');
    return [key, val.join('=')];
  })
);
const accessToken = decodeURIComponent(cookies['sb-access-token']);

async function probe(label, body) {
  const t0 = performance.now();
  const response = await fetch('/api/[your-endpoint]', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  const duration_ms = Math.round(performance.now() - t0);
  console.log(label, { status: response.status, duration_ms, ...result });
  return result;
}

await probe('PROBE 1 (description)', { /* body 1 */ });
await probe('PROBE 2 (description)', { /* body 2 */ });
await probe('PROBE 3 (description)', { /* body 3 */ });
```

**Limitations:**
- The token expires (typically 1 hour). If a probe returns 401 unexpectedly, refresh the page (which refreshes the cookie via the SDK) and re-run.
- The token grants the founder's own permissions. Cannot be used to verify endpoints requiring a different user's identity (would need to sign in as that user first).
- Same-origin only. Cross-origin Console calls would need different auth handling (out of scope here).

**Rollback / supersession:**
- If Supabase changes its cookie name or value format in a future SDK version, this pattern would supersede; a new entry would be added under CP-N+1 with the new mechanic, and CP-1 would move to a Retired section with the supersession reason and date.
- If a different verification mechanism becomes preferred (e.g., a server-side verification harness, or a CLI-based equivalent), the new mechanism gets its own canonical-patterns entry and CP-1 stays valid for browser Console use.

---

*End of canonical-patterns v1. New patterns appended below this line as they earn promotion under PR8's third-recurrence rule.*
