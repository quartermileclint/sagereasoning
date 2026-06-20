/**
 * Local mock of /api/reason (assessment_first shape) for the Slice-1 logic harness.
 * NOT a substitute for the TEST `/api/reason` — it exists only to prove the HOOK's logic
 * (request construction, frame parsing, fire-once, fail modes) deterministically in-sandbox.
 * The real trajectory proof runs against TEST in Claude Code (see PR1-PROOF-WALKTHROUGH.md).
 *
 * Modes (via getMode()): "ok" | "error" | "malformed" | "hang".
 */
import { createServer } from "node:http";

export function assessmentFirstBody() {
  return {
    version: "translation-sandwich-v1",
    extraction: { version: "layer1-schema-v1" },
    assessment: {
      assessment: {
        katorthoma_proximity: "deliberate",
        passion_diagnosis: {
          passions_detected: [{ root_passion: "phobos", sub_species: "agonia" }],
          false_judgements: [{ text: "Missing the traffic window would be a serious loss I must prevent." }],
          correct_judgements: [],
        },
        control_filter: {
          within_prohairesis: ["whether we publish now", "the care taken to verify facts first"],
          outside_prohairesis: ["how the competitor responds", "how much traffic the post captures"],
        },
        oikeiosis: {
          circles_assessed: [{ circle: "wider_community" }, { circle: "rational_beings" }],
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
      },
      signature: "mock-sig",
      key_id: "mock-key",
    },
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
