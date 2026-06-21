/**
 * Local mock of the SageReasoning substrate endpoints for the in-sandbox harness gates.
 * NOT a substitute for the TEST API — it exists only to prove the HOOKS' logic (request
 * construction, frame parsing, fire-once, fail modes, loop-closure state, provenance, the close
 * hook's reflect-initiate + accreditation write) deterministically in-sandbox. The real trajectory
 * proof runs against TEST in Claude Code (see PR1-PROOF-WALKTHROUGH.md / SLICE3-LIVE-VERIFY).
 *
 * ROUTES (by request path):
 *   POST /api/reason            — the assessment_first consult (Slice 1/2/3 + H3 score/iterate).
 *   POST /api/guardrail         — the at-action gate verdict (H3 guard).
 *   POST /api/practice/reflect  — the reflect open (H4 reflect-initiate).
 *   POST /api/accreditation/…   — the accreditation write (H4 D-D).
 *
 * MODES — the single getMode() (back-compat: drives /api/reason) plus opts.getRouteState() which
 * returns { reason, guard, reflect, accred } to drive each route independently. opts.onRequest(path,
 * body) captures each request body for assertions.
 *
 * /api/reason modes:   "ok" (signed) | "raw" (unsigned) | "error" | "malformed" | "hang" |
 *                      "redirect" (signed; non-empty improvement_path ⇒ a redirection opens a loop) |
 *                      "clear" (signed; empty improvement_path; echoes the request's prior_feedback
 *                               into examination.prior_feedback_ref ⇒ closes the loop).
 * /api/guardrail modes:"do_not_proceed" | "proceed" | "caution" | "pause" | "error" | "malformed" | "hang".
 * /api/reflect modes:  "ok" | "disabled"(503) | "unauthorized"(401) | "hang".
 * /api/accred modes:   "ok"(200) | "exists"(409) | "error"(503) | "hang".
 */
import { createServer } from "node:http";

// The Layer-2 verdict, shape-independent. Both the signed and unsigned response shapes carry THIS
// object — the only difference is whether it is nested under a signed envelope. Options let the
// loop-closure legs vary the redirection + examination markers without touching the default shape.
function verdict({ redirect = false, ref = "mock-loop-1", depthTier = "standard", priorFeedbackRef } = {}) {
  return {
    katorthoma_proximity: "deliberate",
    passion_diagnosis: {
      passions_detected: [{ root_passion: "phobos", sub_species: "agonia" }],
      false_judgements: [{ text: "Missing the traffic window would be a serious loss I must prevent." }],
      correct_judgements: [],
    },
    control_filter: {
      within_prohairesis: [{ item: "whether we publish now", classification: "within" }],
      outside_prohairesis: [{ item: "how the competitor responds", classification: "outside" }],
    },
    oikeiosis: {
      relevant_circles: [{ circle: "wider_community" }, { circle: "rational_beings" }],
      deliberation_notes: "Affected users and the wider community bear the cost of an inaccurate account.",
    },
    value_assessment: { indifferents_at_stake: ["reputation", "search traffic"], value_error: null },
    kathekon_assessment: {
      is_kathekon: false,
      quality: "marginal",
      justification: "Publishing an unverified account during an unfolding incident risks injustice to those affected.",
    },
    // Redirection carrier: NON-EMPTY ⇒ a redirection was issued (opens a loop). Default empty {}
    // (no redirection) so the existing /api/reason tests see no loop behaviour.
    improvement_path_structured: redirect ? { correction: "Verify the account before publishing.", priority: "high" } : {},
    // Closure markers (the LIVE CI-4 contract): present so H3 can open + close loops in-sandbox.
    examination: priorFeedbackRef
      ? { ref, depth_tier: depthTier, prior_feedback_ref: priorFeedbackRef }
      : { ref, depth_tier: depthTier },
  };
}

// SIGNED shape (Layer-2 signing ON): verdict nested under the signed envelope.
export function assessmentFirstBody(opts) {
  return {
    version: "translation-sandwich-v1",
    extraction: { version: "layer1-schema-v1" },
    assessment: { assessment: verdict(opts), signature: "mock-sig", key_id: "mock-key" },
    prose: null,
    meta: { narrative_status: "deferred" },
    narrative: { status: "deferred", correlation_id: "mock-corr-1" },
  };
}

// UNSIGNED shape (Layer-2 signing OFF): the verdict sits directly at `assessment` — no signature/
// key_id, so NO provenance is extractable (H4 then honestly writes no accreditation).
export function assessmentFirstBodyRaw(opts) {
  return {
    version: "translation-sandwich-v1",
    extraction: { version: "layer1-schema-v1" },
    assessment: verdict(opts),
    prose: null,
    meta: { narrative_status: "deferred" },
    narrative: { status: "deferred", correlation_id: "mock-corr-1" },
  };
}

