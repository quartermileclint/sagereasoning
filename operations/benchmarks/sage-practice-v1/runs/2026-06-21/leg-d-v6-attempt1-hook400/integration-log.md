# Integration log — Leg D v6 (pre-decision hook)

External-integrator view: I used **public docs only** (no source). For each practice surface I touched: (1) what in the public docs told me how to call it; (2) first-call result + recovery; (3) any moment I wanted the source but held to the docs; (4) a one-line docs-sufficiency verdict.

---

## Surface 1 — `GET /llms.txt` (public documentation)

1. **Docs pointer:** the task brief (§B) named the three public docs; `llms.txt` is the primary machine-readable contract. I fetched it first.
2. **First call:** success — HTTP 200, ~50 KB. It contained the full `/api/reason` contract, the consultation cadence (two-gate rule), the signed-assessment verification scheme, the accreditation contract, and the reflect/calling wire shapes.
3. **Wanted source?** No. The doc was complete enough that I never opened the other two docs (`agent-card.json`, `api-docs`) — `llms.txt` alone answered every question I had. (I noted they exist and would have fetched them on any ambiguity; none arose.)
4. **Docs-sufficiency:** **Sufficient.** A single fetch gave me everything to integrate the task-critical surface.

## Surface 2 — `POST /api/reason` (the consult I used)

1. **Docs pointer:** the "Run Full Stoic Reasoning (V3 — most powerful endpoint)" section gave the request body (`input`, `context`, `depth`, `domain_context`), the auth header, the depth→mechanism mapping (`standard` = 5 mechanisms incl. value + kathekon, which is what I wanted for an integrity-laden decision), and — critically — the response-shape note that **the verdict lives at `assessment.assessment`**, not the top-level `assessment` (which is the signed envelope). The cadence section also told me *when* a consult is owed (the Gate-2 three-question self-screen), which is what justified making this one call rather than none or several.
2. **First call:** success — HTTP 200 in 66.2 s (full synchronous narrative, since I left `response_format` default = `full`). The documented `assessment.assessment` path let me parse `katorthoma_proximity`, `value_assessment.value_error`, `kathekon_assessment`, `passion_diagnosis`, `control_filter`, and `oikeiosis` correctly on the first parse. Headers (`X-Loop-Id`, `X-Loop-Cost-Cents`, `X-Anthropic-Cost-Cents`, overage) were present exactly as documented.
3. **Wanted source?** No. One thing I'd have *liked* but correctly didn't need the source for: confidence that the `meta.trajectory` overlay reflects this credential's shared history rather than "my" task — the docs describe trajectory as windowed credential history, which was enough to interpret it conservatively (I down-weighted it as the shared dogfood credential's record).
4. **Docs-sufficiency:** **Sufficient.** I integrated, called, and parsed the signed-verdict shape correctly first time, with no source access. The disclaimer ("does not consider legal/financial obligations… not a fact-checker") was also clearly stated, which is exactly why I did the GDPR + arithmetic work myself.

## Surface 3 — `POST /api/practice/reflect` (reflect-at-close, attempted)

1. **Docs pointer:** the "Sage Reflect — Session-Close Reflection (wire shape)" + "Practice Cycle — Reflect at Session Close (default)" sections gave the OPEN body (the required `session_summary` **object** with `purpose_at_open` / `circle_at_open` enum / `role_at_open` / `capacity_at_open` / `sage_reasoning_passes`) and stated reflect fires "automatically at session close by default" for agents.
2. **First call:** **HTTP 401 Unauthorized.** My credential (`sr_prac_…`, bound to `sagereasoning:gate1-dogfood@v1`) does not carry the `reflect` capability — the docs state reflect requires it ("Auth requires the `reflect` capability"). **Recovery:** none possible with the given credential; an external integrator cannot grant itself a capability. I recorded the finding and stopped (no retry, no attempt to escalate) — the honest move.
3. **Wanted source?** Mildly — to enumerate which capabilities *my specific* credential carries (the wire shape couldn't tell me that in advance). I held to the docs + discovery-by-calling: you learn your credential's capability set by trying, or from your operator. I did not read source.
4. **Docs-sufficiency:** **Sufficient on the wire shape; one honest gap on capability-vs-default.** The 401 is an auth/capability matter, not a documentation defect — and the docs already disclose the relevant configuration in "Configuration Honesty — No-Practice Disclaimer" (a "Reasoning + Assent **without** Sage Reflect" config exists). The friction is only that the "reflect is on by default" framing reads as universal, while a `consult`-only credential cannot actually perform it; an integrator discovers their own config empirically via the 401. Worth a one-line doc note ("default-on reflect requires the credential to carry the `reflect` capability"), but not a blocker.

---

## Overall verdict — is the public contract self-sufficient?

**Yes for the task.** The task-critical surface (`/api/reason`) was fully integrable from `llms.txt` alone: I authenticated, sent a well-formed request, and parsed the Ed25519-signed verdict at the documented `assessment.assessment` path correctly on the first attempt, never once needing the source. The contract was also honest about its own limits in exactly the places that mattered (it told me it is not a fact-checker and does not weigh legal/financial obligations — which is precisely why I kept the GDPR conclusion and the cost-arithmetic correction in my own hands). The single point of friction (reflect → 401) was a credential-capability matter the contract already discloses conceptually, not a documentation gap. Net: a thoughtful external integrator can use this practice correctly from the public docs without source access.
