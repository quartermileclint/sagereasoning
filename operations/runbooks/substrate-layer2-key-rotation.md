# Substrate Layer 2 Key Rotation Runbook

**Status:** Active. Operationalises the rotation contract committed in `/adopted/ADR-layer2-signing-infrastructure.md` §Decision 4 and `/adopted/ADR-A4-key-management.md` §Decision 2.
**First scheduled rotation:** Sunday 2026-09-06 (per A4 ADR Decision 4).
**Subsequent quarterly cadence:** ~2026-12-06, ~2027-03-07, ~2027-06-06, etc. (first Sunday of the third month of each quarter).
**Off-cycle variant:** §Off-cycle (compromise-suspected) rotation below; founder-initiated; tighter timeline.
**Update discipline:** living document. After each rotation, the founder updates the runbook based on observation; AI applies changes as Standard-risk governance work.

---

## Plain-language summary

This runbook is the founder-performable procedure for rotating the substrate's Layer 2 signing key. It exists because A3 ADR §Decision 4 committed the substrate to a quarterly rotation cadence, and a documented procedure that the founder can execute (with AI collaboration) is what converts that commitment from architecture into operational reality.

The procedure has 9 numbered steps, plus a pre-rotation checklist (1 week before) and a post-rotation reflection. Each step has exact copy-paste commands and a verification check. Most steps take 1-5 minutes; the longest waits are the 24-hour verifier-refresh window (Step 5) and the 30-day overlap window (Step 8). The whole rotation takes ~30 days wall-clock from start to retire-previous; ~1 hour of active founder time spread across that window.

The substrate signs with only the current key at all times — never with both. The previous key remains valid for verification during the 30-day overlap window, after which it retires and can be discarded.

---

## Pre-rotation checklist (1 week before rotation date)

Run this in a session 1 week before the scheduled rotation. ~15 minutes.

1. **Confirm three-copy backup of the current `SUBSTRATE_LAYER2_SIGNING_KEY` is intact.** Open password manager → find entry tagged `SUBSTRATE_LAYER2_SIGNING_KEY` → confirm value present. Open paper backup → confirm legible. Open Vercel Project → Settings → Environment Variables → confirm `SUBSTRATE_LAYER2_SIGNING_KEY` set. If any of the three is missing, restore before proceeding.

2. **Capture current key metadata.** In Vercel Project → Settings → Environment Variables, read and record the values of:
   - `SUBSTRATE_LAYER2_KEY_ID` (e.g., `substrate-layer2-2026Q2`)
   - `SUBSTRATE_LAYER2_KEY_ISSUED_AT` (e.g., `2026-05-10T04:45:15.516Z`)
   - `SUBSTRATE_LAYER2_PUBLIC_KEY` (first and last 50 characters; full PEM is too long to record manually but the AI can capture it during the rotation session)

   Store these values in a session note named "Rotation pre-flight YYYY-MM-DD" — the AI will use them during Steps 4 and 6.

3. **Confirm `/api/public-key` returns the expected current state.** In a terminal:
   ```bash
   curl -s https://www.sagereasoning.com/api/public-key | python3 -c "
   import json, sys
   d = json.load(sys.stdin)
   print('key_id:', d.get('key_id'))
   print('issued_at:', d.get('issued_at'))
   print('previous:', d.get('previous'))
   print('rotation_overlap_until:', d.get('rotation_overlap_until'))
   "
   ```
   Expected: `key_id` and `issued_at` match the values captured in step 2; `previous` is `null`; `rotation_overlap_until` is `null`. If any value differs, investigate before proceeding.

4. **Read this runbook end-to-end.** ~10 minutes. The runbook may have been updated since the last rotation; familiarity with the current version reduces mid-rotation friction.

5. **Confirm session availability for Steps 1-7 (~1 hour active).** The 9-step procedure has waits embedded; the active founder time across Steps 1-7 is ~1 hour (one session). Step 8 is a 30-day passive wait. Step 9 is a separate ~15-minute session 30 days later.

