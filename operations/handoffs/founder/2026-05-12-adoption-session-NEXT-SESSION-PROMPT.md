# Next-Session Prompt — Adoption Session: ST2 Amendments → /adopted/

**Stream:** founder.
**Tier:** governance.
**Governing frame:** /adopted/standing-protocol-cache.md (full governance via the cache; deliverable-of-the-day = the four ST2 amendment drafts).
**Predecessor session close:** /operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-close.md.
**Predecessor decision-log entries:** D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12 (parent); D-STAGING-PLAN-ADOPTED-2026-05-10 (predecessor adoption); D-BUILD-SESSIONS-CACHE-ADOPTED-2026-05-10.
**Risk classification:** session-as-a-whole = Elevated under 0d-ii. Each `/drafts/` → `/adopted/` move is Elevated per standing cache risk table. Critical Change Protocol NOT engaged (no code; no env vars; documentation only).

## Why this session matters

ST2 produced four amendment drafts; nothing was adopted. This session does the adoption work — moves drafts into `/adopted/`, the manifest, and the project-instructions surface. Without this session, the ST2 stress-test work remains as drafts and does not govern future build sessions. Subsequent substrate-build work (A5 — Layer 3 server-side service; Stage 1 expansion sub-stages A10-A19; Stage 3 re-scope) all depends on the amendments being live.

## Pre-conditions

1. ST2 close commit on origin/main. Verify: `git log --oneline -1 origin/main` shows the ST2 close commit `Build-Plan Stress-Test ST2 close + four amendment drafts + adoption-session prompt (2026-05-12)`.
2. Founder has read the four ST2 draft files between sessions (~60 min total reading time per the adoption checklist):
   - `/drafts/2026-05-12-staging-plan-amendments.md`
   - `/drafts/2026-05-12-manifest-amendments.md`
   - `/drafts/2026-05-12-project-instruction-amendments.md`
   - `/drafts/2026-05-12-amendment-adoption-checklist.md`
3. Founder communicates revisions at session-open (if any).
4. Production state unchanged from ST2 close: substrate at A4 Verified; `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET; `/api/public-key` steady-state shape.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, risk class, signals, lean templates)
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — confirms build-arc context; open-questions parking-lot)
3. `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-close.md` (~10 min — predecessor close; triage record; decisions made)
4. `/drafts/2026-05-12-amendment-adoption-checklist.md` (~10 min — the operative deliverable of the day)
5. `/operations/decision-log.md` last entry (D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12)

Confirm at session-open: tier (governance / Elevated); hold-point status (P0 0h active); risk class for each move (all Elevated except Standard for moves 1, 5, 6); status vocabulary; signals.

## Part B — Procedure

Execute the six moves per `/drafts/2026-05-12-amendment-adoption-checklist.md`. Each move produces a decision-log entry in the active log.

### Move 1 — Risk-classification correction (optional; Standard; ~5 min)

If founder elects, append `D-CLASSIFICATION-CORRECTION-2026-05-XX` lean-form entry correcting the earlier Standard → Elevated mis-classification on the v1-archive entry.

### Move 2 — Staging plan adoption (Elevated; ~20 min)

Re-write `/adopted/substrate-plugin-staging-plan.md` incorporating the amendments per `/drafts/2026-05-12-staging-plan-amendments.md`. Move source draft to `/archive/2026-05-12-staging-plan-amendments-source-of-amendment.md`. Append `D-STAGING-PLAN-AMENDED-FROM-ST2-2026-05-XX` entry.

### Move 3 — Manifest adoption + J1 ADR creation (Elevated; ~25 min)

Re-write `/manifest.md` per `/drafts/2026-05-12-manifest-amendments.md`: R17g + R17h + R17i; R18a Character Kernel + Article 50 placeholder; AC9 + AC10 + AC11 + AC12 + AC13; CR-### register populated; AC1 governance task; R20a perimeter broadening note. Create `/adopted/adr/2026-05-XX-substrate-category-character-kernel.md` per scaffold in the manifest-amendments draft. Move source draft to archive. Append `D-MANIFEST-AMENDED-FROM-ST2-2026-05-XX` entry.

### Move 4 — Project-instruction adoption (Elevated; ~20 min)

Amend project-instructions surface (Cowork panel, or `/adopted/project-instructions-snapshot.md` in repo per founder election) per `/drafts/2026-05-12-project-instruction-amendments.md`: PR10 PEV loop; PR11-PR15 SR1-SR4; PR16 SR5; AI signals diagnostic-certainty rows. Move source draft to archive. Append `D-PROJECT-INSTRUCTIONS-AMENDED-FROM-ST2-2026-05-XX` entry.

### Move 5 — Cache updates (Standard; ~15 min)

Update `/adopted/standing-protocol-cache.md` to reference new PR10-PR16. Update `/adopted/build-sessions-protocol-cache.md` open-questions parking lot (close items resolved). Append `D-CACHE-DRIFT-RESOLVED-2026-05-XX` lean-form entry.

### Move 6 — Parallel pre-launch track artefact (Standard; ~10 min)

Create `/operations/parallel-track-fpe-status.md` with FPE-1 through FPE-5 items + status (all Scoped at adoption time). Cross-reference in `/operations/INDEX.md` if used. No decision-log entry needed (artefact creation).

### Step 7 — Verify

Per `/drafts/2026-05-12-amendment-adoption-checklist.md` §"Founder Verification":

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# Confirm /adopted/ updates
grep -c "Character Kernel" /manifest.md       # expected: >= 2
grep -c "R17g\|R17h\|R17i" /manifest.md       # expected: >= 3
grep -c "AC9\|AC10\|AC11\|AC12\|AC13" /manifest.md  # expected: >= 5

# Confirm J1 ADR
ls adopted/adr/2026-05-XX-substrate-category-character-kernel.md  # expected: exists

# Confirm staging plan re-written
grep -c "A10\|A11\|A12\|A13\|A14\|A15\|A16\|A17\|A18\|A19" adopted/substrate-plugin-staging-plan.md  # expected: >= 10

# Confirm parallel track artefact
ls operations/parallel-track-fpe-status.md  # expected: exists

# Confirm decision log entries
grep -c "^## 2026-05-XX" operations/decision-log.md  # expected: 5-6 new entries
```

