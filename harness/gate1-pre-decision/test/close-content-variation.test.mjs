/**
 * IW-7 opening 3 (both phases) — the close-hook content-variation battery.
 *
 * Governing design: `operations/reflections-examination-2026-08/2026-08-25-iw7-three-openings-scope.md`
 * §3, `operations/reflections-examination-2026-08/2026-08-25-signal-quality-gap-scope.md`, and the
 * two mentor rulings (verbatim files of the same date). Proves:
 *
 *   §1 (unit)   consult-signal.mjs's pure classification/confidence functions, and
 *               close-signal-state.mjs's read/write/supersession logic, directly (no hook spawn).
 *   §2 (integration, spawn) the two hooks end-to-end via the mock server:
 *     - flag-off byte-identity: NO state files are ever written, and the close turn's content is
 *       BYTE-IDENTICAL to the pre-IW-7 invariant string, even when a guard CAUTION and a
 *       high-confidence consult signal both occur in the same session.
 *     - phase one fires correctly on a genuine guard CAUTION and not otherwise.
 *     - phase two's confidence computation on both a rich-elsewhere and an all-empty extraction.
 *     - the low-confidence path produces content GENUINELY IDENTICAL to the no-signal path (not a
 *       silently-degraded vague version of the high-confidence content) — the ruling's constraint.
 *     - precedence: a guard caution is named over a consult signal when both occurred.
 *     - strongest-wins: a later low-confidence consult verdict does not downgrade an earlier
 *       high-confidence one recorded the same session.
 *
 * Run:  node harness/gate1-pre-decision/test/close-content-variation.test.mjs
 * Exit: 0 if every assertion passes, 1 otherwise.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeServer } from "./mock-reason-server.mjs";
import {
  classifyConsultSignal,
  computeKathekonConfidence,
  candidateSupersedes,
  confidenceRank,
} from "../claude-code/hooks/lib/consult-signal.mjs";
import {
  readGuardCautionSignal,
  recordGuardCautionSignal,
  readConsultSignal,
  recordConsultSignal,
  guardCautionSignalPath,
  consultSignalPath,
} from "../claude-code/hooks/lib/close-signal-state.mjs";

const AT_ACTION_HOOK = fileURLToPath(new URL("../claude-code/hooks/at-action-hook.mjs", import.meta.url));
const CLOSE_HOOK = fileURLToPath(new URL("../claude-code/hooks/close-hook.mjs", import.meta.url));

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

// The exact base string — kept in lockstep with close-hook.mjs's own BASE_REFLECT_INVITATION so a
// drift between the two is caught as a test failure, not silently tolerated.
const BASE_REFLECT_INVITATION =
  "[SageReasoning — Sage Reflect: review your reasoning this session]\n" +
  "Before this session closes, take one turn to review your own reasoning from the work just " +
  "completed: the impressions you formed and how you described them to yourself, where you gave or " +
  "withheld assent, the actions you chose, what (if anything) you would judge differently, and " +
  "whether the work served its purpose. This is a review of your own reasoning, within the scope of " +
  "this task — there is nothing to call and nothing to send.";

// ============================================================================
console.log("\n§1 — pure functions (no hook spawn)");
// ============================================================================

check(
  "classifyConsultSignal: proximity reflexive fires, basis proximity, confidence high",
  (() => {
    const c = classifyConsultSignal({ katorthoma_proximity: "reflexive" });
    return c.fires && c.basis === "proximity" && c.confidence === "high" && c.proximity === "reflexive";
  })(),
);
check(
  "classifyConsultSignal: proximity habitual fires the same way",
  classifyConsultSignal({ katorthoma_proximity: "habitual" }).fires === true,
);
check(
  "classifyConsultSignal: proximity deliberate/principled/sage_like does NOT fire",
  ["deliberate", "principled", "sage_like"].every((p) => classifyConsultSignal({ katorthoma_proximity: p }).fires === false),
);
check(
  "classifyConsultSignal: kathekon contrary fires, basis kathekon, confidence left for the caller",
  (() => {
    const c = classifyConsultSignal({ katorthoma_proximity: "deliberate", kathekon_assessment: { quality: "contrary" } });
    return c.fires && c.basis === "kathekon" && c.confidence === null && c.quality === "contrary";
  })(),
);
check(
  "classifyConsultSignal: kathekon moderate/marginal/strong does NOT fire (only 'contrary')",
  ["moderate", "marginal", "strong"].every(
    (q) => classifyConsultSignal({ katorthoma_proximity: "deliberate", kathekon_assessment: { quality: q } }).fires === false,
  ),
);
check(
  "classifyConsultSignal: neither condition present → fires:false",
  classifyConsultSignal({ katorthoma_proximity: "deliberate", kathekon_assessment: { quality: "moderate" } }).fires === false,
);
check("classifyConsultSignal: malformed/empty verdict never throws, fires:false", classifyConsultSignal(null).fires === false);
check(
  "classifyConsultSignal: proximity takes precedence over an also-present contrary quality (basis proximity, not kathekon)",
  classifyConsultSignal({ katorthoma_proximity: "reflexive", kathekon_assessment: { quality: "contrary" } }).basis === "proximity",
);

check(
  "computeKathekonConfidence: all four proxy arrays empty → low",
  computeKathekonConfidence({
    passions_present: [],
    oikeiosis_circles_engaged: [],
    value_categories_at_stake: [],
    causal_stage_evidence: [],
  }) === "low",
);
check(
  "computeKathekonConfidence: exactly one proxy array populated → high",
  computeKathekonConfidence({
    passions_present: [{ root_passion: "phobos" }],
    oikeiosis_circles_engaged: [],
    value_categories_at_stake: [],
    causal_stage_evidence: [],
  }) === "high",
);
check(
  "computeKathekonConfidence: a DIFFERENT array populated (oikeiosis, not passions) still → high",
  computeKathekonConfidence({
    passions_present: [],
    oikeiosis_circles_engaged: [{ circle: "household" }],
    value_categories_at_stake: [],
    causal_stage_evidence: [],
  }) === "high",
);
check("computeKathekonConfidence: null/missing extraction → low (conservative)", computeKathekonConfidence(null) === "low");
check("computeKathekonConfidence: non-object extraction → low, never throws", computeKathekonConfidence("not an object") === "low");
check(
  "computeKathekonConfidence: only kathekon_factors populated (not one of the four proxy arrays) → low",
  computeKathekonConfidence({ kathekon_factors: [{ item: "x" }], passions_present: [], oikeiosis_circles_engaged: [], value_categories_at_stake: [], causal_stage_evidence: [] }) === "low",
);

check("confidenceRank: high > low > null", confidenceRank("high") > confidenceRank("low") && confidenceRank("low") > confidenceRank(null));
check("candidateSupersedes: nothing recorded yet → any candidate supersedes", candidateSupersedes(null, { confidence: "low" }) === true);
check(
  "candidateSupersedes: a low candidate does NOT supersede an existing high (strongest-wins, never downgrades)",
  candidateSupersedes({ confidence: "high" }, { confidence: "low" }) === false,
);
check(
  "candidateSupersedes: a high candidate DOES supersede an existing low",
  candidateSupersedes({ confidence: "low" }, { confidence: "high" }) === true,
);
check(
  "candidateSupersedes: equal confidence does not re-supersede (stable — no write churn)",
  candidateSupersedes({ confidence: "high" }, { confidence: "high" }) === false,
);

// close-signal-state.mjs, direct (a minimal cfg — just the stateDir field these fns read).
{
  const stateDir = mkdtempSync(join(tmpdir(), "close-signal-state-unit-"));
  const cfg = { stateDir };

  check("readGuardCautionSignal: nothing recorded → null", readGuardCautionSignal(cfg, "unit-a") === null);
  const wrote1 = recordGuardCautionSignal(cfg, "unit-a", { tool: "Bash", proximity: "habitual" });
  check("recordGuardCautionSignal: first write returns true", wrote1 === true);
  check("recordGuardCautionSignal: the file actually exists", existsSync(guardCautionSignalPath(cfg, "unit-a")));
  const sig1 = readGuardCautionSignal(cfg, "unit-a");
  check("readGuardCautionSignal: reads back tool + proximity", sig1?.tool === "Bash" && sig1?.proximity === "habitual");
  const wrote2 = recordGuardCautionSignal(cfg, "unit-a", { tool: "Write", proximity: "reflexive" });
  check("recordGuardCautionSignal: first-wins — a second call for the same session returns false", wrote2 === false);
  check("recordGuardCautionSignal: first-wins — the recorded tool is still the FIRST one", readGuardCautionSignal(cfg, "unit-a")?.tool === "Bash");

  check("readConsultSignal: nothing recorded → null", readConsultSignal(cfg, "unit-b") === null);
  const cw1 = recordConsultSignal(cfg, "unit-b", { basis: "kathekon", confidence: "low", quality: "contrary", tool: "Edit" });
  check("recordConsultSignal: first write (nothing existing) returns true", cw1 === true);
  check("recordConsultSignal: the file actually exists", existsSync(consultSignalPath(cfg, "unit-b")));
  const cw2 = recordConsultSignal(cfg, "unit-b", { basis: "kathekon", confidence: "high", quality: "contrary", tool: "Edit" });
  check("recordConsultSignal: a stronger candidate DOES supersede (strongest-wins)", cw2 === true);
  check("readConsultSignal: reads back the STRONGER (high) confidence", readConsultSignal(cfg, "unit-b")?.confidence === "high");
  const cwLow = recordConsultSignal(cfg, "unit-b", { basis: "kathekon", confidence: "low", quality: "contrary", tool: "Edit" });
  check("recordConsultSignal: a LOW candidate after a HIGH one is recorded returns false (does not overwrite)", cwLow === false);
  check("readConsultSignal: confidence is still high after the failed low overwrite attempt", readConsultSignal(cfg, "unit-b")?.confidence === "high");

  // Fail-soft: an unwritable stateDir must never throw, and reads degrade to null.
  const badCfg = { stateDir: "/dev/null/not-a-real-dir" };
  check("recordGuardCautionSignal: unwritable stateDir → false, never throws", recordGuardCautionSignal(badCfg, "unit-c", {}) === false);
  check("readGuardCautionSignal: unwritable/missing stateDir → null, never throws", readGuardCautionSignal(badCfg, "unit-c") === null);
  check("recordConsultSignal: unwritable stateDir → false, never throws", recordConsultSignal(badCfg, "unit-c", { confidence: "high" }) === false);

  // PR19 review fold (LOW-1): a genuinely CORRUPTED state file — not merely an unwritable
  // directory — must also degrade to null, never throw or crash the close hook.
  const corruptCfg = { stateDir: mkdtempSync(join(tmpdir(), "close-signal-state-corrupt-")) };
  mkdirSync(corruptCfg.stateDir, { recursive: true });
  writeFileSync(guardCautionSignalPath(corruptCfg, "unit-d"), "{not valid json at all");
  writeFileSync(consultSignalPath(corruptCfg, "unit-d"), "");
  check("readGuardCautionSignal: corrupted (malformed) JSON on disk → null, never throws", readGuardCautionSignal(corruptCfg, "unit-d") === null);
  check("readConsultSignal: empty file on disk → null, never throws", readConsultSignal(corruptCfg, "unit-d") === null);
}

// ============================================================================
console.log("\n§2 — integration (hook spawn, via the mock server)");
// ============================================================================

let mode = "ok";
const routeState = { reason: null, guard: "proceed", reflect: "ok", accred: "ok" };
const server = makeServer(() => mode, {
  getRouteState: () => ({ reason: routeState.reason || mode, guard: routeState.guard, reflect: routeState.reflect, accred: routeState.accred }),
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;
const endpoint = `http://127.0.0.1:${port}/api/reason`;
const stateDir = mkdtempSync(join(tmpdir(), "close-content-variation-battery-"));

function cleanEnv() {
  const e = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith("GATE1_") || k.startsWith("SAGE_GATE1_")) continue;
    e[k] = v;
  }
  return e;
}
function runHook(hookPath, event, extraEnv = {}) {
  return new Promise((resolve) => {
    const ps = spawn(process.execPath, [hookPath], {
      env: {
        ...cleanEnv(),
        GATE1_ENDPOINT: endpoint,
        SAGE_GATE1_CREDENTIAL: "sr_prac_mocktoken",
        GATE1_CREDENTIAL: "sr_prac_mocktoken",
        GATE1_STATE_DIR: stateDir,
        SAGE_GATE1_DISCERNMENT_CONFIG: join(stateDir, "no-such-discernment.config.json"),
        ...extraEnv,
      },
    });
    let out = "";
    let err = "";
    ps.stdout.on("data", (d) => (out += d));
    ps.stderr.on("data", (d) => (err += d));
    ps.on("close", (code) => resolve({ code, out, err }));
    ps.stdin.write(JSON.stringify(event));
    ps.stdin.end();
  });
}
function parsed(out) {
  try {
    return JSON.parse(out);
  } catch {
    return null;
  }
}
const ptEvent = (sid, tool, toolInput) => ({ session_id: sid, hook_event_name: "PreToolUse", tool_name: tool, tool_input: toolInput });
const stopEvent = (sid, extra = {}) => ({ session_id: sid, hook_event_name: "Stop", ...extra });
const decisionReasonOf = (out) => parsed(out)?.reason || "";
const additionalContextOf = (out) => parsed(out)?.hookSpecificOutput?.additionalContext || "";
// The close hook's content lands in `decision.reason` (reflectInitiateMode 'block', the default) — read
// whichever of the two the mode produces, so a future mode-default change doesn't silently blind this test.
const closeTextOf = (out) => decisionReasonOf(out) || additionalContextOf(out);

async function closeTextFor(sessionId, extraEnv = {}) {
  const r = await runHook(CLOSE_HOOK, stopEvent(sessionId), { SAGE_GATE1_ACCRED_CREDENTIAL: "sr_prac_accredmock", SAGE_GATE1_AGENT_ID: "sagereasoning:loop@v1", ...extraEnv });
  return closeTextOf(r.out);
}

const FLAG_ON = { GATE1_CLOSE_CONTENT_VARIATION_ENABLED: "true" };

// --- flag-off byte-identity -------------------------------------------------
{
  routeState.guard = "caution";
  routeState.reason = "kathekon-contrary-rich"; // would be a HIGH-confidence phase-two signal if the flag were on
  const sid = "cc-flagoff";
  // Trigger BOTH a guard caution and a qualifying consult in this session, WITHOUT the flag.
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Bash", { command: "rm -rf /repo/dist" })); // guard-set Bash, caution
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Edit", { file_path: "/repo/x.ts", new_string: "y" })); // consult
  check("flag-off: no guard-caution state file was written", !existsSync(guardCautionSignalPath({ stateDir }, sid)));
  check("flag-off: no consult-signal state file was written", !existsSync(consultSignalPath({ stateDir }, sid)));
  const text = await closeTextFor(sid); // flag NOT passed ⇒ off
  check("flag-off: the close turn is BYTE-IDENTICAL to the invariant base string", text === BASE_REFLECT_INVITATION, `got: ${text.slice(0, 120)}`);
}

// --- no-signal session (flag ON, nothing happened) --------------------------
{
  routeState.guard = "proceed";
  routeState.reason = "ok"; // the default fixture: deliberate proximity, marginal quality — neither trigger
  const sid = "cc-nosignal";
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Edit", { file_path: "/repo/y.ts", new_string: "y" }));
  const text = await closeTextFor(sid, FLAG_ON);
  check("no-signal session, flag ON: close turn still equals the exact base string", text === BASE_REFLECT_INVITATION);
}

// --- phase one: guard CAUTION -----------------------------------------------
{
  routeState.guard = "caution";
  const sid = "cc-guard";
  const r = await runHook(AT_ACTION_HOOK, ptEvent(sid, "Bash", { command: "rm -rf /repo/dist" }), FLAG_ON);
  check("phase one: the guard caution ALSO still allows the tool (content variation doesn't change the verdict)", parsed(r.out)?.hookSpecificOutput?.permissionDecision === undefined);
  check("phase one: guard-caution signal state was recorded", readGuardCautionSignal({ stateDir }, sid)?.tool === "Bash");
  const text = await closeTextFor(sid, FLAG_ON);
  check("phase one: close turn STARTS with the unchanged base string (interpolated, not replaced)", text.startsWith(BASE_REFLECT_INVITATION));
  check("phase one: close turn names the guard caution", text.includes("recorded a caution from the at-action guardrail"));
  check("phase one: close turn names the tool (Bash)", text.includes("Bash"));
  check("phase one: close turn asks the reflection-address question", text.includes("Did your closing reflection address it"));
}

// --- phase one: a CLEAN proceed does NOT fire the variation ------------------
{
  routeState.guard = "proceed";
  const sid = "cc-guard-clean";
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Bash", { command: "rm -rf /repo/other" }), FLAG_ON);
  check("phase one negative: a clean proceed writes NO guard-caution signal", readGuardCautionSignal({ stateDir }, sid) === null);
  const text = await closeTextFor(sid, FLAG_ON);
  check("phase one negative: close turn is the unmodified base string", text === BASE_REFLECT_INVITATION);
}

// --- phase two: proximity basis (reflexive) ---------------------------------
{
  routeState.guard = "proceed";
  routeState.reason = "adverse-proximity";
  const sid = "cc-proximity";
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Edit", { file_path: "/repo/z.ts", new_string: "z" }), FLAG_ON);
  const sig = readConsultSignal({ stateDir }, sid);
  check("phase two proximity: signal recorded, basis proximity, confidence high", sig?.basis === "proximity" && sig?.confidence === "high");
  const text = await closeTextFor(sid, FLAG_ON);
  check("phase two proximity: close turn names the proximity reading", text.includes("reflexive"));
  check("phase two proximity: close turn discloses a direct adverse reading", text.includes("direct adverse reading"));
}

// --- phase two: kathekon basis, HIGH confidence (rich elsewhere) ------------
{
  routeState.reason = "kathekon-contrary-rich";
  const sid = "cc-kathekon-rich";
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Edit", { file_path: "/repo/a.ts", new_string: "a" }), FLAG_ON);
  const sig = readConsultSignal({ stateDir }, sid);
  check("phase two kathekon-rich: signal recorded, basis kathekon, confidence high", sig?.basis === "kathekon" && sig?.confidence === "high");
  const text = await closeTextFor(sid, FLAG_ON);
  check("phase two kathekon-rich: close turn names the kathekon dimension", text.includes("kathekon (fitting-action)"));
  check(
    "phase two kathekon-rich: THE CONSTRAINT — plainly discloses WHY it's high-confidence (engaged substantively, specifically found nothing kathekon-relevant)",
    text.includes("engaged substantively") && text.includes("specifically found nothing kathekon-relevant"),
  );
  check("phase two kathekon-rich: does NOT claim certainty (still hedged as a reading, not a fact)", text.includes("a considered reading, not an uncertain one"));
}

// --- phase two: kathekon basis, LOW confidence (sparse everywhere) — MUST be genuinely absent ---
{
  routeState.reason = "kathekon-contrary-sparse";
  const sid = "cc-kathekon-sparse";
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Edit", { file_path: "/repo/b.ts", new_string: "b" }), FLAG_ON);
  const sig = readConsultSignal({ stateDir }, sid);
  check("phase two kathekon-sparse: signal recorded, basis kathekon, confidence LOW", sig?.basis === "kathekon" && sig?.confidence === "low");
  const text = await closeTextFor(sid, FLAG_ON);
  check(
    "THE RULING'S CONSTRAINT — a low-confidence read is GENUINELY IDENTICAL to the no-signal base string, not a degraded version of the high-confidence content",
    text === BASE_REFLECT_INVITATION,
  );
  check("low-confidence: never claims a kathekon finding", !text.includes("kathekon (fitting-action)"));
}

// --- precedence: guard caution AND a high-confidence consult signal in the SAME session ---
{
  routeState.guard = "caution";
  routeState.reason = "kathekon-contrary-rich";
  const sid = "cc-precedence";
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Bash", { command: "rm -rf /repo/precedence" }), FLAG_ON); // guard caution
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Edit", { file_path: "/repo/c.ts", new_string: "c" }), FLAG_ON); // high-confidence kathekon consult
  check("precedence setup: BOTH signals recorded this session", !!readGuardCautionSignal({ stateDir }, sid) && !!readConsultSignal({ stateDir }, sid));
  const text = await closeTextFor(sid, FLAG_ON);
  check("precedence: the close turn names the GUARD caution", text.includes("recorded a caution from the at-action guardrail"));
  check("precedence: the close turn does NOT ALSO name the kathekon consult finding (one finding per close turn)", !text.includes("kathekon (fitting-action)"));
}

// --- precedence, PR19 review fold (LOW-2): guard caution + a LOW-confidence consult signal —
// the guard content must still show (never silently go quiet just because the paired consult
// signal was too weak to name on its own).
{
  routeState.guard = "caution";
  routeState.reason = "kathekon-contrary-sparse";
  const sid = "cc-precedence-low";
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Bash", { command: "rm -rf /repo/precedence-low" }), FLAG_ON); // guard caution
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Edit", { file_path: "/repo/f.ts", new_string: "f" }), FLAG_ON); // low-confidence consult
  check(
    "precedence+low setup: guard signal recorded AND a low-confidence consult signal recorded",
    !!readGuardCautionSignal({ stateDir }, sid) && readConsultSignal({ stateDir }, sid)?.confidence === "low",
  );
  const text = await closeTextFor(sid, FLAG_ON);
  check("precedence+low: the close turn STILL names the guard caution (does not go silent)", text.includes("recorded a caution from the at-action guardrail"));
  check("precedence+low: never names a kathekon finding (the paired signal was low-confidence)", !text.includes("kathekon (fitting-action)"));
}

// --- strongest-wins across the session, exercised end-to-end (not just the unit-level lib test) ---
{
  routeState.guard = "proceed";
  const sid = "cc-strongest-wins";
  routeState.reason = "kathekon-contrary-sparse"; // LOW first
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Edit", { file_path: "/repo/d1.ts", new_string: "d1" }), FLAG_ON);
  check("strongest-wins setup: low recorded first", readConsultSignal({ stateDir }, sid)?.confidence === "low");
  routeState.reason = "kathekon-contrary-rich"; // then HIGH, on a distinct decision
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Edit", { file_path: "/repo/d2.ts", new_string: "d2" }), FLAG_ON);
  check("strongest-wins: the HIGH-confidence one supersedes the earlier LOW", readConsultSignal({ stateDir }, sid)?.confidence === "high");
  const text = await closeTextFor(sid, FLAG_ON);
  check("strongest-wins end-to-end: the close turn reflects the high-confidence finding", text.includes("kathekon (fitting-action)"));
}
{
  routeState.guard = "proceed";
  const sid = "cc-no-downgrade";
  routeState.reason = "kathekon-contrary-rich"; // HIGH first
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Edit", { file_path: "/repo/e1.ts", new_string: "e1" }), FLAG_ON);
  routeState.reason = "kathekon-contrary-sparse"; // then LOW, on a distinct decision — must NOT downgrade
  await runHook(AT_ACTION_HOOK, ptEvent(sid, "Edit", { file_path: "/repo/e2.ts", new_string: "e2" }), FLAG_ON);
  check("no-downgrade: confidence stays HIGH after a later low-confidence consult in the same session", readConsultSignal({ stateDir }, sid)?.confidence === "high");
  const text = await closeTextFor(sid, FLAG_ON);
  check("no-downgrade end-to-end: the close turn STILL reflects the earlier high-confidence finding", text.includes("kathekon (fitting-action)"));
}

console.log(`\nclose-content-variation battery: ${pass} passed, ${fail} failed`);
server.close();
process.exit(fail === 0 ? 0 : 1);
