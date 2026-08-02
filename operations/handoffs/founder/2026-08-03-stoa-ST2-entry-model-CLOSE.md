# Session Close — 2026-08-03 — Stoa ST2: the `stoa_entries` schema + entry model (dark)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md; the Stoa build plan §2 (all thirty constraints) + §3 ST2 + §4; the binding verbatim record (Q1/Q3a/Q3d/Q3e/Q5b/Q6c/Q8/Q9).
**Tier:** `schema` + `code-standard` — Elevated risk as a whole (data-rights route extensions). **Date:** 2026-08-03. **Model:** Fable 5 (`claude-fable-5`).
**Honesty note:** every Gate-1/Gate-2 hook attempt 401'd (the known transient server-side fail-secure class) and guard probes 429'd — the whole session ran unframed/unguarded, honestly logged; proceeded deliberately per the standing opener. The close-time reflect invitation fired mid-session and was engaged genuinely.

## What happened

The Stoa's substrate exists, dark: the one-entry-per-practitioner declaration model with every ST2-relevant ruling encoded **structurally** (constraint-numbered in migration + store comments), data rights wired **at birth** on all four surfaces, and a boundary battery whose pins demonstrably go red. **PR19 ran as four parallel independent Agent reviewers** (disclosed Workflow-equivalent): **1 HIGH** (agent entries — owner-NULL by the identity XOR — would have survived account deletion forever on a table with no sweep and no FK backstop, while the compliance log claimed them cleared; folded with a credential-resolution agent arm in `/api/user/delete` + battery pin E.9) and **4 MEDIUM** (the empty/whitespace dishonesty-artifact CHECK; the un-hardened missing-table classifier — a false-"erased" class on the one table whose only exits are the data-rights paths; two live-proven battery vacuities — §A blind to `export … from`, and a `popularity` engagement column sailing past the deny-lists), **all folded** plus the LOW/NIT set (details in the decision-log entry). Two reviewer catches deserve note: the whitespace-artifact fix as *proposed* had a NULL-semantics flaw (corrected at fold — CHECK passes on NULL, so `btrim` alone doesn't subsume `IS NOT NULL`), and four pins that passed green at build were live-proven vacuous and now live-proven biting (7 mutations total this session).

## Decisions Made
- `D-STOA-ST2-ENTRY-MODEL-BUILT-DARK-2026-08-03` appended (full PR19 disposition there).

## Status Changes
| Item | Old | New |
|---|---|---|
| ST2 (entry model) | Scoped | **Verified (build-level; boundary 35/0 · store 65/0 · 7 live mutations · tsc 0 · build ✓ · regressions 25/0 + 40/0 · PR19 folded) — founder migration walk pending** |
| Data-rights coverage of `stoa_entries` | none | Wired at birth (4 surfaces, incl. the agent arm) |
| `SUBSTRATE_STOA_ENABLED` | — | Referenced only (`isStoaEnabled()`); UNSET everywhere — nothing gates on it yet |

## The founder walk (run in this order — PR17, live)

**1. Commit + push FIRST** (the standing lesson — code before any DB step; the wiring is missing-table-benign, so deploy order vs. migration is safe either way, but the confirmed-hash discipline stands):
```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add website/supabase-stoa-entries-migration.sql website/src/lib/stoa website/src/app/api/user/delete/route.ts website/src/app/api/user/export/route.ts website/src/lib/user-data-gathering.ts website/src/lib/consumer-erasure.ts website/src/app/api/credential/erase/handler.ts website/src/app/api/credential/erase/__tests__/handler.test.ts operations/decision-log.md operations/handoffs/founder/2026-08-03-stoa-ST2-entry-model-CLOSE.md operations/connective-layer-2026-08/2026-08-02-stoa-build-plan.md
```
```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git commit -m "Stoa ST2: the stoa_entries entry model dark - schema + store + data rights at birth; PR19 folds incl. the agent-erasure HIGH"
```
Then push via GitHub Desktop; wait for Vercel green and confirm the deployed hash.

**2. TEST project, SQL editor:** run **§0 alone** (read-only). Expected on first run: `stoa_entries_exists = 0`, `profiles_exists = 1`, columns NULL. If the table already exists with columns differing from V1's list — **STOP** (the §0 note explains).

**3. Apply §1–§3 AS ONE PASTE** (the header says why — running §1 alone would leave the table on default grants with RLS off, the exact ST1 window).

**4. §VERIFY V1–V6** on TEST. Expected: V1 the exact sixteen columns; V2 the ten named CHECKs + fkey + pkey; V3 five indexes; V4 `true`; V5 **grantee ∈ {service_role, postgres} only — any anon/authenticated/PUBLIC row is a FAIL**; V6 `c`. Optionally V7's three probes (each must ERROR on the named constraint — the errors are the pass).

**5. PRODUCTION:** repeat steps 2–4 exactly.

**6. Report back** the §0 found-states + §VERIFY results for both projects — a one-line reply closes ST2 to "applied-inert" in the next entry. The table then sits empty and inert (nothing reads or writes it until ST3/ST4 build and ST5 flips the flag).

## Blocked On
**Production state at session close (PR18):** production is **byte-equivalent** until the founder's push; on push the only live-behaviour deltas are the additive data-rights coverage of a not-yet-existing table (missing-table-benign — verified: the four surfaces return honest empties/zeros pre-migration) and the additive `stoa_agent_entries`/`stoa_rows_deleted` fields on the export/access/erase responses. No flag is set; `SUBSTRATE_STOA_ENABLED` remains UNSET everywhere; the migration is unapplied until the walk. Rollback: `git revert` the session commit and/or `DROP TABLE public.stoa_entries;` per the migration footer.

**Files remaining uncommitted (this session's — stage ONLY these; the tree carries other sessions' strays, untouched):** the twelve paths in walk step 1.

## Open Questions / Named follow-ups (carried to ST3)
- Declare-route rate-limit/friction — the withdraw→re-declare recency bump is faithful (a re-declaration is a new declaration) but cycleable; adjudicated keep-with-note.
- The #10 tag-vocabulary deny-class battery (assigned to ST3's seed vocabulary by the plan).
- The renewal-never-reorders reading (my interpretation of Q3a "recency of declaration") — flag to the mentor at ST3 if contested.
- Stated battery limits: harness/ and sdk/ are outside the §B sweep (hand-verified clean 2026-08-03); constructed references invisible to grep; the fake does not model the DB CHECKs (covered by store validation + V7 probes).

## Next Session Should
**ST3** — the human surface `/stoa` (`code-elevated`, EXCEPT the declaration route's distress wiring — an R20a perimeter addition, **`code-critical`** per 0d-ii with its AC5 recorded decision; plan §3 ST3). Pre-condition: this commit pushed + the ST2 migration walked (or explicitly deferred — ST3 can build against TEST).

## Cross-references
- `operations/handoffs/founder/2026-08-03-stoa-ST1-community-map-CLOSE.md` (predecessor)
- `operations/connective-layer-2026-08/2026-08-02-stoa-build-plan.md` (§3 ST2 status updated)
- `operations/connective-layer-2026-08/2026-08-02-mentor-consultation-connective-layer-verbatim.md` (binding)
- `D-STOA-ST2-ENTRY-MODEL-BUILT-DARK-2026-08-03`

*End of session close. The Stoa's entry model exists dark — constitutionally shaped, erasable from birth, structurally separated — and the founder's walk makes the table real.*
