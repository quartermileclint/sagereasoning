# Amendment Adoption Checklist — ST2 Output (2026-05-12)

**Status:** Drafted 2026-05-12 during ST2 Phase 4. Governs the operations a future session must perform to move the ST2 amendments from `/drafts/` into `/adopted/` + manifest + project instructions.
**Risk classification:** the checklist itself is Standard. Each `/drafts/` → `/adopted/` move is Elevated per standing protocol cache risk table.

---

## Plain-language summary

ST2 produced four draft files in `/drafts/`. None is adopted. Adoption is a separate operation. This checklist names:
1. What founder reviews between ST2 and the adoption session
2. The sequence of moves in the adoption session
3. Risk classification per move
4. Pre-conditions and post-conditions
5. Verification steps the founder performs

The adoption session is estimated at **1.5-2 hours.** It is a routine governance session — no code touched; no env vars changed; substrate production unchanged.

Optionally, the adoption work may be folded into the session-open of the next substrate-build session (e.g., A5 — Layer 3 server-side service under the amended plan) if that session's scope is compatible. Founder elects at ST2 close.

---

## Between ST2 and adoption: founder reviews

The four draft files for the founder to read independently:

| # | File | Length | Reading time |
|---|---|---|---|
| 1 | `/drafts/2026-05-12-staging-plan-amendments.md` | ~310 lines | ~20 min |
| 2 | `/drafts/2026-05-12-manifest-amendments.md` | ~260 lines | ~15 min |
| 3 | `/drafts/2026-05-12-project-instruction-amendments.md` | ~190 lines | ~12 min |
| 4 | This file (`/drafts/2026-05-12-amendment-adoption-checklist.md`) | ~150 lines | ~10 min |

**Total founder review time:** ~60 minutes.

**Founder review questions to answer per file:**
- Does the amendment text match my Phase 3 election?
- Are there cross-references I need to verify (decision-log entries; previous ADRs)?
- Are there items I want to revise before adoption?

Any revision request is communicated to the AI at adoption-session open; the AI updates the draft before move-to-adopted.

---

## Adoption session — sequence of moves

### Move 1 — Risk-classification correction (Q1 carry-forward)

**Optional** per ST2 project-instruction amendments draft §"Housekeeping observations."

Append lean-form decision-log entry to `/operations/decision-log.md`:

```
## 2026-05-XX — D-CLASSIFICATION-CORRECTION-2026-05-XX

**Decision:** Retroactively correct the risk classification of D-STRESS-TEST-PROMPT-V2-ADOPTED-V1-ARCHIVED-2026-05-12 from Standard to Elevated.

**Reasoning:** Per standing protocol cache risk table, "Move file from /drafts/ to /adopted/ or to /archive/" is Elevated. The 2026-05-12 entry mis-classified as Standard. Operational impact: none. Audit-trail consistency: correction logged.

**Files touched:**
- /operations/decision-log.md — append this entry; original D-STRESS-TEST-PROMPT-V2-ADOPTED-V1-ARCHIVED-2026-05-12 entry NOT modified (audit-trail preservation; correction is a separate entry referencing the original)

**Risk classification:** Standard under 0d-ii. Correction entry; not the corrected action.

**Status:** Adopted. Cross-references: D-STRESS-TEST-PROMPT-V2-ADOPTED-V1-ARCHIVED-2026-05-12; standing protocol cache risk table.
```

Risk: Standard. Time: ~5 minutes.

### Move 2 — Staging plan adoption

**Pre-conditions:**
- Founder has read `/drafts/2026-05-12-staging-plan-amendments.md` and confirmed alignment with Phase 3 triage
- No revisions requested (or revisions applied)

**Action:**
- Read current `/adopted/substrate-plugin-staging-plan.md`
- Apply the amendments from the draft file (re-write the staging plan in place, incorporating all Stage 1 expansion items + Stage 3 re-scope + Stage 4 expanded gating + Stage 6 multi-marketplace + parallel pre-launch track)
- Preserve the previous version in git history (no separate archive file needed — git is the version trail)
- Move the draft to `/archive/2026-05-12-staging-plan-amendments-source-of-amendment.md` for source-of-truth preservation

**Decision-log entry:**

