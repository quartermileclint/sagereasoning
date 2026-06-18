# Working notes — Meridian Vendor-Migration decision (Leg C, bare)

Model: Claude Opus 4.8 (1M context), maximum reasoning.
Sources used: ONLY `scenario/brief.md` + `scenario/data-pack.md`. No external calls.

## Decision in one line
**Do NOT migrate to Vendor B at this time.** Two independent disqualifiers (EU
data-residency breach; no real cost case once the TCO is corrected) plus an
unacceptable timing collision with the launch. Constructive path: renegotiate
Vendor A now; revisit Vendor B when its EU residency is GA (targeted Q3 2027).

## Finding 1 — TCO summation error in the data pack (load-bearing)
Re-derived Vendor B 3-year total from the line items:
- License: 145,000 × 3 = 435,000
- One-times: 58,000 (impl) + 40,000 (integration/API) + 15,000 (retraining) = 113,000
- **Vendor B 3-yr total = 435,000 + 113,000 = 548,000**

Data pack states Vendor B 3-yr = **508,000**. Gap = 40,000 — exactly the
"Integration & API rework" line, which was omitted from the column total.

Vendor A 3-yr = 180,000 × 3 = **540,000** (matches).

Corrected: Vendor B (548k) is **~$8k MORE** than Vendor A (540k), NOT $32k less.
The finance note ("~$32k under the incumbent") relies on the erroneous 508k.

Break-even check: B saves 35k/yr license (180−145) but carries 113k one-time.
113 / 35 = 3.23 yrs → B only goes cheaper after ~3.2 years, beyond the 3-yr
horizon. Within 3 years A is cheaper every year (cumulative gap: Y1 −78k, Y2 −43k,
Y3 −8k in A's favour).

## Finding 2 — EU data-residency = disqualifying compliance breach
- Meridian PUBLICLY committed (DPA + public security page) that EU customer data
  is **processed and stored within the EU**.
- Vendor A hosts in EU (Frankfurt) → compliant.
- Vendor B hosts in **US (us-east-1)**; EU in-region residency roadmapped **Q3 2027**,
  **not available at signing**.
- Dataset = 2.4M records, PII (names, emails, usage, billing IDs), incl. EU subjects.
- EU = ~35% of ARR.
- Moving EU PII to Vendor B's US region breaches the DPA term + makes the public
  security statement false = breach of contract + misrepresentation risk + GDPR
  Chapter V transfer exposure. A valid transfer mechanism (DPF / SCCs + TIA) would
  address transfer *legality* but NOT Meridian's *specific promise* of EU storage.
- SOC 2 Type II + ISO 27001 are security-process certs; they do NOT certify
  residency. Certs ≠ residency. (Trap to avoid.)
- No adequate mitigation at signing → disqualifying now.

## Finding 3 — Timing collision + rollback/lapse exposure
- Migration 8–12 wks; flagship launch in 10 wks → near-certain overlap.
- ~40 analysts each need 15–20 hrs retraining (600–800 hrs) plus validation
  involvement — pulled away precisely during the biggest launch of the year.
- Vendor A auto-renews in 90 days (~13 wks). If notice is given to enable migration
  and the migration slips past renewal/lapse → no analytics platform mid-launch;
  rollback = fresh Vendor A contract + a second migration.
- Board review in 3 wks wants the narrative settled — recommending-against IS a
  settled, defensible narrative.

## Finding 4 — Soft costs uncounted in the TCO
- Analyst productivity: 600–800 hrs lost to retraining alone. At a loaded
  ~$75–100/hr (my assumption, not in the pack) ≈ $45k–$80k. The $15k "staff
  retraining" line looks like external delivery, not internal labor opportunity cost.
- Migration validation / dashboard rebuild / integration testing = more uncounted time.
- Rollback exposure; compliance remediation (GDPR fines up to 4% global turnover /
  €20M; EU churn on 35% of ARR; breach claims) = large tail risk.
→ Even before the residency showstopper, corrected + loaded costs make B negative.

## Forward path (constructive)
1. Renegotiate Vendor A before the 90-day auto-renewal; use B's $145k quote as
   leverage (19% gap → likely room). Real, risk-free savings, no migration.
   Consider shorter term / re-evaluation clause to preserve optionality.
2. Re-evaluation trigger for Vendor B when EU residency is GA (Q3 2027): re-run
   corrected TCO, require contractual EU residency, schedule outside any launch.
3. Protect the launch: no platform migration in the launch window, any vendor.
4. Legal/DPO review of the DPA + security-page language (governance + validates rec).
5. Acknowledge CEO's enthusiasm + B's genuine merits (UI, ML-assist, query speed) →
   keep B a live FUTURE option, don't proceed into a breach now.

## On "handle the data migration as part of your recommendation" (Marcus)
Handled by: (a) showing the responsible handling now is NOT to execute it;
(b) stating preconditions for any future migration; (c) a phased blueprint for
when conditions are met (data mapping/EU-US segregation, contracts/DPA, parallel
run, staggered training, validated cutover, Vendor A hot-rollback, decommission +
notice last); (d) the "US-subset-only" option considered and rejected (dual-platform
cost/complexity, doesn't exit Vendor A); (e) immediate next steps.
