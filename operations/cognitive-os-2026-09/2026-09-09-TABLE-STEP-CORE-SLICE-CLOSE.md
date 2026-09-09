# Cognitive OS — the TABLE STEP (core slice): authored, reviewed, APPLIED, DEPLOYED, LIVE-VERIFIED

**Session date: 2026-09-09 AEST**, dated from `date` (the prompt is filed as `2026-09-10`; that
filename is the known context-date artifact and is left as-is because it is cited by name).

**Tier: `code-critical`, founder-walked. AC7 ENGAGES.**

**UPDATE (same day, post-close): AC7 IS NOW DISCHARGED.** The founder walked the full migration —
`§PRE` / `§APPLY` / `§VERIFY` V1–V8 — on TEST, then the four TEST-only V9 behavioural probes
(each correctly FAILED with its named error code), then teardown with the count query confirming
the cascade, then the identical `§PRE` / `§APPLY` / `§VERIFY` V1–V8 sequence on **production**. Every
output was read. The AI performed no Supabase operation at any point; it prepared the exact SQL
blocks (extracted from the file and SHA-checksummed rather than retyped, to avoid this project's
own recorded SQL-editor corruption hazard) and confirmed each result against the file's own
expectations.

**Two `§VERIFY` steps were corrected MID-WALK, in the migration file itself, because my own written
expectation was wrong — not the database:**
- **V3** originally said "expect ONLY service_role rows." That is false: `postgres` (the table
  owner) always appears in `role_table_grants` and cannot meaningfully be revoked, and it is not an
  exposure path (PostgREST never connects as the owner). Corrected to the NEGATIVE form the three
  prior lockdown migrations already use — filter to `anon`/`authenticated`/`PUBLIC`, expect zero
  rows.
- **V8** said "expect the six allowed string values" — referring to the *values inside the
  `confidence` CHECK*, not a row count, and was read as a row count. The correct row count is
  **seven** (four inline column CHECKs + three named table CHECKs on `cognitive_claims`; `NOT NULL`
  is a different `contype` and does not appear).

Both corrections are recorded in the migration file itself with the reasoning attached, and a third
warning was added at the V9 teardown step: on a `DELETE`, "Success. No rows returned" is NOT
evidence of anything (unlike on a `SELECT`, where it is the correct pass for V3) — this project has
been misled by that exact phrase before, and the count query that follows the teardown is the only
thing that actually confirms it.

**PRODUCTION SCHEMA STATE, as of this update: LIVE.** All four tables exist, RLS enabled with zero
policies, REVOKE/GRANT confirmed, both FK cascades confirmed, the append-only trigger confirmed
present, zero score columns confirmed, the seven `cognitive_claims` CHECK constraints confirmed.
**Empty and currently completely inert** — see the state note directly below.

**UPDATE (same day): CODE COMMITTED, PUSHED, DEPLOYED, AND LIVE-VERIFIED.** Commit `40259fc`,
path-scoped to exactly this session's 16 files (two peer files — `environmental-context.json`, the
S10 working notes — were confirmed left unstaged both before and after). The pre-commit gate ran its
own independent checks on push and all passed: measurement-integrity battery 250/0, `tsc`, ESLint,
ByteString headers, route-export, view-grants. Pushed via GitHub Desktop by the founder; Vercel
confirmed green by the founder.

**Three post-deploy checks, all founder-run, all pass:**
1. `ƒ /api/cron/cognitive-os-retention-sweep` present in the Vercel function list.
2. **The R17 code path is live and correct**, confirmed via an authenticated
   `GET /api/user/access` from the browser console (the user's own session JWT pulled from
   `localStorage`, an in-scope self-service call). Response: `STATUS: 200`,
   `personal_data.cognitive_os = {"contexts":[],"events":[],"claims":[],"belief_states":[]}` — all
   four arrays present, empty (correct — no data exists yet), no `error` key.
   **A genuine probing mistake was made and corrected in the same exchange:** the first probe read
   `d.cognitive_os` at the response's top level and got `undefined`; `gatherUserPersonalData()`'s
   output is actually nested under `personal_data` in `/api/user/access`'s response shape (verified
   by reading the route source, not guessed at) — the second, corrected probe passed. Also cost one
   call of the 5/hour `RATE_LIMITS.dataRights` budget on the wrong probe; four remained.
