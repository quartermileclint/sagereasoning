# Next-Session Prompt — Two Named Documentation Follow-Ups: the Accreditation-Write Shape + the `loop_fold` R18 Contract

**Stream:** founder (substrate / public docs).
**Tier:** `governance` / documentation-only — no code, schema, or flag change in either item; nothing here activates anything new (both surfaces the docs describe are ALREADY live). Read `/adopted/standing-protocol-cache.md` at open. Not a build-sessions-protocol session (no substrate-build arc is being extended).
**Prior session:** the practice-reminders agent plan (A1 → A2 → A3) closed 2026-07-28 — `operations/handoffs/founder/2026-07-28-practice-reminders-AGENT-A3-docs-and-activation-CLOSE.md` + `D-PRACTICE-REMINDERS-AGENT-A3-DOCS-AND-ACTIVATION-LIVE`. **That plan is fully executed; this is not a continuation of it** — it picks up two named follow-ups the A3 close surfaced but deliberately did not fix (out of that session's stated scope).

---

## Two independent items. Confirm at open which to do, in which order (or both — they don't conflict).

### Item 1 — the accreditation-write `llms.txt` example is a trimmed illustration, not the real shape

**Found:** while constructing a live A3 activation smoke, `POST /api/accreditation/{agent_id}` 503'd twice against the exact JSON `llms.txt`'s "Accreditation — Verifiable Reasoning Profile" section shows as the write body. Root causes, traced against source (not docs):

1. `profile.window_config` is typed `WindowConfig` (`website/src/lib/substrate/trust-layer/types/evaluation.ts:369`), which requires six numeric fields (`window_size`, `grade_check_interval`, `minimum_actions_for_grade`, `typical_proximity_threshold`, `dimension_level_threshold`, `carried_candidates_max`) — the doc's placeholder `"window_config": { "...": "rolling-window config" }` gives no hint any of these exist, let alone their names or a sane default (`DEFAULT_WINDOW_CONFIG`, same file, line ~396).
2. `profile.accreditation_record` (`AccreditationRecord`, `website/src/lib/substrate/trust-layer/types/accreditation.ts:216`) requires roughly ten fields the doc's example never shows at all: `agent_id` (distinct from `profile.agent_id`), `evaluation_window_size`, `grade_since`, `last_evaluation`, `passions_persisting`, `verification_url`, `expires_at`, `disclaimer`, `created_at`, `updated_at` — confirmed load-bearing by reading `accreditationRecordToRow` (`website/src/lib/substrate/sage-assent-accreditation-store.ts:318`), which reads every one of them directly onto the DB row.
3. Separately (not a docs gap, a route validation the doc already states correctly): any write-class capability (`accreditation_write`/`calling`/`reflect`) on a UPC requires a resolvable `owner_email`+`agent_id` at MINT time (the 6e §A invariant) — already documented at mint-credential-core.ts's own usage text, just easy to miss when copying a docs example.

**Task:** rewrite the `llms.txt` "Accreditation — Verifiable Reasoning Profile" write-body example to be a genuinely complete, copy-paste-correct `CarriedProfile` — every required field present with a realistic placeholder value, `window_config` spelled out with `DEFAULT_WINDOW_CONFIG`'s actual values rather than an ellipsis. Cross-check every field against the two type definitions above and `accreditationRecordToRow`, not against memory of what a previous example showed. **Verify the fix, don't just trust the trace this time** — either construct one real write against production with a throwaway credential (mirroring A3's Step E pattern; mint → write → revoke), or at minimum have someone who did not write the fix independently re-derive the required-field list from the same two type files and diff it against the new example.

A working reference implementation already exists and is disposable/adaptable: `/private/tmp/claude-501/-Users-clintonaitkenhead-Claude-work-PROJECTS-sagereasoning/225b2aaa-1af0-48e1-9a85-a2b8654aa7c8/scratchpad/a3-developmental-streak.py`'s `write_accreditation()` function is a genuinely-succeeding write body (proven live 2026-07-28) — the founder was also sent a copy directly during that session; ask if they still have it. **Caveat:** that script's `AccreditationRecord` fields were chosen to make a live smoke succeed, not to be the doc's canonical illustrative values — review them for narrative sense (e.g. `senecan_grade: "grade_2"` was an arbitrary smoke choice) before publishing.

**Also worth a quick check while in this section:** whether the API-docs page (`website/src/app/api-docs/page.tsx`) has a parallel accreditation-write example with the same gap — it may not (A3's grounding only checked `llms.txt` and `/api/reason`/reflect sections of api-docs, not accreditation), confirm rather than assume.

### Item 2 — the `loop_fold` (AE-2) R18 docs, deferred across at least four prior sessions

**Status, read first-hand — do not trust this summary alone, CLAUDE.md's own AE-2 entry is long and worth reading in full:** `SUBSTRATE_LOOP_FOLD_ENABLED=true` has been live in Vercel Production since 2026-07-19 (`D-AGENT-EXTENSION-AE2-ACTIVATION-LIVE-2026-07-19`). Every `POST /api/accreditation/{agent_id}` success already carries the additive `loop_fold` block (schema `agent-loop-fold-v2` as of the same-day self-circle-narrowing fold) on the WIRE, right now — but **it has never been documented on any of the three R18 public surfaces** (`llms.txt`, `agent-card.json`, `api-docs/page.tsx`). This is the live-but-undocumented state R18 exists to close, and it has been named as "its own step" / "a natural neighbour" in at least the A1, A2, and A3 build-plan status blocks without ever being picked up.

**Task:**
1. Read `website/src/lib/substrate/trust-core/loop-fold.ts`'s full header comment first-hand (it is extensive and precise — the source of truth for what the block actually promises) plus the two governing decision-log entries (`D-AGENT-EXTENSION-AE2-ACTIVATION-LIVE-2026-07-19`, `D-KATHEKON-DIKAIOSYNE-SELF-CIRCLE-NARROWING-BUILT-REVIEW-FOLDED-2026-07-19`) and CLAUDE.md's AE-2 bullet in "Live in production."
2. Draft the R18 contract for `loop_fold` — what it computes (the three-way kathekon-engaged / self-regarding-prudential / instrument-calibration split, the S3-combiner-through EVIDENCE_FLOOR logic, the honesty bounds: `occurred_at_basis: "submission_order"`, the refused temporal/regime attribution, `identity_context`, the PA-10 replay bound, the NARROWED_ARM_BOUNDS clauses); what it explicitly does NOT do (MEASURE-only, not an S4 input, never a trust-event source, the write outcome is unreachable even on a fold error). Follow the AE-1 (`trajectory-delta`) precedent for register and completeness — that R18 entry is a good model for how much a fold-shaped MEASURE surface needs to say.
3. **Get founder sign-off on the drafted wording BEFORE touching any public file** — the same discipline A3 held to (and it caught a real defect there). This is genuinely load-bearing here too: `loop_fold`'s schema is `v2` as of the same day it activated, so a careless docs pass could easily describe the superseded `v1` shape from the activation decision-log entry rather than the corrected `v2` split — cross-check every field name and split description against the CURRENT `loop-fold.ts` source, not the chronologically-first decision-log entry.
4. Apply to `llms.txt`, `agent-card.json` (this will be extension #20), `api-docs/page.tsx`.
5. `npm run build` (not just `tsc` — the route-export gate).
6. If practical, verify one live accreditation write's actual `loop_fold` response against the new docs, field-by-field (the same discipline that caught A3's `endpoint_hint` defect) — a throwaway `sr_prac_` credential and one consult+write cycle is enough; teardown after.

---

## Boundaries

- **Neither item touches a flag, schema, or route.** Both surfaces are already live; this is pure documentation truing-up. No AC7/PR6/PR17 engagement expected unless a live verification write is performed, in which case treat that narrow slice (mint → write → revoke) as its own small Critical sub-step within an otherwise `governance`-tier session, per the A3 precedent.
- **Do not fold in the `emitAccreditationTrustEvents` correlationId-ordering fix** (spawned as its own task during the A2 session, `task_10f63598` — check whether it has already run or been picked up separately before assuming it's still open) — unrelated scope, its own risk classification, live-production S1 code.
- **Do not touch `stoic-brain.ts`** (the standing freeze) or reopen the logos byte-identity guard question — that stays the founder's own call, not implicitly resolved by a docs session.
- **R18 discipline:** verbatim source (the code's own header comments and the governing decision-log entries) wins over any summary, including this prompt and including CLAUDE.md's own compressed bullet — both items exist specifically because a prior summary (a trimmed doc example; a deferred-and-forgotten neighbour note) drifted from the underlying reality.

## Forecast

Success = `llms.txt`'s accreditation-write example genuinely succeeds when pasted verbatim into a real request (proven, not assumed), and the `loop_fold` block — live on every accreditation write for over a week now — is finally documented accurately enough that a third-party integrator reading `llms.txt` could predict the exact shape of what they already receive on the wire.

End of prompt.
