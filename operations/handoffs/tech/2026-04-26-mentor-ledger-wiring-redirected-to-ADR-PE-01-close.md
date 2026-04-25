# Session Close — 26 April 2026 (Mentor-Ledger Wiring Brief Redirected to ADR-PE-01)

**Stream:** tech
**Governing frame:** `/adopted/session-opening-protocol.md`
**Tier read this session:** 1, 2, 3, 6, 8, 9 (every-session + KG governance scan + code)
**Risk classification across the session:** Standard. Documentation-only output. No code, no schema, no live-data writes. ADR draft produced; founder-approval workflow pending.

The session opened on a brief titled "wire engine-mentor-ledger." Read-and-report (Steps 1–6) revealed the brief's premise was incorrect: `sage-mentor/mentor-ledger.ts` is a pure type/logic module with zero database calls and zero callers in `/website/src`. After founder review, the session was redirected to the deferred D-PE-2 (b) work (pattern-engine storage location). Output: `/drafts/ADR-PE-01-pattern-analysis-storage.md`.

## Decisions Made

- **Brief premise corrected at session open.** The session brief described `engine-mentor-ledger` as the missing write-side that pattern-engine reads. Read-and-report found: zero Supabase calls in `mentor-ledger.ts`, zero callers in `/website/src`, zero migration references to a `mentor_ledger` table or any ledger-shaped column. The ledger module is the journal-extraction accountability layer (six entry kinds: aim/commitment/realisation/question/tension/intention) — not a session-outcome write-side. Surfaced as "I'd push back on this" before any code or wiring was attempted.
- **Founder selected Option A hub-scoped + Option 3 storage + D7 cloud-storage acceptance.** Specifically: (i) proceed with the deferred D-PE-2 (c) loader work, hub-scoped per-(user, hub); (ii) persist pattern-engine output inside the encrypted profile blob (`mentor_profiles.encrypted_profile`) keyed by `hub_id`; (iii) intimate-data cloud storage continues under the current accepted D7 posture, named explicitly so a future D7 resolution is not blocked by silent architectural choice.
- **ADR-PE-01 v1 drafted.** Full draft at `/drafts/ADR-PE-01-pattern-analysis-storage.md`, matching the ADR-Ring-2-01 format. Documents the four storage options (no persistence / sidecar / plain JSONB column / encrypted-blob field), the Option 3 reasoning, schema changes (none), encryption-pipeline impact (Critical under PR6), R17b/R17c/R17f footprint, coordination with the loader, single-endpoint proof sequence, risks accepted, rollback procedures, and five open items (O1–O5).
- **Engine-mentor-ledger capability item does not move today.** The capability inventory line for `engine-mentor-ledger` (Isolated → Wired) does not progress in this session. Pursuing ledger persistence is out of scope of ADR-PE-01 and would be a separate ADR if undertaken. Named in the ADR's §13 summary table as "out of scope."

## Status Changes

| Item | Old status | New status |
|---|---|---|
| `sage-mentor/mentor-ledger.ts` | Capability inventory: not-ready (Isolated, not integrated) | **Status unchanged.** Brief premise corrected; this session did not move the item. The module is correctly described as a pure journal-extraction layer with no DB write-side. |
| Pattern-engine storage decision (D-PE-2 (b)) | Deferred (per 2026-04-25 pattern-engine close) | **Resolved at the ADR draft level — Option 3 (encrypted-blob field) selected, draft pending founder approval at next session open.** |
| `/drafts/ADR-PE-01-pattern-analysis-storage.md` | Did not exist | **Designed (drafted v1).** Awaiting founder approval to promote to `/compliance/ADR-PE-01-pattern-analysis-storage.md` per D6-A archive protocol. |
| D-PE-2 (c) — live `mentor_interactions` loader | Deferred Critical | **Still deferred.** Hub-scoping selected by founder (per-(user, hub)). Implementation session remains future work and is Critical under PR6 + R17. |
| D7 (local-first storage for intimate data) | Open non-decision | **Status unchanged at the D-register level. Current cloud-storage posture re-affirmed in writing in ADR-PE-01 §1.5 + §6.4 — explicit, not silent.** |

