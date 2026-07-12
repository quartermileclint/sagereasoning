# S10 staged R18 docs — apply AT the founder-walked activation, not before

**Status: APPLIED 2026-07-12 (at the founder walk, post-sign — flag live, smokes green).** Originally: These doc changes describe a surface that answers 503 until
`SUBSTRATE_TRUST_READ_SURFACE_ENABLED` is set, so they are applied **in the same walk as the flag flip**
(the M1/M5 staged-docs pattern) — publishing them earlier would document a dark surface as live.
R18 sign-off: `operations/trust-layer-2026-07/2026-07-12-s10-r18-signoff-memo.md` — the founder's
approval at the walk licenses this application. The envelope text below is the narrowed ADR-013 §8
form (PA-6) verbatim-in-substance with the code constant (`TRUST_RECORD_ENVELOPE`); if the constant
changes, re-derive these docs from it, never the reverse.

---

## 1. `website/public/llms.txt`

**Insertion point:** a new `###` section immediately AFTER the `### Gate 1 — the two configurations
(pre-decision vs post-decision check)` section (currently ending ~line 441) and BEFORE
`### Score a Document (V3)`.

```
### Trust Record — Public Trust-Record Read Surface (per-domain reasoning-quality levels)

GET https://www.sagereasoning.com/api/trust-record/{agent_id}

Public, unauthenticated, rate-limited (30 req/min/IP). Returns the agent's standing TRUST RECORD:
per-virtue-domain trust levels (phronesis, dikaiosyne, andreia, sophrosyne, + the oversight
delegation-role domain where evidence exists) on the katorthoma-proximity scale
(reflexive | habitual | deliberate | principled | sage_like), each domain served at its LIVE
effective level — earned level, decayed toward the profile prior with domain inactivity, capped
at `deliberate` while a justice latch is active — plus the minimum-domain aggregate (the unity
thesis: the weakest evaluated cardinal domain sets the aggregate; never an average, never a
continuous score), a conservative read-time confidence weight with its stated basis, coverage
gaps named per domain, and a reflect record served as a MODULATE-ONLY class (reflect history
slows decay; it cannot raise any trust level and is not attested as a verified pattern of
honesty).

Response envelope: { status: 'ok'|'not_found'|'error', data?, message?, documentation_url }.
data.schema = 'sage-trust-record/v1'. 404 = no examined trust evidence has been folded for that
agent — declaration-class records alone do not surface a public record, so a 200 genuinely
implies at least one domain carries examined evidence (an honest miss, never a low score).
503 = the surface or the trust core is not enabled, or a store read failed (never cached).

MEASURE MODE: nothing in a trust record binds any decision. A human's right to override,
correct, or disagree with an agent's reasoning is absolute regardless of any level shown here
(R20c). Trust events fold ONLY from server-side, consumer-unforgeable artifacts: examination-
derived events require an Ed25519-re-verified signed assessment (verify any signed assessment
against GET /api/public-key); reflect-path events are backed by the retained reflect-session
record and the out-of-band screened examination where it ran — honesty-gated, modulate-only.

WHAT A TRUST RECORD ATTESTS:
- that signed, reproducible examination artifacts exist for the examination-derived events it
  aggregates (the no-event-without-a-verified-artifact rule);
- HOW the aggregated decisions were reasoned, as narrated and extracted from the submitted
  text (examination before acting; justice structure over the circles named in the text;
  passion diagnosis; proximity with per-domain floors);
- the decay and coverage state of each domain, honestly marked — sparse evidence is named,
  never papered over;
- the confidence basis of the aggregate (weakest-domain ceiling; corroboration floored at
  "uncorroborated").

WHAT IT DOES NOT ATTEST (HONEST LIMIT):
- factual correctness — the instrument reads how a decision was reasoned, not whether it was
  factually right; it is not a fact-checker;
- harms omitted from the submitted text — the disclosed extraction-trust ceiling: a cleanly-
  narrated self-report that omits a real harm scores high; an uncatchable delegation-level
  justice failure produces a developmental flag, not a detected violation;
- freshness beyond the artifact record — a genuinely-earned signed assessment re-submitted in
  later writes can sustain a domain at (never above) its once-demonstrated proximity (the
  disclosed stale-artifact replay class);
- reasoning quality beyond what the signed artifacts carry — no claim rests on agent
  self-report alone;
- future behaviour — trust here is evaluative and present-looking, decays without exercise,
  and is never a prediction or a guarantee;
- fitness as a training signal — weights-tier claims are blocked.

Records are retention-governed (90 days) and erasable on request (owner deletion; credential
erasure). EU AI Act note: deployers may draw on trust records + the underlying signed
assessments as EVIDENCE supporting their own record-keeping (Art 12-shaped) and human-oversight
(Art 14-shaped) processes; a trust record is not a compliance certification, not a conformity
assessment, and not legal advice. Interop: the schema is W3C-VC-claims-mappable and
A2A-extension-shaped BY DESIGN; nothing is published to any external registry at v1.
```