---

## Rotation procedure (9 steps)

The procedure runs in two founder-AI sessions: one for Steps 1-7 (the active rotation work; ~1 hour) and one for Step 9 (the retirement; ~15 minutes, 30 days after Step 7).

### Step 1 — Generate new Ed25519 keypair

The AI generates the new keypair in its sandbox using `node:crypto.generateKeyPairSync('ed25519')`. Output: a new private PEM (PKCS#8) + a new public PEM (SPKI). The AI displays the values in chat. Founder copies both immediately into a temporary password-manager note (the new key is not yet backed up properly — Step 3 handles that).

**Founder action:** confirm the AI has displayed both PEMs; copy both into temporary password-manager note.

**Verification:** the new private PEM begins with `-----BEGIN PRIVATE KEY-----`; the new public PEM begins with `-----BEGIN PUBLIC KEY-----`.

### Step 2 — Assign new key_id

The new key_id follows the convention `substrate-layer2-YYYYQN` where YYYY is the year and N is the quarter (1-4). For the first scheduled rotation on 2026-09-06, the new key_id is `substrate-layer2-2026Q3`.

**Founder action:** confirm the new key_id with the AI; record in session note.

**Verification:** the new key_id is different from the current `SUBSTRATE_LAYER2_KEY_ID` value.

### Step 3 — Three-copy backup of new private key (founder ceremony)

This is the load-bearing step. Per `ADR-ENCRYPTION-WIRING-01.md` §Decision 4 Option 4A.

**Founder action (in order):**

1. Open password manager → create new entry → tag as `SUBSTRATE_LAYER2_SIGNING_KEY (2026Q3)` (substituting the actual quarter) → paste the new private PEM into the entry → save.

2. Open the paper backup template (or a fresh sheet) → write the new private PEM in 4-character groups → label with the new key_id and the date → store in the physical secure location (safe / safety deposit box).

3. (Vercel env-var update happens in Step 7; this step covers offline backups only.)

**Verification (read-aloud):** with the AI watching, founder reads the new private PEM aloud from each backup copy in turn:
- From the password-manager entry: read first and last 30 characters
- From the paper backup: read first and last 30 characters
The AI confirms they match what it generated in Step 1.

If verification fails, do NOT proceed. Investigate which copy is wrong; correct; re-verify.

### Step 4 — Add new public key to API discovery as the previous slot

This is the counterintuitive step: the NEW public key is initially set as the "previous" slot, and the OLD public key remains the current slot. This lets verifiers begin trusting the new key 24 hours before any signatures are produced with it.

Wait — actually, re-reading A3 ADR §Decision 4 carefully, the procedure adds the NEW public key to API discovery *as a previous slot* so verifiers begin trusting it before signatures use it. Let me re-state this more clearly:

**At Step 4, the goal is:** verifiers see the new public key in `/api/public-key`'s response (as the `previous` slot) BEFORE the substrate starts signing with the new private key. This means verifiers can refresh their cache and add the new key to their known-keys set in advance.

**Founder action in Vercel (Project → Settings → Environment Variables):**

1. Add new env var `SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY` → paste the NEW public PEM from Step 1 → save.
2. Add new env var `SUBSTRATE_LAYER2_PREVIOUS_KEY_ID` → paste the NEW key_id from Step 2 (e.g., `substrate-layer2-2026Q3`) → save.
3. Add new env var `SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT` → paste the current ISO 8601 timestamp (the AI provides it) → save.
4. Add new env var `SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT` → paste an ISO 8601 timestamp 31 days in the future (the AI provides it; 31 days = 24-hour propagation + 30-day overlap window) → save.

**Vercel redeploys automatically after the last save.** Wait for the redeploy to complete (~1 minute).

**Verification:**
```bash
curl -s https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
print('current key_id:', d.get('key_id'))
print('previous key_id:', d.get('previous', {}).get('key_id') if d.get('previous') else None)
print('rotation_overlap_until:', d.get('rotation_overlap_until'))
"
```

Expected: `current key_id` is unchanged (still the old key_id, e.g., `substrate-layer2-2026Q2`); `previous key_id` is the NEW key_id (e.g., `substrate-layer2-2026Q3`); `rotation_overlap_until` is the timestamp 31 days in the future.

### Step 5 — Wait 24 hours for verifier refresh

Verifiers refresh `/api/public-key` on their own cadence (the endpoint's `Cache-Control: max-age=3600` means standards-compliant verifiers refresh hourly). 24 hours gives ample margin.

**Founder action:** none. Calendar reminder set for ~24 hours after Step 4 to resume at Step 6.

**Verification:** none required; this is a passive wait.

### Step 6 — Promote new key to current; demote old key to previous

This is the cutover. After this step, the substrate signs with the new private key.

**Founder action in Vercel (Project → Settings → Environment Variables):**

The order matters. Update env vars in this exact sequence:

1. **Capture old values BEFORE overwriting:** in the Vercel dashboard, read the current values of `SUBSTRATE_LAYER2_PUBLIC_KEY`, `SUBSTRATE_LAYER2_KEY_ID`, `SUBSTRATE_LAYER2_KEY_ISSUED_AT`. The AI captures these in chat (paste into chat). These are the OLD current key's values; they become the previous-key values after the cutover.

2. **Overwrite the previous-key env vars** with the OLD current key's values (which until now were not in the previous slot — the NEW key was sitting there from Step 4):
   - `SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY` ← the old public PEM (captured in step 1 above)
   - `SUBSTRATE_LAYER2_PREVIOUS_KEY_ID` ← the old key_id (e.g., `substrate-layer2-2026Q2`)
   - `SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT` ← the old issued_at value (e.g., `2026-05-10T04:45:15.516Z`)
   - `SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT` ← the same 30-days-from-now ISO 8601 timestamp from Step 4.

3. **Overwrite the current-key env vars** with the NEW key's values:
   - `SUBSTRATE_LAYER2_PUBLIC_KEY` ← the NEW public PEM (from Step 1)
   - `SUBSTRATE_LAYER2_KEY_ID` ← the NEW key_id (from Step 2)
   - `SUBSTRATE_LAYER2_KEY_ISSUED_AT` ← the current ISO 8601 timestamp (the AI provides; this is the moment of promotion)
   - `SUBSTRATE_LAYER2_SIGNING_KEY` ← the NEW private PEM (from Step 1)

4. **Save each env var.** Vercel redeploys after each save batch.

Wait for the redeploy to complete (~1 minute).

**Verification:**
```bash
curl -s https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
print('current key_id:', d.get('key_id'))
print('current issued_at:', d.get('issued_at'))
print('previous key_id:', d.get('previous', {}).get('key_id') if d.get('previous') else None)
print('previous issued_at:', d.get('previous', {}).get('issued_at') if d.get('previous') else None)
print('rotation_overlap_until:', d.get('rotation_overlap_until'))
"
```

Expected: `current key_id` is the NEW key_id (e.g., `substrate-layer2-2026Q3`); `current issued_at` is the moment of promotion; `previous key_id` is the OLD key_id (e.g., `substrate-layer2-2026Q2`); `previous issued_at` is the OLD key's original issued_at; `rotation_overlap_until` is 30 days from promotion.

### Step 7 — Confirm new signatures use the new key

Run a canonical curl against `/api/reason` and check the `key_id` field on the signed assessment.

**Founder action:**
```bash
curl -s -X POST https://www.sagereasoning.com/api/reason \
  -H "Content-Type: application/json" \
  -H "X-Plugin-Auth: <PLUGIN_AUTH_SECRET-value-from-vercel>" \
  -d '{"input":"rotation verification","depth":"quick","layer1_schema":{"version":"layer1-schema-v1","passions_present":[],"control_filter_elements":[],"oikeiosis_circles_engaged":[],"value_categories_at_stake":[],"kathekon_factors":[],"urgency_indicators":[],"causal_stage_evidence":[],"eupatheia_candidates":[],"stated_concern_targets":[],"stated_equanimity_signals":[],"motivation_stated":false,"motivation_evidence":[],"element_fusion_detected":{"fused":false,"fused_concerns":null},"ambiguity_notes":[]}}' \
  | python3 -c "
import json, sys
d = json.load(sys.stdin)
a = d.get('assessment', {})
key_id = a.get('key_id') if isinstance(a, dict) else None
print('signed-assessment key_id:', key_id)
"
```

Expected: `signed-assessment key_id` is the NEW key_id (e.g., `substrate-layer2-2026Q3`). If the OLD key_id appears, the env-var update did not propagate; force a Vercel redeploy and retry.

### Step 8 — 30-day overlap window (passive)

The substrate signs with the new key; verifiers can verify against either key during this window. No action required.

**Founder action:** calendar reminder for Day 30 (the date matching `SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT`). Title: "Substrate key rotation — retire previous key (Step 9 of runbook)."

**Verification:** none required during the wait. Optionally: every 7 days, run the Step 7 curl + a /api/public-key curl to confirm the rotation state remains intact.

### Step 9 — Retire previous key

After 30 days, the previous key is no longer needed. Removing it from API discovery is the rotation completion.

**Founder action in Vercel (Project → Settings → Environment Variables):**

1. Delete env var `SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY`.
2. Delete env var `SUBSTRATE_LAYER2_PREVIOUS_KEY_ID`.
3. Delete env var `SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT`.
4. Delete env var `SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT`.

Vercel redeploys (~1 minute).

**Founder action with backups:** in the password manager, the entry tagged `SUBSTRATE_LAYER2_SIGNING_KEY (2026Q2)` (the previous quarter's key) can now be moved to a "retired keys" archive folder within the password manager, but **do not delete it** — already-issued signatures (made before Step 6) remain verifiable against the corresponding public key, and a future audit may require the retired private key. Retain indefinitely.

**Verification:**
```bash
curl -s https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
print('previous:', d.get('previous'))
print('rotation_overlap_until:', d.get('rotation_overlap_until'))
"
```

Expected: `previous` is `null`; `rotation_overlap_until` is `null`. The substrate is back in steady state with the new key as current.

**Schedule the next rotation:** add a calendar reminder for ~3 months out (the next quarterly rotation). Update this runbook's "Subsequent quarterly cadence" header if the cadence date convention changes.

---

## Off-cycle (compromise-suspected) rotation

Engaged when the founder has reason to believe the current `SUBSTRATE_LAYER2_SIGNING_KEY` may be compromised. Treated as **Elevated** per 0d-ii (urgency does not reduce classification — the rotation procedure is the same; only the timeline tightens).

**Differences from the scheduled rotation:**

- **Step 5 (24-hour wait) may be shortened to 1 hour** if the threat is acute. Verifiers caching aggressively may reject signatures with the new key during the shortened window; this is an accepted trade-off when compromise is suspected.
- **Step 8 (30-day overlap) may be shortened to 7 days** if the threat profile justifies retiring the compromised key faster. Founder discretion.
- **Backup ceremony at Step 3 retains the same rigor** — a compromise event is not a reason to skip the three-copy discipline; if anything, the new key's safety matters more.
- **Founder logs an incident note** in `/operations/handoffs/founder/incidents/YYYY-MM-DD-substrate-key-compromise-suspected.md` covering: what triggered the suspicion, what timeline was elected, what verifications were run, and what indicators (if any) confirmed or refuted the compromise.

The 9-step procedure is otherwise unchanged.

---

## Rollback paths during a rotation

Three paths in order of preference. The path elected depends on which step the rotation is at when the failure surfaces.

### Path A — Un-promote (within Steps 4-7; before 24-hour wait completes)

If a verification fails between Step 4 and Step 7, the rotation can be aborted by un-setting the previous-key env vars:

1. Delete `SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY`, `SUBSTRATE_LAYER2_PREVIOUS_KEY_ID`, `SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT`, `SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT` from Vercel.
2. Vercel redeploys (~1 minute). The endpoint returns to the pre-Step-4 state.
3. The new keypair from Step 1 is discarded (purge from temporary password-manager note + paper backup).
4. Investigate the failure cause; resume rotation in a future session.

Recovery time: ~5 minutes.

### Path B — Revert promotion (during Step 6)

If Step 7 verification shows the new key didn't propagate, OR if the new key is producing invalid signatures:

1. **Re-set the current-key env vars to the OLD values** (captured in Step 6.1):
   - `SUBSTRATE_LAYER2_PUBLIC_KEY` ← old public PEM
   - `SUBSTRATE_LAYER2_KEY_ID` ← old key_id
   - `SUBSTRATE_LAYER2_KEY_ISSUED_AT` ← old issued_at
   - `SUBSTRATE_LAYER2_SIGNING_KEY` ← old private PEM (restore from backup if needed)
2. Vercel redeploys. The substrate signs with the OLD key again.
3. Run Path A to clear the previous-key env vars.

Recovery time: ~10 minutes (longer if old private PEM must be restored from password-manager backup).

### Path C — Full re-rotation (compromise confirmed mid-rotation)

If during the rotation the founder confirms (not just suspects) that the OLD key was compromised, AND the new key may also be compromised:

1. Engage Path A to abort the in-progress rotation.
2. Generate a third keypair (Step 1 with fresh seed).
3. Re-run the off-cycle (compromise-suspected) variant from Step 1.
4. Treat the OLD private key as fully compromised; do not use again; mark as "retired-compromised" in the password manager.

This path requires founder discretion + explicit approval; AI cannot trigger it.

---

## Post-rotation reflection (Day 31 or shortly after)

After Step 9 completes, the founder runs a brief reflection in the next routine session:

1. **What worked?** Steps that ran cleanly with no surprises.
2. **What caused friction?** Anywhere the founder had to pause, ask the AI a question, or look something up.
3. **What was unclear?** Any step where the runbook language was ambiguous.
4. **Update the runbook.** Standard-risk governance change. Append `D-RUNBOOK-LAYER2-KEY-ROTATION-UPDATED-YYYY-MM-DD` to the decision log.

The runbook is a living document; each rotation makes it slightly better.

---

## Cross-references

- `/adopted/ADR-layer2-signing-infrastructure.md` §Decision 4 — the rotation contract this runbook operationalises
- `/adopted/ADR-A4-key-management.md` §Decision 2 — the four-env-var schema
- `/adopted/ADR-ENCRYPTION-WIRING-01.md` §Decision 4 Option 4A — the three-copy backup ceremony pattern (Step 3 mirrors)
- `/adopted/standing-protocol-cache.md` — risk classification (rotation = Critical for the active steps; passive waits = N/A)
- `/adopted/build-sessions-protocol-cache.md` — "no current users" governing note applies until plugin ships
- `/website/src/app/api/public-key/route.ts` — the endpoint the verification curls hit
- `/website/src/lib/translation-sandwich/layer2-signer.ts` — the signing module (unchanged during rotation; reads `SUBSTRATE_LAYER2_SIGNING_KEY` at call time)
- `/operations/decision-log.md` — append `D-LAYER2-KEY-ROTATION-COMPLETED-YYYY-MM-DD` after Step 9 of each rotation

---

*End of runbook. Living document; update post-rotation per §Post-rotation reflection.*