## What Was Changed

### File created (Standard, documentation only)

| File | Action |
|---|---|
| `/drafts/ADR-PE-01-pattern-analysis-storage.md` | **Created.** Full v1 ADR draft. ~13 sections matching ADR-Ring-2-01 format. No code references requiring code changes; references existing types and surfaces in `sage-mentor/pattern-engine.ts`, `website/src/lib/mentor-profile-store.ts`, and `website/src/lib/server-encryption.ts` for context only. |
| `/operations/handoffs/tech/2026-04-26-mentor-ledger-wiring-redirected-to-ADR-PE-01-close.md` | **Created** (this file). |

### Files NOT changed

- All distress classifier code (`r20a-classifier.ts`, `constraints.ts` SafetyGate) — untouched.
- All sage-mentor source files — unchanged.
- The encryption pipeline (`server-encryption.ts`) — unchanged. R17b boundary unchanged.
- `mentor-profile-store.ts` — unchanged.
- Pattern-engine code — unchanged.
- Database schema or rows — unchanged. **No DB changes. No SQL. No DDL. No env vars.**
- `mentor-ledger.ts` — unchanged. Read in full and reported on; no edits.

## Verification Method Used (0c Framework)

Per `/operations/verification-framework.md`:

- **Read-and-report:** `mentor-ledger.ts` read in full (1,306 lines). Function signatures and payload shapes named explicitly in the in-session report. Zero Supabase imports verified by `grep '@supabase|supabaseAdmin|createClient' sage-mentor/mentor-ledger.ts` — no matches. Zero callers in `/website/src` verified by `grep 'mentor-ledger|MentorLedger|aggregateLedgerExtractions|LedgerEntry' website/src` — no matches.
- **Schema audit:** `grep 'ledger|mentor_ledger' supabase/migrations api/migrations` — no matches across either migration directory. Confirmed: no `mentor_ledger` table exists; no migration references ledger fields.
- **Schema confirmation for ADR Option 3:** `mentor_profiles` schema read at `supabase/migrations/20260412_hub_isolation.sql` lines 38–61. Confirmed `UNIQUE(user_id)` — per-user, not per-(user, hub). Encrypted blob column confirmed via `mentor-profile-store.ts` lines 124–157: `encrypted_profile` (ciphertext) + `encryption_meta` JSONB sibling carrying iv/authTag/algorithm/version. Decrypt-and-parse yields `MentorProfileData | MentorProfile` per the canonical-shape adapter pattern from ADR-Ring-2-01.
- **Pattern-engine read contract:** confirmed via `pattern-engine.ts` lines 60–80. `analysePatterns(profile, interactions: InteractionRecord[])` consumes `mentor_interactions`-shaped records, NOT `MentorLedger`. The schema mismatch between `LedgerEntry.connected_passions: string[]` and `InteractionRecord.passions_detected: { passion, false_judgement }[]` was the prompt's hidden landmine; surfaced before any wiring.
- **No live-probe.** No code deployed. Nothing to probe.
- **Document verification (between sessions):** founder reads `/drafts/ADR-PE-01-pattern-analysis-storage.md` directly per the verification-framework "Business document" / "Manifest change" row. Verification is reading, comprehension, approval — not a Console snippet.

## Risk Classification Record (0d-ii)

- **Read-and-report (Steps 1–6) — Standard.** No file edits, no schema changes, no live data movement. Read tool only.
- **ADR-PE-01 v1 draft — Standard.** Documentation-only output. Located at `/drafts/`, not `/adopted/` or `/compliance/`. Adoption is itself a Standard-risk decision (founder approval, file move, decision-log entry).
- **The implementation work the ADR describes (future sessions) — Critical under PR6.** Each Session 1+ in the ADR's §8 single-endpoint-proof sequence is Critical because every read or write through the encryption pipeline now carries pattern-analysis data. Critical Change Protocol (0c-ii) requirements named in §5.2 of the ADR.
- **D-PE-2 (c) loader work (future) — Critical under R17.** Loader explicitly scopes by `(profile_id, hub_id)` using `supabaseAdmin`. Per-user isolation must be explicit in SQL, not RLS-dependent.
- **AC7 (Session 7b standing constraint) — confirmed not engaged.** No auth, cookie scope, session validation, or domain-redirect changes anywhere in this session. Confirmed at session open and at close.
- **PR6 — not engaged this session at the implementation level.** No code on the encryption pipeline. PR6 is the rule that *will* govern the implementation sessions; named in the ADR repeatedly so the discipline is encoded for those future sessions.