### Step 8 — Append decision-log entries (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". One entry per move (moves 2, 3, 4, 5; optional 1).

### Step 9 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Write to `/operations/handoffs/founder/2026-05-XX-adoption-session-close.md`.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + ST2 close + adoption checklist read | 25-30 min |
| Move 1 (optional risk-classification correction) | 5 min |
| Move 2 (staging plan adoption) | 20 min |
| Move 3 (manifest adoption + J1 ADR creation) | 25 min |
| Move 4 (project-instruction adoption) | 20 min |
| Move 5 (cache updates) | 15 min |
| Move 6 (parallel track artefact) | 10 min |
| Step 7 verify | 5 min |
| Decision-log entries + session close | 20-25 min |
| **Total** | **~2.5 hours** |

**Alternative session shape (split):** if 2.5 hours is too long in one sitting, split into:
- Adoption-A: Moves 1-3 (~75 min plus session-open/close ~20 min = ~95 min)
- Adoption-B: Moves 4-6 + verify + close (~75-90 min)

Founder elects at session-open.

**Alternative path:** if A5 (Layer 3 server-side service) is the next substrate-build session and its scope is compatible, the adoption work could fold into A5's session-open. Adoption-A (moves 2 + 3) could plausibly precede A5's coding. Founder elects.

## Rollback path

Each move has a rollback path documented in `/drafts/2026-05-12-amendment-adoption-checklist.md`. Typical rollback: `git revert <commit>` of the adoption commit. If the adoption is split across multiple sessions and an intermediate state is undesirable, revert to the ST2 close commit (`Build-Plan Stress-Test ST2 close + four amendment drafts + adoption-session prompt (2026-05-12)`) as the rollback target.

## Forecast

Successful adoption produces the following state:
- `/adopted/substrate-plugin-staging-plan.md` carries Stage 1 expansion + Stage 3 re-scope + Stage 4 gating expansion + Stage 6 strategy + parallel track
- `/manifest.md` carries R17g/h/i; R18a Character Kernel; AC9-AC13; CR-### register; AC1 governance task; R20a perimeter placeholder
- `/adopted/adr/2026-05-XX-substrate-category-character-kernel.md` exists as J1 ADR
- Project-instructions carries PR10-PR16 + diagnostic-certainty AI signals
- Caches updated; build-arc open-questions parking-lot closes resolved items
- Parallel pre-launch track artefact exists with FPE-1 through FPE-5
- Substrate production: unchanged

**Next session after adoption:** A5 — Layer 3 server-side service under the amended build plan. Or A10 — per-agent credentials (Stage 1 expansion's first item) if founder prefers Critical-gap closure before A5. Founder elects at adoption-session close.

End of prompt.
