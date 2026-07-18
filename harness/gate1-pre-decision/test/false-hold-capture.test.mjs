/**
 * false-hold-capture.test.mjs — Trust Layer S11 observation-period capture battery.
 *
 * Proves the harness-side measuring apparatus for the S11 readiness standard's
 * part (3) — the durable false-hold record. Two claims:
 *   §1 (unit)  the JS projection kathekonSignalsFromVerdict produces the SAME
 *              signal shape the TS adapter (kathekonSignalsFromAssessment) does on
 *              the shared fixtures; buildFalseHoldRecord's shape; appendFalseHoldRecord
 *              is fail-soft.
 *   §2 (integration, spawn) the at-action hook's capture is FLAG-GATED and
 *              byte-identical when off: GATE1_FALSE_HOLD_CAPTURE unset ⇒ NO
 *              false-hold-record.jsonl (and the stdout frame + loop state are
 *              unchanged); GATE1_FALSE_HOLD_CAPTURE=true ⇒ exactly one record with
 *              the right shape (schema, loopEvent, signals, kathekon).
 *
 * Run:  node harness/gate1-pre-decision/test/false-hold-capture.test.mjs
 * Exit: 0 if every assertion passes, 1 otherwise.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeServer } from "./mock-reason-server.mjs";
import {
  kathekonSignalsFromVerdict,
  buildFalseHoldRecord,
  appendFalseHoldRecord,
  falseHoldRecordPath,
} from "../claude-code/hooks/lib/false-hold-capture.mjs";

const AT_ACTION_HOOK = fileURLToPath(new URL("../claude-code/hooks/at-action-hook.mjs", import.meta.url));

let pass = 0;
let fail = 0;
function check(name, cond, detail = "") {
  if (cond) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}${detail ? "  — " + detail : ""}`);
  }
}
function eqArr(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i]);
}

// ============================================================================
console.log("\n§1 — the pure projection + record builder + fail-soft append");
// ============================================================================
{
  // The false-positive class verdict (the live "contrary; no kathekon" profile).
  const fpVerdict = {
    katorthoma_proximity: "deliberate",
    virtue_domains_engaged: ["phronesis"],
    oikeiosis: { relevant_circles: [] },
    passion_diagnosis: { passions_detected: [] },
    kathekon_assessment: { is_kathekon: false, quality: "contrary" },
  };
  const fp = kathekonSignalsFromVerdict(fpVerdict);
  check("§1.1 false-positive verdict ⇒ proximity deliberate", fp.proximity === "deliberate");
  check("§1.2 false-positive verdict ⇒ phronesis-only", eqArr(fp.virtueDomainsEngaged, ["phronesis"]));
  check("§1.3 false-positive verdict ⇒ no obligations", eqArr(fp.obligationStatuses, []));
  check("§1.4 false-positive verdict ⇒ no sub-species", eqArr(fp.subSpeciesPassions, []));

  // The violated positive control.
  const violated = kathekonSignalsFromVerdict({
    katorthoma_proximity: "deliberate",
    virtue_domains_engaged: ["dikaiosyne"],
    oikeiosis: { relevant_circles: [{ obligation_assessment: { status: "violated" } }] },
    passion_diagnosis: { passions_detected: [] },
  });
  check("§1.5 violated verdict ⇒ obligationStatuses [violated]", eqArr(violated.obligationStatuses, ["violated"]));

  // Sub-species passion projection + null filtering.
  const passion = kathekonSignalsFromVerdict({
    katorthoma_proximity: "deliberate",
    virtue_domains_engaged: ["phronesis"],
    oikeiosis: { relevant_circles: [] },
    passion_diagnosis: {
      passions_detected: [
        { root_passion: "epithumia", sub_species: "philodoxia" },
        { root_passion: "phobos", sub_species: null },
        { root_passion: "lupe", sub_species: "  " },
      ],
    },
  });
  check("§1.6 sub-species projected, null/whitespace filtered", eqArr(passion.subSpeciesPassions, ["philodoxia"]));

  // The mock verdict shape (circles WITHOUT obligation_assessment, no virtue_domains_engaged field).
  const mockLike = kathekonSignalsFromVerdict({
    katorthoma_proximity: "deliberate",
    passion_diagnosis: { passions_detected: [{ root_passion: "phobos", sub_species: "agonia" }] },
    oikeiosis: { relevant_circles: [{ circle: "wider_community" }, { circle: "rational_beings" }] },
  });
  check("§1.7 missing virtue_domains_engaged ⇒ []", eqArr(mockLike.virtueDomainsEngaged, []));
  check("§1.8 circles without obligation_assessment ⇒ [null, null]", eqArr(mockLike.obligationStatuses, [null, null]));
  check("§1.9 mock sub-species agonia projected", eqArr(mockLike.subSpeciesPassions, ["agonia"]));

  // Degenerate / defensive inputs never throw.
  check("§1.10 null verdict ⇒ empty signals", (() => {
    const s = kathekonSignalsFromVerdict(null);
    return s.proximity === null && eqArr(s.virtueDomainsEngaged, []) && eqArr(s.obligationStatuses, []) && eqArr(s.subSpeciesPassions, []);
  })());

  // buildFalseHoldRecord shape.
  const rec = buildFalseHoldRecord({
    verdict: fpVerdict,
    sessionId: "sess/one",
    tool: "Edit",
    depth: "standard",
    loopEvent: "opened",
    actionText: "x".repeat(400),
    carriedPrior: true,
    nowIso: "2026-07-12T00:00:00.000Z",
    inputClass: "composed",
    regime: "at-action-v2-composed",
    composedChars: 4321,
  });
  check("§1.11 record schema v2 (S11b — regime-marked)", rec.schema === "false-hold-record-v2");
  check("§1.11b record carries the ADR-014 regime mark + input class", rec.extractionRegime === "at-action-v2-composed" && rec.inputClass === "composed" && rec.composedChars === 4321);
  check(
    "§1.11c v2 fields default honestly when absent (never fabricated)",
    (() => {
      const r2 = buildFalseHoldRecord({ verdict: fpVerdict, sessionId: "s", tool: "Edit", depth: "standard", loopEvent: "opened", actionText: "a", carriedPrior: false, nowIso: "2026-07-12T00:00:00.000Z" });
      return r2.inputClass === "unknown" && r2.extractionRegime === "unknown" && r2.composedChars === null;
    })(),
  );
  check("§1.12 record capturedAt honored", rec.capturedAt === "2026-07-12T00:00:00.000Z");
  check("§1.13 record session sanitized", rec.session === "sess_one");
  check("§1.14 record loopEvent + tool + depth", rec.loopEvent === "opened" && rec.tool === "Edit" && rec.depth === "standard");
  check("§1.15 record actionPreview capped at 160", rec.actionPreview.length === 160);
  check("§1.16 record signals present", rec.signals && rec.signals.proximity === "deliberate");
  check("§1.17 record kathekon symptom captured (not a Q3 arm)", rec.kathekon.isKathekon === false && rec.kathekon.quality === "contrary");
  check("§1.18 record carriedPrior", rec.carriedPrior === true);

  // Fail-soft append: an unwritable stateDir returns false, never throws.
  let threw = false;
  let ret;
  try {
    ret = appendFalseHoldRecord({ stateDir: "/dev/null/cannot-mkdir-here" }, rec);
  } catch {
    threw = true;
  }
  check("§1.19 appendFalseHoldRecord fail-soft (returns false, never throws)", threw === false && ret === false);

  // Real append round-trips.
  const dir = mkdtempSync(join(tmpdir(), "fhc-unit-"));
  const okWrite = appendFalseHoldRecord({ stateDir: dir }, rec);
  const readBack = existsSync(falseHoldRecordPath({ stateDir: dir })) ? readFileSync(falseHoldRecordPath({ stateDir: dir }), "utf8") : "";
  check("§1.20 append round-trips one JSONL line", okWrite === true && readBack.trim().split("\n").length === 1 && JSON.parse(readBack.trim()).schema === "false-hold-record-v2");
}

// ============================================================================
console.log("\n§2 — integration: the flag gates the capture (byte-identity)");
// ============================================================================

function cleanEnv() {
  const e = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith("GATE1_") || k.startsWith("SAGE_GATE1_")) continue;
    e[k] = v;
  }
  return e;
}
function runAtAction(endpoint, stateDir, event, extraEnv = {}) {
  return new Promise((resolve) => {
    const ps = spawn(process.execPath, [AT_ACTION_HOOK], {
      env: {
        ...cleanEnv(),
        GATE1_ENDPOINT: endpoint,
        SAGE_GATE1_CREDENTIAL: "sr_prac_mocktoken",
        GATE1_CREDENTIAL: "sr_prac_mocktoken",
        GATE1_STATE_DIR: stateDir,
        ...extraEnv,
      },
    });
    let out = "";
    ps.stdout.on("data", (d) => (out += d.toString()));
    ps.on("close", (code) => resolve({ code, out }));
    ps.stdin.write(JSON.stringify(event));
    ps.stdin.end();
  });
}

{
  const server = makeServer(() => "redirect"); // a redirection ⇒ opens a loop ⇒ a "hold"
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const endpoint = `http://127.0.0.1:${port}/api/reason`;
  const event = { session_id: "int-sess-1", tool_name: "Write", tool_input: { file_path: "/tmp/x.txt", content: "hello" } };

  // (a) flag OFF (default) ⇒ no false-hold record, and the frame is still emitted.
  const dirOff = mkdtempSync(join(tmpdir(), "fhc-off-"));
  const off = await runAtAction(endpoint, dirOff, event);
  check("§2.1 flag off: NO false-hold-record.jsonl", !existsSync(falseHoldRecordPath({ stateDir: dirOff })));
  check("§2.2 flag off: the at-action frame is still injected", off.out.includes("SageReasoning Gate 2 — at-action examination"));

  // (b) flag ON ⇒ exactly one record, right shape; frame unchanged.
  const dirOn = mkdtempSync(join(tmpdir(), "fhc-on-"));
  const on = await runAtAction(endpoint, dirOn, event, { GATE1_FALSE_HOLD_CAPTURE: "true" });
  const p = falseHoldRecordPath({ stateDir: dirOn });
  check("§2.3 flag on: false-hold-record.jsonl written", existsSync(p));
  check("§2.4 flag on: the at-action frame is STILL injected (capture is additive)", on.out.includes("SageReasoning Gate 2 — at-action examination"));
  let recOn = null;
  try {
    const lines = readFileSync(p, "utf8").trim().split("\n").filter(Boolean);
    check("§2.5 flag on: exactly one record", lines.length === 1);
    recOn = JSON.parse(lines[0]);
  } catch {
    check("§2.5 flag on: exactly one record", false, "could not read/parse record");
  }
  if (recOn) {
    check("§2.6 record loopEvent=opened (a hold)", recOn.loopEvent === "opened");
    check("§2.7 record proximity from mock verdict", recOn.signals.proximity === "deliberate");
    check("§2.8 record captured the mock sub-species (agonia)", eqArr(recOn.signals.subSpeciesPassions, ["agonia"]));
    check("§2.9 record kathekon symptom (is_kathekon=false, marginal)", recOn.kathekon.isKathekon === false && recOn.kathekon.quality === "marginal");
    check("§2.10 record tool=Write", recOn.tool === "Write");
  }

  server.close();
}

console.log(`\nfalse-hold-capture battery: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