3. `curl -s -o /dev/null -w "%{http_code}" https://www.sagereasoning.com/api/cron/cognitive-os-retention-sweep`
   → `401`, confirming the cron route deployed and its auth gate holds with no `CRON_SECRET` supplied.

**Production state as of this update: schema live + code live + R17 wiring confirmed correct against
the deployed build, not merely against the local one.** `SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED`
remains deliberately unset (its own future activation decision).

---

## 1. What this session was for

Phase 1 of the Cognitive OS is built and mentor-approved, but its state lives **in memory only**.
The table step gives it a home. It is carried item 1 of the Phase-1 close.

**Phase 2 remains NOT LICENSED.** Nothing here opens it.

---

## 2. The two findings that shaped the step

Both came from doing what Q-R6 directs — putting the data-rights obligation on the **opening**
surface — and specifically from designing the R17 wiring *before* the schema.

### 2.1 The Phase-1 library carries NO ownership field. None.

`Claim.provenance.created_by` and `CognitiveEvent.caused_by` are free-form service strings
(`'analysis-service'`, `'evidence-intake'`, `'tms'`). There is no `owner_user_id`, no
`credential_ref`, no tenant anywhere in the nine components. R17's four routes all key on one or
the other.

So the table step must **introduce** the axis, and that is a schema-shaping decision the library's
own types do not express. Had the schema been written first, the wiring would have been bent to fit
whatever ownership the schema happened to imply. This is exactly the failure Q-R6 exists to prevent,
and it is the reason the ruling says "opening surface, not discovered after the migration is
written."

### 2.2 Q9 collides with R17 export — concretely, not theoretically

Q9 requires the internal-only scalars to be **machine-enforced** internal: *"not
internal-by-convention while being accessible via an API route a consumer could call."*
`/api/user/export` **is** such a route, and this project's standing export pattern is
`select('*')` — whole raw rows.

The sharpest instance: `HandoffEnvelope.epistemic_debt` is the exact field `toExternalView` deletes
at egress. Persisting it and exporting `*` would hand back through R17 precisely what the library
strips structurally at the boundary.

**Resolved by construction, from the rulings themselves.** Q-R7's own preference — persist the
structured components, re-derive the summary — means **no Cognitive OS scalar is persisted at all**.
There is nothing at rest for an export to leak, so the boundary cannot silently stop being enforced
by someone forgetting a projection. Q7, Q9 and Q-R7 are satisfied by the same decision.

---

## 3. The three founder elections (2026-09-09)

| Question | Election |
|---|---|
| The ownership axis | **Single scoping root.** `cognitive_contexts` carries the identity; every other table FKs to it `ON DELETE CASCADE`. Makes R17 structural — a future table cannot exist without an ownership path. |
| Migration scope | **Core slice first.** contexts + events + claims + belief_states. Decisions, handoffs and the dependency graph follow in a second walked migration. |
| The debt score | **Persist components only.** No score column anywhere. |

---

## 4. What was built

**Authored, not applied:** `website/supabase-cognitive-os-core-migration.sql` — four tables in the
project's `§PRE` / `§APPLY` / `§VERIFY` / `§INVERSE` form; additive, idempotent, reversible.

**Rulings encoded STRUCTURALLY, not documented:**

| Ruling | How the schema enforces it |
|---|---|
| **Q1 / Q11** — the loop proposes, never executes | `CHECK (event_type <> 'EXECUTE' OR external_executor IS NOT NULL)`. An EXECUTE row is unstorable unless it names the external party that acted. |
| **C3 / Q7** — ordinal, never cardinal | `confidence` is `TEXT` with a six-value CHECK. A `[0,1]` value **cannot be stored**. |
| **C6 / Q8** — unmeasured must not read as measured | No `identity_relevance`, no `interpretive_context` column. Absent, not null-filled. |
| **Q9 / Q-R7** | No score column anywhere; the five debt components persisted instead. |
| **Q-R6** — R17 | Identity CHECK: every row is reachable by at least one R17 path. |
| **2026-08-16 RLS lessons** | RLS enabled with **zero policies**, plus explicit `REVOKE ALL` from PUBLIC/anon/authenticated and `GRANT ALL TO service_role`. No policy exists to be mis-written as `USING (true)`. |
| **The append-only history** | `BEFORE UPDATE` trigger raises; `DELETE` deliberately still permitted, because erasure and the sweep need it. The trigger function is plain, **not** `SECURITY DEFINER`. |