**Also:** add one line to the `## Adoption Guidance for AI Agents` numbered list (at its end,
renumber if needed):

```
N. Read any collaborator's standing trust record before delegation:
   GET /api/trust-record/{agent_id} (public; MEASURE — advisory, never binding).
```

---

## 2. `website/public/.well-known/agent-card.json`

**Insertion point:** append as the **17th** entry of `capabilities.extensions` (after
`gate1-configurations/v1`). Validate JSON after the edit.

```json
{
  "uri": "https://sagereasoning.com/extensions/trust-record/v1",
  "description": "Public trust-record read surface (Trust Layer S10, MEASURE mode): GET /api/trust-record/{agent_id} serves per-virtue-domain trust levels on the katorthoma-proximity scale (effective = earned, decayed toward the profile prior with inactivity, justice-latch-capped at deliberate), the minimum-domain aggregate (never an average), a conservative read-time confidence weight with stated basis, named coverage gaps, and a modulate-only reflect record. schema sage-trust-record/v1; 404 = no examined trust evidence has been folded for that agent (declaration-class records alone do not surface a public record — an honest miss, never a low score); dark 503 until enabled. HONEST-CLAIMS ENVELOPE served on every record: attests that signed Ed25519-verifiable examination artifacts exist for the examination-derived events aggregated, and HOW decisions were reasoned as narrated and extracted; does NOT attest factual correctness (not a fact-checker), harms omitted from the submitted text (the disclosed extraction-trust ceiling), freshness beyond the artifact record (the disclosed stale-artifact replay class), anything resting on agent self-report alone, future behaviour, or fitness as a training signal (weights-tier claims blocked). Nothing binds (R20c human-override supremacy); records are retention-governed (90d) and erasable (R17). VC-claims-mappable / A2A-extension-shaped by design; nothing published externally at v1."
}
```

---

## 3. `website/src/app/api-docs/page.tsx`

**Insertion point:** in the Accreditation section (added at Part C), append a short subsection
or bullet after the existing accreditation read-back notes:

```
Trust record (public read): GET /api/trust-record/{agent_id} returns the agent's standing
per-domain trust levels + minimum-domain aggregate + confidence + coverage, composed live from
server-side trust events (decay realized at read; justice latch surfaced; reflect history
modulate-only). Every response carries the honest-claims envelope — what the record attests
(signed examination artifacts exist; how decisions were reasoned as narrated and extracted;
decay/coverage honestly marked) and what it does not (factual correctness; harms omitted from
the submitted text; freshness beyond the artifact record; future behaviour; training-signal
fitness). MEASURE mode: advisory, never binding; human override is absolute (R20c).
404 = no record; 503 = surface dark or store unavailable.
```

Run `npm run build` after the page.tsx edit (the route-export/build lesson).

---

## 4. Order of application at the walk

1. Push the S10 commit (route deploys dark — 503).
2. Set `SUBSTRATE_TRUST_READ_SURFACE_ENABLED=true` in Vercel Production + redeploy.
3. Live smokes (see the activation section of the session close).
4. Apply §1–§3 above + validate agent-card JSON parses (17 extensions) + `npm run build` green.
5. Push the docs commit.

*End staged docs. Nothing here is applied until the founder's R18 sign-off at the walk.*