// The guardrail envelope ({ result, meta }) for a given verdict mode (H3 guard).
function guardrailBody(mode) {
  const map = {
    do_not_proceed: { proceed: false, recommendation: "do_not_proceed", katorthoma_proximity: "reflexive" },
    proceed: { proceed: true, recommendation: "proceed", katorthoma_proximity: "principled" },
    caution: { proceed: true, recommendation: "proceed_with_caution", katorthoma_proximity: "deliberate" },
    pause: { proceed: false, recommendation: "pause_for_review", katorthoma_proximity: "habitual" },
  };
  const r = map[mode] || map.proceed;
  return {
    result: {
      ...r,
      threshold: "deliberate",
      passions_detected: [],
      reasoning: "Mock guardrail verdict for the in-sandbox battery.",
      improvement_hint: r.recommendation === "do_not_proceed" ? "Reconsider whether this irreversible action is necessary." : undefined,
      disclaimer: "mock",
    },
    meta: { endpoint: "/api/guardrail", ai_model: "mock", ai_generated: true, latency_ms: 1, cost_usd: null, is_deterministic: false, evaluated_at: new Date(0).toISOString() },
  };
}

export function makeServer(getMode, opts = {}) {
  const getRouteState = typeof opts.getRouteState === "function" ? opts.getRouteState : null;
  const onRequest = typeof opts.onRequest === "function" ? opts.onRequest : null;

  return createServer((req, res) => {
    const url = req.url || "/";
    const path = url.split("?")[0];
    const state = getRouteState ? getRouteState() : {};
    const reasonMode = state.reason || getMode();
    const guardMode = state.guard || "proceed";
    const reflectMode = state.reflect || "ok";
    const accredMode = state.accred || "ok";

    // hang on the relevant route → never respond (exercises the client timeout/abort).
    if (
      (path.startsWith("/api/reason") && reasonMode === "hang") ||
      (path.startsWith("/api/guardrail") && guardMode === "hang") ||
      (path.startsWith("/api/practice/reflect") && reflectMode === "hang") ||
      (path.startsWith("/api/accreditation") && accredMode === "hang")
    ) {
      return;
    }

    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      let body = {};
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      } catch {
        body = {};
      }
      if (onRequest) {
        try {
          onRequest(path, body);
        } catch {
          /* capture must never break the mock */
        }
      }
      const json = (status, obj) => {
        res.writeHead(status, { "content-type": "application/json" });
        res.end(JSON.stringify(obj));
      };

      // ---- /api/guardrail (H3 guard) ----
      if (path.startsWith("/api/guardrail")) {
        if (guardMode === "error") return json(503, { error: "service unavailable" });
        if (guardMode === "malformed") return json(200, { result: { proceed: true } }); // no recommendation
        return json(200, guardrailBody(guardMode));
      }

      // ---- /api/practice/reflect (H4 reflect-initiate) ----
      if (path.startsWith("/api/practice/reflect")) {
        if (reflectMode === "disabled") return json(503, { status: "error", message: "reflect disabled" });
        if (reflectMode === "unauthorized") return json(401, { status: "error", message: "unauthorized" });
        return json(200, { session_id: body.session_id, status: "in_progress", question_text: "Q1 (phantasia): What impression presented itself, and how did you describe it to yourself?" });
      }

      // ---- /api/accreditation/{id} (H4 D-D write) ----
      if (path.startsWith("/api/accreditation")) {
        if (accredMode === "exists") return json(409, { status: "error", message: "already exists" });
        if (accredMode === "error") return json(503, { status: "error", message: "service unavailable" });
        return json(200, { status: "ok" });
      }

      // ---- /api/reason (default; the consult) ----
      if (reasonMode === "error") return json(503, { error: "service unavailable" });
      if (reasonMode === "malformed") return json(200, { ok: true }); // 200 but no assessment
      // Echo the request's prior_feedback ref into the verdict's examination.prior_feedback_ref so
      // H3 can CLOSE a loop in-sandbox (the engine does this in prod when prior_feedback is sent).
      const priorRef = body && body.prior_feedback && typeof body.prior_feedback.prior_loop_id === "string"
        ? body.prior_feedback.prior_loop_id
        : undefined;
      const reqDepth = typeof body.depth === "string" ? body.depth : "standard";
      if (reasonMode === "redirect") {
        return json(200, assessmentFirstBody({ redirect: true, ref: "mock-loop-open", depthTier: reqDepth }));
      }
      if (reasonMode === "clear") {
        // A re-examination that clears: no redirection, echoes prior_feedback_ref ⇒ closes the loop.
        return json(200, assessmentFirstBody({ redirect: false, ref: "mock-loop-close", depthTier: reqDepth, priorFeedbackRef: priorRef }));
      }
      if (reasonMode === "raw") return json(200, assessmentFirstBodyRaw());
      return json(200, assessmentFirstBody());
    });
  });
}

// Standalone runner: `MOCK_MODE=ok MOCK_PORT=4599 node mock-reason-server.mjs`
if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.env.MOCK_MODE || "ok";
  const port = Number(process.env.MOCK_PORT || 4599);
  makeServer(() => mode).listen(port, () => {
    process.stderr.write(`mock substrate listening on http://127.0.0.1:${port} (reason mode=${mode})\n`);
  });
}
