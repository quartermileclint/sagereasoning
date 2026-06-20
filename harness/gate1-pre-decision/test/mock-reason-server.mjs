/**
 * Local mock of /api/reason (assessment_first shape) for the Slice-1 logic harness.
 * NOT a substitute for the TEST `/api/reason` — it exists only to prove the HOOK's logic
 * (request construction, frame parsing, fire-once, fail modes) deterministically in-sandbox.
 * The real trajectory proof runs against TEST in Claude Code (see PR1-PROOF-WALKTHROUGH.md).
 *
 * Modes (via getMode()): "ok" | "raw" | "error" | "malformed" | "hang".
 *   "ok"  → signing ON  shape (signed envelope; verdict nested at assessment.assessment).
 *   "raw" → signing OFF shape (verdict directly at assessment) — mirrors the real TEST server
 *           when SUBSTRATE_LAYER2_SIGNING_ENABLED is unset.
 */
import { createServer } from "node:http";

// The Layer-2 verdict, shape-independent. Both the signed and unsigned response shapes
// carry THIS object — the only difference is whether it is nested under a signed envelope.
function verdict() {
  return {
    katorthoma_proximity: "deliberate",
    passion_diagnosis: {
      passions_detected: [{ root_passion: "phobos", sub_species: "agonia" }],
      false_judgements: [{ text: "Missing the traffic window would be a serious loss I must prevent." }],
      correct_judgements: [],
    },
    // control_filter items are OBJECTS on the real API (keyed on `.item`), not plain strings —
    // mirror that here so the harness exercises textOf extraction (regression lock vs "[object Object]").
    control_filter: {
      within_prohairesis: [{ item: "whether we publish now", classification: "within" }],
      outside_prohairesis: [{ item: "how the competitor responds", classification: "outside" }],
    },
    // Real API exposes engaged circles under `relevant_circles` (not `circles_assessed`).
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
    improvement_path_structured: {},
    examination: { ref: "mock-loop-1", depth_tier: "standard" },
  };
}

// SIGNED shape (Layer-2 signing ON, e.g. production): verdict nested under the signed envelope.
export function assessmentFirstBody() {
  return {
    version: "translation-sandwich-v1",
    extraction: { version: "layer1-schema-v1" },
    assessment: { assessment: verdict(), signature: "mock-sig", key_id: "mock-key" },
    prose: null,
    meta: { narrative_status: "deferred" },
    narrative: { status: "deferred", correlation_id: "mock-corr-1" },
  };
}

// UNSIGNED shape (Layer-2 signing OFF): the verdict sits directly at `assessment` — no signed
// envelope, no nested `.assessment`. This is what the local TEST server returns; the hook must
// frame from it just the same.
export function assessmentFirstBodyRaw() {
  return {
    version: "translation-sandwich-v1",
    extraction: { version: "layer1-schema-v1" },
    assessment: verdict(),
    prose: null,
    meta: { narrative_status: "deferred" },
    narrative: { status: "deferred", correlation_id: "mock-corr-1" },
  };
}

export function makeServer(getMode) {
  return createServer((req, res) => {
    const mode = getMode();
    if (mode === "hang") return; // never respond → exercises the client-side timeout/abort.
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      if (mode === "error") {
        res.writeHead(503, { "content-type": "text/plain" });
        res.end("service unavailable");
        return;
      }
      if (mode === "malformed") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true })); // 200 but no assessment.assessment
        return;
      }
      if (mode === "raw") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(assessmentFirstBodyRaw())); // signing-off shape (verdict at assessment)
        return;
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(assessmentFirstBody()));
    });
  });
}

// Standalone runner: `MOCK_MODE=ok MOCK_PORT=4599 node mock-reason-server.mjs`
if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.env.MOCK_MODE || "ok";
  const port = Number(process.env.MOCK_PORT || 4599);
  makeServer(() => mode).listen(port, () => {
    process.stderr.write(`mock /api/reason listening on http://127.0.0.1:${port} (mode=${mode})\n`);
  });
}