**Code:** `src/lib/cognitive-os-store/{store.ts,sweep-flag.ts}`;
`src/app/api/cron/cognitive-os-retention-sweep/{route.ts,handler.ts}`; R17 wiring on all four
surfaces; a seventh `vercel.json` cron.

**Two deliberate improvements on the sibling stores, both disclosed rather than silent:**
- Deletion counts come from **exact head counts before and after**, never from a
  `DELETE ... RETURNING` representation — which PostgREST caps at 1,000 rows, so a large erasure
  would under-report while reporting success. A non-zero remainder is returned as an **error**.
- The admin client is resolved **inside** each function's `try`, never as a default parameter. A
  default parameter evaluates before the body runs, so its throw escapes the body's own catch — the
  KG1 fail-honest defect a prior review found on the trust-core sweep.

---

## 5. The guard caught a real architectural violation I introduced

`store.ts` and `sweep-flag.ts` were first written **inside** `src/lib/cognitive-os/`. The Phase-1
battery went **149/0 → 146/3**.

The three failures were the library's own purity guards: `§9.PURE` (no `process.env`), `§9.PURE`
(no wall clock or randomness) and **`§12.C9`** (every import must be a relative sibling).

`§12.C9` is not a style rule. It was **hardened after a PR19 MEDIUM** found the original C9
"no executor" check defeated by import aliasing, and it is what structurally guarantees the library
cannot reach a network client. A persistence layer breaks all three by nature.

**The fix was to move the layer out, to `src/lib/cognitive-os-store/`, leaving the guard
byte-untouched.** Relaxing the guard to admit a Supabase import was available and was rejected: it
would have weakened the exact constraint the Q11 ruling turns on, to make room for my own
misplacement. The pure library is byte-unchanged and does not appear in `git status` at all.

---

## 6. PR19 independent review — three dimensions, `sonnet`

Run under the founder's standing permission to drop the review tier for adversarial passes.
Dimensions: claims-vs-source; ruling fidelity and scope discipline; data-rights, DB safety and
fail-posture.

**CAP TRANSPARENCY (standing requirement, ruled 2026-09-09 Q3).** Cap: **10 findings per
dimension**. **The cap did NOT bind on any dimension** — reviewers returned 2, 2 and 4 findings and
each stated explicitly that nothing was dropped to fit.

**8 findings; 8 folded; 0 refuted.** Every one verified first-hand at source before folding.

| # | Sev | Finding | Fold |
|---|---|---|---|
| 1 | **HIGH** | `§1.5` was a **vacuous pin**. It searched a character window from *any* occurrence of a table's name — and all four names co-occur in the `§PRE` block — so all four assertions matched the same span. Mutation-proven: deleting `cognitive_events.retain_until` outright left it green. | Anchored inside each table's own `CREATE TABLE` body. |
| 2 | **HIGH** | The migration header's SECURITY DEFINER evidence **did not reproduce**: it quoted a narrower `grep` than the sweep actually used. Found independently by two reviewers. | See 6.1 below. |
| 3 | **HIGH** | `/api/user/access` returned `ok` with a **silently incomplete** Art 15 copy when credential resolution failed — and the comment claimed the opposite of what the code did. | Error is now carried and reported; "resolution failed" and "no credentials" no longer render alike. |
| 4 | LOW | A real `tsc --noEmit` TS6133 I introduced after my earlier clean check. | Fixed; `tsc` re-verified at **0**. |
| 5 | LOW/MED | The sweep reported a **pre-delete** count, breaking the file's own "verified by query" discipline. | Re-counts after deleting; reports what was actually removed; says so if expired rows survive. |
| 6 | NIT | The delete route diverges from its siblings on a resolution error. | **Kept and explained**, not aligned — see 6.2. |
| 7 | NIT | `debt_contradictions` CHECK validates top-level shape only. | Limit disclosed in the constraint's own comment. |
| 8 | — | Reviewers confirmed clean: RLS/grants, SECURITY DEFINER, fail-posture, row caps, migration correctness against the library's actual outputs, non-ASCII in literals, cron wiring, scope discipline, all thirteen rulings. | — |

### 6.1 Finding 2 is a RECURRENCE, not a slip

`website/supabase-practice-family-rls-lockdown-migration.sql` already carries a header reading
*"CORRECTED post-PR19: the grep returns FOUR function definitions, not one, as an earlier draft of
this header wrongly stated."* The identical class, on the identical check. **Twice is a class.**

