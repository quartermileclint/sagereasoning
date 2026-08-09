# Session close — `watching` built + the capability schema LIVE (2026-08-09)

**Stream:** founder. **Tier:** `code-critical`. **Decision:** `D-WATCHING-BUILT-AND-CAPABILITY-LIVE-2026-08-09`.
**Prompt executed:** `operations/handoffs/founder/2026-08-09-watching-BUILD-NEXT-SESSION-PROMPT.md` (its build-order note now updated in place — this build is done; the generation-side runner code is next).

## What happened

The second build gate of the ruled Q11 sequence executed: **`watching` is built exactly to the ruled scope** (`operations/agent-circles-2026-08/2026-08-09-watching-per-cycle-record-table-scope.md`; verbatim record wins), and — unlike `fresh` — **its schema and capability-widening steps were walked live founder-side to both TEST and PRODUCTION this session**, per the ruling's own weight (a new write-class capability + new tables).

**Schema (founder-walked TEST→prod, both §VERIFY green):** `idea_loop_cycles` + `idea_loop_candidates`, FK `CASCADE`, the four/seven-value ruled outcome vocabularies with `terminated_by_timeout` uniformly spelled at both levels (QW-C — verified live at the DB via `pg_get_constraintdef` on both environments), `UNIQUE (loop_id, cycle_number)` idempotency (the TEST probe reproduced the predicted `23505`), RLS service-role-only on both tables.

**The session's single most load-bearing finding:** the build prompt's claim that adding `watching_write` to the code constant "inherits" the 6e §A invariant "automatically" was **verified false** by reading the prior migrations directly — both `api_keys_capabilities_subset_check` and the 6e owner+agent CHECK are hard-coded arrays. A new founder-walked migration (`supabase-api-keys-watching-write-capability-migration.sql`, the 6e idiom) widens both (§V vocabulary, §W the owner+agent overlap). **Live-proven on TEST**, not merely claimed: the W3 positive probe genuinely 23514'd a `watching_write` mint with no owner/agent; W3b genuinely succeeded on a plain `consult`/`l1_supply` mint (no over-fire). Both walked to prod, `violating_active_rows = 0` both times.

**Routes built dark** behind the NEW `SUBSTRATE_WATCHING_ENABLED` (UNSET everywhere ⇒ 503, zero work, both routes): `POST /api/practice/watching` (write-class `watching_write` capability, Bearer-only, one call per completed cycle, server-stamped identity, idempotent, `pending`-rejected-in-completed-records, winner-consistency validated) and `GET /api/founder/watching` (`FOUNDER_USER_ID` Bearer JWT). A new `/founder-watching` dashboard renders the two things a schema/API check alone can't prove: Q7 transparency (every candidate, including refused ones, with heuristic attribution) and the §2.5 runner-composed disclosure — both from a single shared constant so page and wire can't drift.

**No credential was minted.** `watching_write` provisioning stays with the runner scoping session per the ruling's carry-forward — confirmed explicitly, not pulled forward.

Data rights wired at build (delete/export/consumer-erasure/retention-sweep), all missing-table-benign-turned-empty-safe now that the migration has landed.

## Verified

- `watching-handler` **70/0** (new) · `founder-watching-handler` **20/0** (new) · `idea-loop-watching-store` **23/0** (new) · `practice-credential` **46/0** (regression, updated pin) · `fresh-handler` **61/0** (regression, clean) · `tsc` 0 · `npm run build` ✓ (all three new routes/page registered).
- **PR19 independent adversarial review: GO_WITH_FIX, two nits folded across two passes.** First pass: the launched Workflow's three finder agents all died on the account session limit (the documented spend-limit-outage class) — completed FIRST-HAND across all three dimensions rather than accepted as a pass; one nit found + fixed (a citation-precision fix in a doc comment). Second pass, after the founder restored model settings and re-ran: **completed FULLY (4 agents, 0 errors, ~1.07M tokens)** — confirmed the first pass's conclusions and found one more nit (a redundant export/import pair), folded. Zero medium/high/critical across both passes.

## Session honesty notes

Hook consults timed out at 28s through most of the build (the known transient class) — several edits proceeded unframed, disclosed at each occurrence. The frame began firing partway through; one redirection/re-examination loop closed cleanly. The Sage Reflect close-turn review was taken.

## Production state at session close

**`SUBSTRATE_WATCHING_ENABLED` was never set — both routes remain dark.** Production is NOT byte-equivalent to session-open in one deliberate, intended way: `idea_loop_cycles`/`idea_loop_candidates` now exist (empty, inert), and the two `api_keys` CHECKs are additively widened (reversible, changes nothing about which existing credential authenticates). AC7 engaged and discharged at the migration/capability steps — the founder walked every live Supabase op; the AI performed none.

## Rollback

Unset the flag (already unset, no-op) + `git revert` the build commit for the code. The two migrations are independently reversible per their own footer/`§*.INVERSE` blocks.

## Next

1. **The generation-side runner code** — the additive `loop_id` field on `/api/reason` per QG-C. Its own session; structurally dependent on both `fresh` and `watching` existing — both now do. The generation-step scope document is already RULED (`D-GENERATION-STEP-SCOPE-RULED-2026-08-09`); its own runner-session carry-forwards (QW-A's `dependency_unavailable`/counter semantics, the `watching_write` provisioning + dedicated identity mint, the `ORIENTATION_DELIVERY_TIMEOUT_MS` revisit trigger, the `frictionAssessment` PM-tool mapping question) all still apply.
2. `watching` activation (`SUBSTRATE_WATCHING_ENABLED`) — founder-walked `code-critical`, not pre-approved.
3. `fresh` activation (`SUBSTRATE_FRESH_ENABLED`) — carried unchanged from the prior close.

*End of close.*
