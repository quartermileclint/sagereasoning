# Next-Session Prompt — Stoa ST2: the `stoa_entries` schema + entry model (dark)

**Stream:** founder.
**Tier:** `schema` + `code-standard` (a new table + a store module + data-rights wiring; nothing served, nothing activated — everything dark until ST5's `SUBSTRATE_STOA_ENABLED` walk).
**Governing frame:** /adopted/standing-protocol-cache.md; the Stoa build plan §2 (all thirty constraints) + §3 ST2 + §4 (verification mandates); **the binding verbatim records win over everything here** — `operations/connective-layer-2026-08/2026-08-02-mentor-consultation-connective-layer-verbatim.md` and `inbox/stoic network enquiry and mentor response.txt`.
**Predecessor session close:** `operations/handoffs/founder/2026-08-03-stoa-ST1-community-map-CLOSE.md` (ST1 is **LIVE** — walk discharged same day; see its updated production-state line).
**Predecessor decision-log entries:** `D-STOA-ST1-COMMUNITY-MAP-REPAIRED-DEGRADED-2026-08-03` (+ its walk addendum), `D-STOA-BUILD-PLAN-APPROVED-ST1-FIRST-2026-08-02`.
**Risk classification:** Standard-to-Elevated under 0d-ii (new table + new unwired module = Standard; the data-rights route extensions touch existing user-facing functionality = Elevated — the session runs Elevated as a whole). Critical Change Protocol NOT engaged (no auth/encryption/R20a/flag activation; the migration is founder-walked TEST→prod per PR17 and the table sits inert). **PR19 independent adversarial review REQUIRED** (founder direction: every Stoa build; parallel independent `Agent` calls are the accepted Workflow-equivalent when the opt-in is absent — disclose each time).

## Why this session matters

ST2 lays the Stoa's substrate: the one-entry-per-practitioner declaration model (constraint #11) that ST3 (human surface) and ST4 (agent surface) will serve. It encodes the binding rulings **structurally** — no engagement columns can exist (#23), standing declarations are never retention-swept or silently expired (#24), removal grounds are the exact three-member vocabulary (#16) — and wires data rights **at birth** (the milestones lesson: a table reachable only by cascade is a defect). Everything is dark: the table is inert until ST5's flag walk, so production stays byte-equivalent on push apart from the additive data-rights coverage.

## Grounded facts (as of 2026-08-03 — verify at open, do not re-derive)

- **ST1 is LIVE:** the de-graded 5-column `community_map_pins` view + repaired route are in production; the plan's ST1 line reads DONE.
- **The standing lesson from ST1's walk (memory `supabase-view-default-grants-auto-updatable`):** Supabase default privileges grant **ALL** on new public objects to anon/authenticated/service_role. For `stoa_entries` this means: enable RLS **in the same statement block** as creation, author explicit policies, and **REVOKE-first + grant exactly** — with a §VERIFY expectation of "EXACTLY these rows" (any extra privilege row = FAIL), never "grant present". RLS does not protect against `service_role` (bypasses by design) — decide deliberately which server paths use it.
- **Identity anchors:** humans key on `profiles.id` (= auth user id — NOT `user_id`, the two-time bug source); agents key on a K1-canonical `agent_id` (`namespace:name@version` — the accreditation boundary's `isAcceptedAgentId` vocabulary) + the owning credential ref. The UPC chokepoint is `website/src/lib/practice-credential.ts`.
- **Data-rights surfaces to extend:** `/api/user/access`, `/api/user/export`, `/api/user/delete` (human, by owner) + `/api/credential/erase` (agent, by credential). House pattern for wiring: missing-table-benign reads, fail-honest writes (see the trust-core store + collaboration-store precedents). The `milestones` table wiring (2026-07-30) is the freshest precedent of adding a table to all three human routes.
- **The flag:** `SUBSTRATE_STOA_ENABLED` — named by the plan, not yet created anywhere. ST2 may reference it in the store (house pattern: flag-off ⇒ no-op) but sets nothing; UNSET everywhere throughout.
- **Uncommitted tree note:** the working tree carries other sessions' strays (brand files, `a3-developmental-streak.py`, etc.) — stage ONLY this session's files, per every recent close.

## The binding design constraints ST2 must encode (from plan §2 — cite each in the migration/store comments)

| # | Constraint | Structural encoding in ST2 |
|---|---|---|
| 11 | One entry per practitioner | UNIQUE per identity (partial unique indexes: one on `owner_user_id` where active, one on `agent_id` where active — shape decided in-session) |
| 1 | Per-entry visibility; defaults community (human) / public (agent) | `visibility` CHECK (`community`\|`public`); defaults applied at the store layer per identity kind |
| 10 | Tags = domains of work/inquiry, never qualities | `tags text[]`; the evaluative deny-class battery lives at ST3's seed-vocabulary, but the column carries a comment citing #10 now |
| 12/24 | Declaration date displayed; honest ageing; never silent expiry | `declared_at`, `renewed_at`; **NO `retain_until`** — a deliberate, commented contrast with the 90-day practice records; never enters any retention sweep |
| 16 | Removal only on the three grounds | withdrawn/removed state + a removal-grounds enum CHECK (`dishonesty_examined`\|`injustice_facilitation`\|`spam_flooding` — exact names decided in-session, mirroring the ruling's three, nothing else) |
| 23 | No engagement data, external OR internal | **No view counts, no last-seen, no analytics column of any kind** — and the PR19 review verifies no such column exists |
| 13 | Identity floor: account XOR credential | CHECK enforcing exactly one of (`owner_user_id`, `agent_id`) present (XOR shape decided in-session) |
| 20 | Structural separation from trust/practice | The boundary battery starts HERE: the store imports no trust-core/kathekon/practice/suggestion/milestone module; nothing in those modules reads `stoa_entries` |

## Pre-conditions

1. `origin/main` at or past the ST1 commit ("Stoa ST1: repair the community map…"), pushed, Vercel green (founder-confirmed 2026-08-03).
2. The founder present for the migration walk (Supabase SQL editor; **bare SQL in `sql`-tagged blocks, never shell wrappers; shell commands one per block**).
3. Read at open: plan §2 + §3 ST2 + §4; the verbatim Q1/Q3d/Q5b/Q6c/Q8/Q9 answers (the constraints above); this prompt in full.

## Part A — Open under the protocol

1. `/adopted/standing-protocol-cache.md` (~3 min) — confirm tier, risk, signals, status vocabulary; state the session's model. KG1 + KG7 engage (DB writes; array/enum columns).
2. Predecessor close + the plan §2/§3-ST2/§4 + the named verbatim answers.
3. `/operations/decision-log.md` last 2 entries (the ST1 entry + walk addendum).
4. `git status` — know the tree; stage only this session's files.

## Part B — Procedure

### Step 1 — Design the table + settle the in-session shapes
Settle and record (brief design notes, not AskUserQuestion unless genuinely contested): the XOR CHECK shape; the partial-unique-index shape for #11 (active entries only — a withdrawn entry must not block re-declaring); the removal-grounds enum names; the RLS policy set (owner full CRUD on own row via user JWT for humans; agent rows written only via server routes — likely service-role writes gated by the UPC chokepoint at ST4, so RLS can be owner-or-service shaped; visibility-scoped reads deferred to the serving surfaces vs encoded in RLS — **recommend route-level visibility with RLS as the floor**, since `community` visibility must admit BOTH authenticated humans and credentialed agents (#2), and credentialed agents have no Supabase JWT — a pure-RLS read model cannot see them).

### Step 2 — Author the migration (idempotent, reversible)
`website/supabase-stoa-entries-migration.sql`, house §0-diagnostic/§1-apply/§VERIFY/rollback-footer form. Musts: RLS enabled at creation; **REVOKE-first grants with exact-row §VERIFY** (the ST1 lesson); every constraint-encoding column commented with its ruling number; NO `retain_until`, NO engagement columns; the rollback footer states withdrawal/erasure semantics (erasure = hard-delete; the table never enters a sweep).

### Step 3 — The store module + data-rights wiring
`website/src/lib/stoa/stoa-store.ts` (or house-consistent path): CRUD the ST3/ST4 surfaces will consume — create/read/update/withdraw per identity; visibility-filtered list (recency-ordered, #8 — **no other ORDER BY key exists in the query**); hard-delete for erasure. Zero imports from trust-core/kathekon/practice/suggestion/milestone modules (#20). Wire data rights same-session: the three human routes cover `stoa_entries` by `owner_user_id`; `/api/credential/erase` covers agent entries by credential ref. Missing-table-benign reads, fail-honest writes.

### Step 4 — The boundary battery (starts now, grows through ST3–ST5)
New `website/src/lib/stoa/__tests__/stoa-boundary.test.ts` (npx tsx, house plain-assertion form): store imports clean of the forbidden module list (one-hop + the forbidden-specifier grep); no trust/practice module references `stoa_entries` (repo grep); the schema/migration text contains no engagement column (deny-list: `view`, `seen`, `click`, `engagement`, `count` — tuned to avoid false hits); recency is the only sort key; **mutation-verify at least one load-bearing pin** (a pin that can't go red isn't a pin). Plus store unit tests against the in-memory fake-supabase pattern.

### Step 5 — Verify
`tsc --noEmit` 0; `npm run build` 0; the new battery green; the data-rights suites re-run green (consumer-erasure, erase-handler, and the human-route suites if present). **Founder-walked migration TEST → prod** (§0 → §1 → §VERIFY; exact-row grants). Production stays inert (no route serves the table until ST3/ST4; flag unset).

### Step 6 — PR19 independent adversarial review
Fresh parallel reviewers, artifacts only. Dimensions at minimum: **ruling-fidelity** (every §2-constraint encoding present + nothing forbidden present — especially #23 no-engagement and #24 no-expiry); **migration-correctness** (idempotency across found-states; RLS + revoke-first grants; XOR + unique-index semantics incl. the withdrawn-re-declare path); **data-rights completeness** (all four routes; cascade + orphan analysis; the erasure hard-delete claim true); **boundary/battery adequacy** (the #20 separation real, pins non-vacuous). Adjudicate + fold before close.

### Step 7 — Records (lean forms)
Decision-log entry (`D-STOA-ST2-ENTRY-MODEL-BUILT-DARK-...` dated as run) + lean close + plan ST2 line updated. PR18: production-state line — inert table applied (if walked) / byte-equivalent otherwise; rollback = `git revert` + `DROP TABLE public.stoa_entries;`.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Open + reads | 15–20 min |
| Step 1 design | 20–30 min |
| Step 2 migration | 30–45 min |
| Step 3 store + data rights | 45–75 min |
| Step 4 battery | 30–45 min |
| Step 5 verify + founder walk | 30–45 min |
| Step 6 PR19 + folds | 45–90 min |
| Records + close | 20–30 min |
| **Total** | **~4–6 hours** (splittable: Steps 1–4 build-only, walk deferred) |

## Rollback path

`git revert` the session commit (store + wiring + battery all unwired from any serving surface) + `DROP TABLE public.stoa_entries;` (the migration footer's rollback). The table is inert until ST5's flag; data-rights coverage of a dropped table is missing-table-benign by construction.

## Forecast

Success: the Stoa's entry model exists dark — constitutionally shaped by the rulings, erasable from birth, structurally separated from the practice instrument — and ST3 (the human surface; its declaration route's distress wiring is the arc's one `code-critical` element) can build directly on it. Carried threads the founder sequences separately: the map-into-Stoa fold election (ST7); ST1's named follow-ups (`update-location` error passthrough + centroid snap; the stale `component-registry.json` `prod-community-map` blocker text); the agent-circles R18 docs; the S11 items; 0h.

End of prompt.