```
## 2026-05-XX — D-STAGING-PLAN-AMENDED-FROM-ST2-2026-05-XX

**Decision:** Adopt ST2 staging-plan amendments into /adopted/substrate-plugin-staging-plan.md. Stage 1 expanded with A10-A19 sub-stages. Stage 2 start delayed pending Stage 1 close. Stage 3 re-scoped on Anthropic Plugin spec + MCP. Stage 4 G1 = Cowork first; G4 gating expanded to include parallel pre-launch track items. Stage 6 multi-marketplace strategy locked in. Parallel pre-launch founder-personal-exposure track recorded.

**Reasoning:** ST2 Phase 3 four-outcome triage of 34 Phase 2 amendments + 16 Phase 2.5 candidates + 4 meta-questions, all under founder elections recorded in ST2 close.

**Files touched:**
- /adopted/substrate-plugin-staging-plan.md — re-written incorporating amendments
- /archive/2026-05-12-staging-plan-amendments-source-of-amendment.md — source draft preserved
- /drafts/2026-05-12-staging-plan-amendments.md — moved to archive (or deleted; git history preserves)

**Risk classification:** Elevated under 0d-ii (file move /drafts/ → /adopted/).

**Rollback path:** git revert this commit; restore /adopted/substrate-plugin-staging-plan.md to previous content.

**Verification step (founder-performable):**
git log --oneline /adopted/substrate-plugin-staging-plan.md | head -2
diff /adopted/substrate-plugin-staging-plan.md /archive/2026-05-12-staging-plan-amendments-source-of-amendment.md
Expected: latest commit is the adoption; diff shows the amendments applied

**Rules served:** R0, R14, R18a, Q3, Q4, Q6 from ST2 Phase 3

**Status:** Adopted. Cross-references: D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12 (parent triage entry); ST2 close note.
```

Risk: **Elevated.** Time: ~20 minutes.

### Move 3 — Manifest adoption

**Pre-conditions:**
- Founder has read `/drafts/2026-05-12-manifest-amendments.md` and confirmed alignment
- No revisions requested (or applied)

**Action:**
- Read current `/manifest.md`
- Apply amendments: R17g + R17h + R17i (new R17 sub-rules); R18a Character Kernel language + Article 50 placeholder; AC9-AC13 (new AC items); CR-### register populated; AC1 governance task note; R20a perimeter placeholder note
- Re-write manifest in place; git preserves prior version
- J1 ADR (Substrate Category — Character Kernel) drafted as `/adopted/adr/2026-05-XX-substrate-category-character-kernel.md` (separate file)

**Decision-log entry:**

```
## 2026-05-XX — D-MANIFEST-AMENDED-FROM-ST2-2026-05-XX

**Decision:** Adopt ST2 manifest amendments. R17 expanded with R17g + R17h + R17i (SAR + rectification + portability). R18a Character Kernel category language adopted with Article 50 placeholder. AC9 Layer2Decision four-outcome envelope + AC10 provenance/use-policy tags + AC11 OpenTelemetry + AC12 sub-agent verification + AC13 Outcomes-grader option. CR-### register populated with 8 live binding obligations. AC1 governance task added for next quarterly review.

**Reasoning:** ST2 Phase 3 four-outcome triage; founder elections; Phase 2 gap analysis.

**Files touched:**
- /manifest.md — re-written incorporating amendments
- /adopted/adr/2026-05-XX-substrate-category-character-kernel.md (NEW J1 ADR)
- /archive/2026-05-12-manifest-amendments-source-of-amendment.md — source draft preserved

**Risk classification:** Elevated under 0d-ii. CCP NOT engaged (no code; no env vars; documentation only).

**Rollback path:** git revert this commit.

**Verification step (founder-performable):**
grep -n "R17g\|R17h\|R17i\|AC9\|AC10\|AC11\|AC12\|AC13\|Character Kernel" /manifest.md
Expected: each appears at least once

**Rules served:** R17, R18a, AC1-AC13 governance, CR-###

**Status:** Adopted. Cross-references: D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12; ST2 close note.
```

Risk: **Elevated.** Time: ~25 minutes.

### Move 4 — Project-instruction adoption

**Pre-conditions:**
- Founder has read `/drafts/2026-05-12-project-instruction-amendments.md` and confirmed alignment
- Founder understands project instructions are managed via Cowork's project-instructions panel (not in repo)
- Founder decides: amend Cowork project-instructions panel; or maintain a `/adopted/project-instructions-snapshot.md` in repo and amend that

**Action:**
- Add PR10 — PEV loop + diagnostic-certainty
- Add PR11-PR15 — SR1, SR1a, SR2, SR3, SR4 (per Q8 election: as new PR rules)
- Add PR16 — Outcomes-grader option (Phase 2.5 Candidate 6)
- Update AI signals table with three diagnostic-certainty rows
- Note: the SR5 row in the prompt is positioning + dogfood lens; per Q8 election it becomes PR16. The numbering in this draft is: PR10 PEV; PR11 SR1; PR12 SR1a; PR13 SR2; PR14 SR3; PR15 SR4; PR16 SR5.

**Decision-log entry:**

