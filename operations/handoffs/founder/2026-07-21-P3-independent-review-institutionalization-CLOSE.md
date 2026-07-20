# Session Close — 2026-07-21 — P3: Institutionalize the Independent Adversarial Review

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md.
**Tier:** `governance` (session category); the PR19 amendment itself carries **Elevated** risk under the project-instructions snapshot's own update discipline (line 6) — a more specific rule than the category default.
**Date:** 2026-07-21.

## Decisions Made
- `D-PR19-ADOPTED-INDEPENDENT-REVIEW-REQUIRED-2026-07-21` appended. PR19 adopted (founder sign-off via AskUserQuestion): independent adversarial review required, not optional, before a trust-core/predicate/fold/engine change or a live-op-consequential build plan is treated as verified; spend-limit fallback codified with a mandatory-not-recommended re-run before downstream reliance.
- `D-CACHE-DRIFT-RESOLVED-2026-07-21` appended. Standing-protocol-cache updated same-session per its own update discipline.

## Status Changes
| Item | Old | New |
|---|---|---|
| PR19 (independent review requirement) | Did not exist (informal practice only) | Adopted, `adopted/project-instructions-snapshot.md` |
| `operations/review-harness/independent-review-workflow-template.md` | Did not exist | Created (seeded from the three 2026-07-19 grounding runs) |
| `adopted/standing-protocol-cache.md` | Referenced PR1–PR18 | References PR1–PR19; new cross-reference to the review-harness template |

## Next Session Should
This was a standalone, self-contained session per the plan's own P3 scope (§3-P3: "not assumed to ride P1"). Nothing is queued as an immediate next step from P3 itself. The AO plan's other tracks (P1/P2/P4 etc.) continue on their own cadence in parallel sessions, per `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md`.

## Blocked On
**Files remaining uncommitted:**
- `adopted/project-instructions-snapshot.md`
- `adopted/standing-protocol-cache.md`
- `operations/review-harness/independent-review-workflow-template.md`
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-07-21-P3-independent-review-institutionalization-CLOSE.md`

**Production state at session close (as of 2026-07-21):** documents-only session; no code/schema/flag/credential/deploy change. Production remains exactly as described in the most recent prior close (`operations/handoffs/founder/2026-07-20-P-GL-finish-CLOSE.md` plus the interim P2 standing note dated 2026-07-21) — this session touched none of it.

## Open Questions
- The founder still needs to paste-sync the amended project-instructions snapshot into the Cowork panel (per the snapshot's own update discipline, line 6) — a founder-performed step outside this session's reach (PR17), named explicitly rather than folded into a one-line hand-off.

## Founder Verification
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add adopted/project-instructions-snapshot.md adopted/standing-protocol-cache.md operations/review-harness/independent-review-workflow-template.md operations/decision-log.md operations/handoffs/founder/2026-07-21-P3-independent-review-institutionalization-CLOSE.md
git commit -m "Adopt PR19: require independent adversarial review, not optional first-hand fallback

Institutionalizes the discipline validated three times on 2026-07-19 (kathekon
self-circle re-review, AE-2 loop-fold re-review, and this program's own
build-plan critique). Adds a reusable review-workflow template and codifies
the spend-limit-outage fallback with a mandatory (not merely recommended)
independent re-run before any downstream reliance.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```
Then push via GitHub Desktop. No Vercel redeploy expected or required — no code/flag/schema touched.

## Cross-references
- `operations/handoffs/founder/2026-07-21-P3-independent-review-institutionalization-NEXT-SESSION-PROMPT.md` (this session's prompt)
- `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §3-P3, §7, §8
- `D-PR19-ADOPTED-INDEPENDENT-REVIEW-REQUIRED-2026-07-21`
- `D-CACHE-DRIFT-RESOLVED-2026-07-21`
- `operations/review-harness/independent-review-workflow-template.md`

*End of session close. PR19 is Adopted, the template is in place, and the cache is current — the P3 process-rule institutionalization is complete and stands independently of the AO plan's other, currently-parallel tracks.*
