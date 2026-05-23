# Session Close — 2026-05-23 — /private-mentor 500 fix (mentor-profile decrypt guard)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Tier:** `code-elevated` — **Elevated** risk. PEV loop (PR10). AC7 NOT engaged. PR6 NOT engaged.
**Date:** 2026-05-23.

Founder reported `/private-mentor` returning a 500 on every message (console: `Failed at step: get_primary_response_mentor. Detail: Unsupported state or unable to authenticate data`; chat fallback "I encountered an issue processing your message."). Diagnosed to an AES-256-GCM auth-tag failure decrypting the founder's `mentor_profiles` row, escalated to a fatal 500 by the one unguarded profile-load call. Wrapped that call so it degrades to no-profile like its two siblings already do. Founder deployed and confirmed the mentor responds again. **The crash is fixed; the underlying decrypt failure is NOT — the profile is still undecryptable and that remediation is the next decision.**

## Decisions Made
- `D-FOUNDER-HUB-MENTOR-PROFILE-DECRYPT-GUARD-2026-05-23` appended. Guard the unwrapped index-2 `loadMentorProfile` call in `/api/founder/hub` (`.catch` → log + `null`) so a profile-decrypt failure degrades to no-profile instead of 500-ing the conversation. → Stops the crash. Does **not** recover the profile.

## Status Changes
| Item | Old | New |
|---|---|---|
| `/private-mentor` conversation | 500 on every message | **Working** — mentor responds (without personalised profile) |
| `/api/founder/hub` index-2 profile load | unguarded (raw `loadMentorProfile`) → fatal on decrypt failure | **guarded** (`.catch` → null), matching the two sibling loaders |
| The decrypt guard | Scoped | **Verified (production), 2026-05-23** (commit `38598da`; founder deployed + confirmed live) |
| Founder's `mentor_profiles` decrypt | (assumed working) | **Failing — OPEN** (row undecryptable with the in-prod key; remediation deferred) |

## Root cause (for future reference)
- Error string `Unsupported state or unable to authenticate data` = Node crypto `Decipheriv.final` on an **AES-256-GCM auth-tag failure**. The only Node-GCM decrypt in the repo is `decryptProfileData()` (`website/src/lib/server-encryption.ts:101`).
- Path: `/private-mentor` → `/api/founder/hub` → `getPrimaryAgentResponse` (`get_primary_response_mentor`) → `loadMentorProfile(userId)` (`mentor-profile-store.ts:154`) → `decryptProfileData()` of the founder's `mentor_profiles` row.
- Crash stack pinned it to `Promise.all (index 2)` in `route.js` = the **raw `loadMentorProfile(userId)`** at `route.ts:520–524` index 2 (reached only when `MENTOR_CONTEXT_V2='true'`). An earlier `[practitioner-context] Failed to load profile … (index 1)` log = the SAME failure on a wrapped sibling that swallowed it — confirming the failure is in the profile data itself, and only the unguarded call escalated to a 500.
- The two siblings (`getProjectedPractitionerContext` / `getFullPractitionerContext`) already `try/catch` → null; index 2 didn't. Fix matches them.
- `MENTOR_CONTEXT_V2=false` is NOT a workaround — both flag states reach the same decrypt.

## Next Session Should
Decide how to repair the **underlying decrypt** (the profile is currently unreadable, so the mentor runs generically). Options, in recommended order:
1. **Recover the original key (Option A).** Restore the exact 64-hex value that encrypted the row in Vercel → Project → Settings → Environment Variables → `MENTOR_ENCRYPTION_KEY`. If recoverable → profile decrypts intact, no data loss.
2. **Probe wrong-key-vs-old-row first.** Do other same-key features (Sage Reflect, mentor appendix) also fail to decrypt *recently written* data? Yes → env key value is globally wrong. Only the profile fails → the row predates a key change.
3. **Rebuild the profile (Option C)** under the current key if the original key is unrecoverable (lost key = unrecoverable ciphertext — authenticated encryption has no backdoor).

Any key/decrypt change is **Critical (R17f / 0d-ii)** → full Critical Change Protocol before deploy. Starting points if rotate-and-re-encrypt is chosen: the `ServerEncryptedPayload.version` field + `operations/runbooks/substrate-layer2-key-rotation.md`.

## Blocked On
Nothing blocking the unblock (shipped). The profile repair is **waiting on a founder decision** (Option A / probe / C above) — not on any build work.

## Open Questions
- Why the row stopped decrypting: `MENTOR_ENCRYPTION_KEY` value mismatch vs corrupted/foreign row. Not distinguished yet (needs the Vercel value or a look at the row + the probe in "Next Session Should").
- Whether the key was ever rotated (no rotation commit found in git for `MENTOR_ENCRYPTION_KEY`, but key-management has been an active area — `2026-05-10-stage-1-a4-key-management`).

## Verification Method Used (0c Framework)
API endpoint / code path. Static: `npx tsc --noEmit` clean (0 errors site-wide); repo pre-commit hook re-ran TypeScript + ESLint safety-module checks → passed. Execution-path confirmation (PR2): traced the guarded call in the live `Promise.all`, and confirmed `storedProfile` is null-guarded at every downstream use (`route.ts:574, :606, :656`). Live: founder deployed and confirmed `/private-mentor` returns normal replies.

## Risk Classification Record (0d-ii)
**Elevated** — error-handling change on a live read path. Does NOT touch the cipher, key handling, auth-tag verification, or stored data, so R17f (encryption change → Critical) is **not** triggered and AC7 is not engaged. PR6 not engaged (no distress/Zone-2/Zone-3 logic).

## Diagnostic-certainty (PR10)
**Diagnostic-certain — root cause identified** for the crash (unwrapped index-2 decrypt rejection; pinned by stack + single-GCM-path grep; tsc-clean; founder-verified live). **Diagnostic-uncertain — symptom level** for the underlying decrypt failure (key-value mismatch vs corrupted row; the guard fixes the crash symptom, not the data root cause). Founder explicitly elected the symptom-level fix ("fix the crash now") knowing it does not recover the profile.

## Side effect owned (cleanup done by founder)
The sandbox commit left two empty stale lock files (`.git/HEAD.lock`, `.git/index.lock`) it couldn't unlink (mount denies unlink inside `.git`). Founder cleared them with `rm -f .git/HEAD.lock .git/index.lock` before `git push`. Harmless leftover `.git/objects/**/tmp_obj_*` files remain; an optional `git gc` clears them, no urgency.

## Founder Verification (Between Sessions)
Already done live (mentor responds). To re-confirm independently:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit          # expect: exit 0
```
Then open https://www.sagereasoning.com/private-mentor and send a message → expect a normal reply, no 500. Vercel logs will show `[founder/hub] mentor profile load failed; degrading to no-profile:` — EXPECTED (the guard firing; the underlying decrypt is still failing until the key is resolved).

**Production state at session close:** `/private-mentor` **WORKING** (degraded — no personalised profile). Commit `38598da` on `main` deployed to Vercel. `MENTOR_ENCRYPTION_KEY` set (but does not decrypt the founder's profile row — root cause OPEN). No schema/env/data change this session. All other production state unchanged from the prior close (`2026-05-23-E1-agent-card-verdict-close.md`).