```
## 2026-05-XX — D-PROJECT-INSTRUCTIONS-AMENDED-FROM-ST2-2026-05-XX

**Decision:** Adopt ST2 project-instruction amendments. PR10 (PEV loop + diagnostic-certainty) + PR11-PR16 (SR1, SR1a, SR2, SR3, SR4, SR5 promoted from session-open commitments to permanent rules) added. AI signals table extended with three diagnostic-certainty signals.

**Reasoning:** ST2 Phase 3 Q8 election; Step 5 Candidate 16 ALLOW.

**Files touched:**
- Cowork project-instructions panel — amended (or /adopted/project-instructions-snapshot.md if founder elects snapshot-in-repo)
- /archive/2026-05-12-project-instruction-amendments-source-of-amendment.md — source draft preserved

**Risk classification:** Elevated under 0d-ii.

**Rollback path:** restore previous project-instructions from Cowork's panel-edit history (or git revert if snapshot-in-repo).

**Verification step (founder-performable):**
[At next session-open, confirm PR10-PR16 appear in project-instructions surface; AI states "PR10-PR16 in force" at session-open]

**Rules served:** PR10-PR16; AI signals table.

**Status:** Adopted. Cross-references: D-STRESS-TEST-STAGING-PLAN-AMENDMENTS-2026-05-12; ST2 close.
```

Risk: **Elevated.** Time: ~20 minutes.

### Move 5 — Cache updates

Per standing-protocol-cache cache-update-discipline + build-sessions-protocol-cache cache-update-discipline:

**Action:**
- Update `/adopted/standing-protocol-cache.md` to reference new PR10-PR16
- Update `/adopted/build-sessions-protocol-cache.md` if any open-questions parking-lot item closes (Q1, Q2, Q3, Q4, Q6, Q8 from ST2 all close items)
- Append `D-CACHE-DRIFT-RESOLVED-2026-05-XX` lean-form entry

Risk: Standard. Time: ~15 minutes.

### Move 6 — Parallel pre-launch track artefact

**NEW deliverable** per staging-plan-amendments §"Parallel pre-launch founder-personal-exposure track":
- Create `/operations/parallel-track-fpe-status.md` with FPE-1 through FPE-5 items + status (all Scoped at adoption time)
- Track updated independently of substrate-build sessions; not auto-synced with the staging plan

Risk: Standard. Time: ~10 minutes.

---

## Risk classification per move (summary)

| Move | Risk | Time |
|---|---|---|
| 1. Risk-classification correction (optional) | Standard | 5 min |
| 2. Staging plan adoption | Elevated | 20 min |
| 3. Manifest adoption | Elevated | 25 min |
| 4. Project-instruction adoption | Elevated | 20 min |
| 5. Cache updates | Standard | 15 min |
| 6. Parallel track artefact | Standard | 10 min |
| **Total** | | **~95-100 min** |

Plus ~30-40 min for adoption-session open + close. **Estimated total adoption session: ~1.5-2 hours.**

---

## Post-conditions after adoption

After all six moves complete:

- `/adopted/substrate-plugin-staging-plan.md` carries Stage 1 expansion + Stage 3 re-scope + Stage 4 gating expansion + Stage 6 strategy + parallel track
- `/manifest.md` carries R17g/h/i; R18a Character Kernel; AC9-AC13; CR-### register; AC1 governance task; R20a perimeter placeholder
- `/adopted/adr/2026-05-XX-substrate-category-character-kernel.md` exists as J1 ADR
- Project-instructions surface carries PR10-PR16 + diagnostic-certainty signals
- `/adopted/standing-protocol-cache.md` references PR10-PR16
- `/adopted/build-sessions-protocol-cache.md` open-questions parking-lot updated
- `/operations/parallel-track-fpe-status.md` exists with FPE-1 through FPE-5
- `/operations/decision-log.md` carries 4 new entries (D-STAGING-PLAN-AMENDED; D-MANIFEST-AMENDED; D-PROJECT-INSTRUCTIONS-AMENDED; D-CACHE-DRIFT-RESOLVED), plus optionally D-CLASSIFICATION-CORRECTION
- Substrate production state: UNCHANGED (no code touched in adoption session)

---

## Pre-conditions for adoption session (founder action between sessions)

1. **Founder commits ST2 close + amendment drafts to origin/main.** Commit command in ST2 close note.
2. **Founder reads the four draft files** (~60 min total reading time).
3. **Founder elects revisions** (if any) and communicates to AI at adoption session open.
4. **Founder confirms adoption-session scope** at adoption-session open: full adoption (Moves 1-6) in one session, or split.

---

## Cross-references

- ST2 close: `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST2-close.md`
- Staging plan amendments: `/drafts/2026-05-12-staging-plan-amendments.md`
- Manifest amendments: `/drafts/2026-05-12-manifest-amendments.md`
- Project-instruction amendments: `/drafts/2026-05-12-project-instruction-amendments.md`
- Phase 2 gap analysis: `/drafts/2026-05-12-phase-2-gap-analysis.md`
- ST1 close: `/operations/handoffs/founder/2026-05-12-build-plan-stress-test-ST1-close.md`
- Decision log: `/operations/decision-log.md`

---

*End of adoption checklist. Adoption is the operation this checklist governs; it does not happen this session.*