## PR5 — Knowledge-Gap Carry-Forward

No re-explanations this session. KG entries scanned and respected:

- **KG1 (Vercel rules) — respected and named in the ADR (§5.3).** No fire-and-forget. All future ledger / pattern-data writes must be awaited.
- **KG3 (hub-label end-to-end contract) — respected and named in the ADR (§6.3 R17f bullet 2 + §9 Risks).** Hub-key validation is a named implementation rule.
- **KG7 (JSONB shape) — partially relevant.** Inside the encrypted blob the column is ciphertext, not JSONB; KG7 doesn't apply at the column level. KG7-equivalent discipline still applies if `pattern_analyses` is later denormalised (Option 2 path) or if the optional `last_pattern_compute_at` column from O3 lands as JSONB rather than TIMESTAMPTZ.
- **KG2 (Haiku boundary) — not engaged this session.** No model selection.
- **KG4 (Layer 2 applicability vs wiring) — not engaged.** No context layer changes.
- **KG5 (Token budgets) — not engaged.** No cost analysis.
- **KG6 (Composition order) — not engaged.** No prompt composition changes.

**Cumulative re-explanation count this session:** zero.

**Observation candidates updated:**

1. **Brief-vs-reality misframing (PR8 candidate, 1st observation in this stream).** The session prompt described the engine-mentor-ledger as the missing write-side; the on-disk reality is that the ledger has no write-side and no callers. The 2026-04-25 pattern-engine close already named "the missing write-side that pattern-engine reads" as the deferred `mentor_interactions` loader (D-PE-2 (c)) — not the ledger. The brief conflated three separate things: the journal-extraction ledger, the per-session interaction writes, and the longitudinal passion-frequency map. Resolution sketch: a session brief should be cross-referenced against the most recent close in the same stream before being acted on, and any divergence surfaced before code begins. **Promotion threshold:** PR8 promotes on third recurrence. This is observation 1; the 2026-04-25 pattern-engine close logged a related observation about session-opening prompts misframing scope (count: 2 of 3). If a future session's opening prompt diverges from the relevant handoff again, that may be the third observation triggering promotion.
2. **Capability-inventory naming reliability candidate (1st observation).** "engine-mentor-ledger as not-ready with blocker: 'Isolated. Part of Sage Mentor. Not integrated.'" — accurate as a description of the *module*, but suggested a write-side existed. The capability inventory line could be more explicit that this is a type/logic module with no persistence layer of its own. Logged as a candidate; promotion-relevant only if recurring.

## Founder Verification (Between Sessions)

This session produced no code and no deploys. Verification is documentary:

### Step 1 — Read the ADR draft