The prompt's own mandate quotes the superseded narrower command, and I copied it forward.

So the fold is not a better sentence. Per **PR25** — *a verification claim in a code comment carries
its check* — the battery now **re-runs the sweep** (`§1.13d–f`): it walks every `.sql` in the repo,
asserts the sweep can find the SECURITY DEFINER files that do exist, and asserts that **none of them
names a `cognitive_` table**. A fabricated or stale count cannot survive it. The header records the
command that actually reproduces, and the true figures: **18 hits across 12 files** (excluding the
migration itself, which discusses the phrase), **zero** touching a `cognitive_` table.

### 6.2 Finding 6 was kept deliberately, and the asymmetry is worth stating

On a **resolution error**, the Stoa and reflect blocks skip their credential arm; the cognitive-os
block proceeds. The reviewer called this an unexplained inconsistency. It is now explained rather
than aligned, because the siblings' shape is the worse one *for erasure*: deleting what can be
reached beats deleting nothing, the error is still surfaced, and the response is honestly
`partial_deletion`.

**And it is the opposite of the right answer on the access path**, which is finding 3.
**Erasure fails safe by doing more; disclosure fails safe by doing less.** Both are now stated where
the choice is made.

---

## 7. Verification — run, not quoted

| Gate | Result |
|---|---|
| Cognitive OS battery (Phase 1, untouched) | **149 passed, 0 failed** |
| Critical scenario | **30 passed, 0 failed** |
| Table-step battery (new) | **137 passed, 0 failed** |
| `/api/credential/erase` handler | **41 passed, 0 failed** |
| `consumer-erasure` | **26 passed, 0 failed** — see below |
| Byte-identity guard | **250 passed, 0 failed** — armed and green |
| `tsc --noEmit` | **0 diagnostics** |
| `npm run build` | **exit 0**, `✓ Compiled successfully`, `ƒ /api/cron/cognitive-os-retention-sweep` registered |
| `layer2-mechanisms.ts` SHA pin | `60cefedb5f4f…` unchanged |
| `stoic-brain.ts` SHA pin | `fa8895ec949b…` unchanged |
| `GUARD_RE` vs every changed path | **12 paths, 0 matches** |

**A ninth finding, found by my own verification AFTER the reviewers had reported.**
`consumer-erasure.test.ts` failed on its happy path once the cognitive-os arm joined the chain. The
cause was a **test-double gap, not a defect in the code under test**: that suite's fake client
predates `pagedRows` and implements no `.gt/.gte/.order/.limit`, so the call threw, the store caught
it, and the whole erasure honestly reported `ok:false`. **The double was extended to model the real
client rather than the cognitive tables special-cased** — a double that does not model the client is
the class that let a hardcoded wrong primary key pass unseen in the C-1 sweep. The suite now also
pins that the erasure arm genuinely reaches `cognitive_contexts` by `credential_ref`.

Worth recording plainly: this appeared **after** the close and decision-log had been drafted, and the
available move was to call it pre-existing. It was not — this session's change caused it.

**MUTATION VERIFICATION — 12 mutations, 12 RED, 0 vacuous.** Every mutation was proved to have
landed (SHA-compared, per the recorded false-negative lesson that a passing mutation test may mean
the mutation never applied), and every file SHA-verified restored afterwards. Eight targeted the
build's load-bearing pins; four restored the exact defects the reviewers found. **Green was not
treated as evidence** — this arc has shipped vacuous pins twice, and finding 1 above is the third.

---

## 8. ⛔ THE FOUNDER WALK — NOT YET RUN

**Nothing below has been done. The AI performs none of it.**

**Standing correction, binding here:** *never place executable DDL in a runnable code block during a
live SQL-editor walk* (the founder has hit `42710` this way once). **This close deliberately
contains no runnable SQL.** Every statement lives in the migration file's own sections; run them
from there.

1. **`§PRE` on TEST.** Read all four outputs. **P1 must return ZERO rows** — if any table already
   exists, STOP: a partial prior application is a different situation and must be diagnosed.
2. **`§APPLY` on TEST.**
3. **`§VERIFY` V1–V8 on TEST.** Read every output. V2 has two halves that both matter: RLS enabled
   **and** policy_count = 0. V7 must return zero rows.