[Open `/drafts/ADR-PE-01-pattern-analysis-storage.md`](computer:///Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/drafts/ADR-PE-01-pattern-analysis-storage.md) and read end-to-end. The §3 Decision and §5 Encryption pipeline impact sections carry the load. The §11 Authority section explains the approval workflow.

### Step 2 — Decide whether to approve, request edits, or reject

If approving as-is: at next session open, signal "approve ADR-PE-01" or equivalent. The next session moves the file from `/drafts/` to `/compliance/` per D6-A archive protocol and adds a decision-log entry (proposed entry ID below).

If requesting edits: name the sections and the changes you want. The session that applies the edits is Standard-risk (documentation only).

If rejecting: name the alternative direction. If the alternative is one of Options 0, 1, or 2 from the four-option comparison, the next session's ADR draft starts from that option's framing. If the alternative is "no storage decision yet — defer further," the deferral is logged per PR7 with a revisit condition.

### Step 3 — Independent verification (optional)

Confirm the ADR's factual claims by spot-checking three:

- The encrypted blob column structure: `mentor_profiles.encrypted_profile` (ciphertext) + `encryption_meta` JSONB. Verify by reading `website/src/lib/mentor-profile-store.ts` lines 124–157.
- `mentor_profiles` is per-user (`UNIQUE(user_id)`). Verify by reading `supabase/migrations/20260412_hub_isolation.sql` line 60.
- Pattern-engine reads `InteractionRecord[]`, not `MentorLedger`. Verify by reading `sage-mentor/pattern-engine.ts` lines 60–80 (type definition) and the `analysePatterns` signature around line 603.

## Next Session Should

1. **Open with the session-opening protocol.** Read this handoff. Scan KG (KG3 will be most relevant once the loader work begins). Confirm hold-point posture (still active).

2. **Founder decision on ADR-PE-01.** Approve / request edits / reject. If approved, the session's first action is the file move from `/drafts/` to `/compliance/` per D6-A archive protocol, plus the decision-log entry adoption.

3. **If ADR-PE-01 is approved — pick the implementation entry point.** Two candidate Session 1 framings:
   - **Option 1A — Pattern-data write on the proof endpoint first.** Add the read-modify-write surface to `/api/mentor/ring/proof` (already wired against fixtures) so the proof endpoint becomes the first surface to actually persist pattern data inside the encrypted blob. Critical under PR6. Rollback path is contained (proof endpoint, founder-only traffic).
   - **Option 1B — Loader build first, then the storage wiring on the proof endpoint.** Build the `mentor_interactions` loader (D-PE-2 (c)) first, prove it on the proof endpoint, *then* wire pattern-data persistence. Splits Critical risk across two sessions. Founder picks based on appetite.

4. **Open carry-forward items:**
   - **O-S5-A** — `/private-mentor` page chat thread persistence. Pre-existing UX gap. Carries forward unchanged.
   - **O-S5-B** — write-side verification of ADR-Ring-2-01 4b. Carries forward unchanged.
   - **O-S5-D** — static fallback canonical-rewrite revisit. Carries forward unchanged.
   - **New: O-PE-01-A through O-PE-01-E** — the five open items inside ADR-PE-01 (read amplification, blob-size monitoring, optional `last_pattern_compute_at` column, write cadence, backfill of existing profiles). These travel with the ADR; they activate when the implementation sessions begin.

## Blocked On

- **Founder decision on ADR-PE-01.** Approval / edits / rejection. The ADR cannot be promoted from `/drafts/` to `/compliance/` without that signal.

## Open Questions

- **Q1 — ADR adoption format.** Should ADR-PE-01 follow ADR-Ring-2-01's "Accepted with staged transition" pattern (single ADR, multiple implementation sessions referenced inline), or be split into multiple ADRs (one per implementation session)? ADR-Ring-2-01 used the staged-transition pattern successfully across five sessions, so the precedent favours that approach. Founder may prefer different.
- **Q2 — Should the optional `last_pattern_compute_at` plain column (O3) be added in Session 1 or deferred?** Adding it in Session 1 lets freshness queries skip decryption; deferring it keeps Session 1 minimal. Default: defer per O3.
- **Q3 — Does the loader (D-PE-2 (c)) belong inside `website/src/lib/` or as a sage-mentor bridge surface?** Architectural question for the loader's own ADR or session prompt. Out of scope of ADR-PE-01.

## Process-Rule Citations

- **PR1** — respected. ADR is documentation; no rollout. The implementation it describes follows PR1 with single-endpoint proofs.
- **PR2** — respected. Read-and-report verification immediate. ADR's claims are verifiable by founder reading the named files.
- **PR3** — respected. ADR §5.3 names PR3 as a constraint on the implementation.
- **PR4** — not engaged. No model selection.
- **PR5** — respected. Zero re-explanations. Two candidate observations logged (1st each).
- **PR6** — not engaged at the implementation level this session. Named throughout the ADR for the future implementation sessions where it is engaged.
- **PR7** — respected. The ADR's §12 lists five open items (O1–O5) with explicit revisit conditions. The session itself logs deferred sub-decisions (write cadence, first live consumer, backfill timing).
- **PR8** — engaged at observation level. Two candidates logged. No promotion this session.
- **PR9** — not engaged. No F-series stewardship findings this session.
- **AC4** — not engaged. No safety-critical functions modified.
- **AC5** — not engaged. R20a perimeter not touched.
- **AC7** — confirmed not engaged at session open and close.

## Decision Log Entries — Proposed

Three entries proposed for `/operations/decision-log.md` at next session open (founder approval pending):

- **D-ADR-PE-01-DRAFT** — ADR-PE-01 v1 draft produced. References the four-option comparison, founder selection of Option 3 + hub-scoped + D7 cloud-storage acceptance, and the Critical-risk classification of the implementation work. Status: Adopted-as-draft. Promotes to D-ADR-PE-01 (Adopted) when the founder approves and the file moves to `/compliance/`.
- **D-PE-2-B-RESOLVED** — D-PE-2 (b) (pattern-analysis storage location) deferral closed. Resolution: Option 3 (field inside encrypted blob, hub-keyed) per ADR-PE-01. Cross-references: D-PE-2 (Adopted 2026-04-25), ADR-PE-01 (drafted 2026-04-26).
- **D-PE-LEDGER-WIRING-REDIRECTED** — Session opening brief titled "wire engine-mentor-ledger" was redirected to D-PE-2 (b) work after read-and-report confirmed the brief's premise was incorrect (mentor-ledger.ts is a pure module with no write-side). Engine-mentor-ledger persistence is out of scope of ADR-PE-01 and would require a separate ADR if pursued. Recorded as a stewardship observation per PR9 candidate framing (long-term regression: capability-inventory descriptions could be more explicit about which items are types-only and which have persistence layers).

## Orchestration Reminder (Protocol element 21)

This session was governed end-to-end by `/adopted/session-opening-protocol.md`. All 21 elements applied:

- **Part A (1–8):** tier declared (1, 2, 3, 6, 8, 9), canonical sources read in sequence (manifest indirectly via session prompt; project instructions in system prompt; latest tech handoff `2026-04-26-shape-adapter-session-5-legacy-retirement-close.md` plus `2026-04-25-pattern-engine-proof-close.md`; KG register; tech state implicitly via the read-and-report of `mentor-ledger.ts`, `pattern-engine.ts`, `mentor-profile-store.ts`, `mentor-observation-logger.ts`, `20260412_hub_isolation.sql`; verification framework). KG scan completed (KG1, KG3, KG7 named). Hold-point status confirmed (P0 0h still active; this work sits inside the assessment set). Model selection not engaged. Status-vocabulary separation maintained (implementation status for code modules, decision status for the ADR draft). Signals + risk-classification readiness confirmed.

- **Part B (9–18):** Standard classification named pre-execution for read-and-report; Standard for the ADR draft. AI signal "I'd push back on this" used at Step 4 to surface the brief-premise error before any code. Founder exercised decision authority by selecting Option A hub-scoped, accepting D7, and requesting storage-location ADR before code. PR1 respected (no rollout — ADR is documentation). PR2 respected (verification immediate via the read-and-report itself). PR6 not engaged this session at the implementation level (named throughout the ADR for future sessions). PR7 respected (five open items in the ADR; deferred sub-decisions logged). Scope cap respected — the session ended at "ADR draft + handoff" rather than expanding into code.

- **Part C (19–21):** system stable (no in-flight code changes). Handoff produced in required-minimum format plus all five extensions (Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification, Decision Log Entries — Proposed). This orchestration reminder names the protocol explicitly. No element skipped.

Authority for the work itself is the 2026-04-26 founder direction ("Option A hub-scoped, I accept D7, storage-location before code") and the deferral framing established in the 2026-04-25 pattern-engine close (D-PE-2). The protocol governed *how* the session ran; the founder direction and the prior ADR pattern (ADR-Ring-2-01) governed *what* the session produced.

---

*End of session close.*