4. **`§VERIFY` V9a–V9d on TEST only** — four behavioural probes, each of which must FAIL with the
   error code named. Then the teardown, and confirm the cascade actually cleared the children rather
   than assuming it.
5. **Only when TEST is green: `§PRE` → `§APPLY` → `§VERIFY` V1–V8 on production.** V9 is destructive
   and is TEST-only.
6. **The sweep flag stays UNSET for now.** `SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED` is its own
   activation decision. Until it is set the cron answers honestly and does no DB work — but note
   that **nothing enforces retention until it is set**, and for a credential-keyed context with no
   owner the sweep and `/api/credential/erase` are the only exits.
7. **Push is yours.** The commit must be path-scoped: two peer files are in the tree
   (`environmental-context.json`, the S10 working notes) and **were not staged by this session**.

**Rollback:** `§INVERSE` (children before parent). Safe while the tables are empty and inert; after
real data exists it destroys that data, which is a deliberate act needing its own decision.

---

## 9. Practice discipline

**Window re-derived at open and at close, first-hand, never quoted.**

| | Open | Close |
|---|---|---|
| Buffer | 373 | **390** |
| Window population | 233 | **250** (209 guard + 41 consult) |
| Consult-bearing days | 4 | **4 of 5 required** |

**A correction to the prompt's own figures.** The prompt reported "4 of 4" and flagged a
discrepancy against a prior "3 of 5". The gate is **five days with consult records**, so the honest
statement is **4 of 5**. The apparent discrepancy is currently **moot**: every elapsed UTC day since
the window opened is present *and* consult-bearing, so "elapsed days" and "days present" both give
4. The readings only diverge once an empty day appears — the threshold question the prompt routes
forward is therefore still open, but nothing today turns on it. The Phase-1 close's "3 of 5" was
correct at its writing: 09-09 had no consult record yet.

**TOOL-MODE DISCLOSURE (standing obligation).** Mixed, chosen on the task's merits:
- **Write/Edit** for authoring new source (a ~500-line SQL file with `$$` quoting and array
  literals; TypeScript with template literals). Heredoc escaping is a recorded hazard here — the S7
  shell-escaping false negative and the `git commit -m` nested-quote bug both came from it.
- **Bash** for inspection, test running, and multi-anchor mechanical edits via anchored Python
  scripts that assert their anchor count before writing.

**The effect, disclosed because it is measured:** this session added **14 consult records**
(2026-09-09 went 1 → 15) and 3 guard records. A fully Bash-authored session would have added
approximately zero. **It did not move the gated counter** — 09-09 already qualified before this
session opened — so the contribution deepened one day's composition without advancing the day count.
The choice was made on merit; the effect is reported, not sought.

**Guard behaviour observed, read from the current frame each time** (per the Q2 ruling — the named
failure is classifying today's signal through a prior session's lens): the `cat >` heredocs drew
`CAUTION` with *"no kathekon factors were extracted"* — the measured false-positive class, since the
composer sees a Python script and not its grounds. **Two** at-action examinations returned
**UNAVAILABLE**, for two different reasons — one *"no assessment in response"*, one *"timeout after
55000ms"*. Both are outages, not denies; each action proceeded deliberately with the frame absent
and recorded. (The first is consistent with the known class where the A11b injection defence rejects
a session's own schema tokens; not chased, named.)

---

## 10. Carried forward

1. **The founder walk (§8) — the whole of it.** Nothing applied.
2. **`SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED`** — its own activation decision, after the migration.
3. **The second migration** — decisions, handoffs, dependency nodes/edges. When handoffs are
   persisted, the Q9-vs-export question returns in its sharpest form (`epistemic_debt` is the field
   `toExternalView` strips), and the `§7` pin will fail the moment a score column appears. **That
   failure is the system working** — the fix is an explicit export projection, never relaxing the pin.
4. **The library placement is still not architecturally settled** (Q4). `cognitive-os-store/` is now
   a second directory whose placement was also constraint-driven — by the purity guard rather than
   the byte-identity guard. Both belong in the post-window review.
5. Unchanged and untouched by this session: `Q-PREFLIP-REPORTS` (three owed disclosures); the
   session-opener `cat >` addition; the cap-transparency fold into the project-instructions
   snapshot; the manifest amendment owed before Phase 3.

**Phase 2 remains NOT LICENSED. The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call
remains the founder's.**
