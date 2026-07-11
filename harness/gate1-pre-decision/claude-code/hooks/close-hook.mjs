#!/usr/bin/env node
/**
 * SageReasoning — Gate-1 CLOSE hook (H4): reflect-at-close + the accreditation write.
 * Claude Code `Stop` (fires when the agent finishes responding — the close of the task loop).
 * Arc 3 / Slice 5c (the CHANNEL-LAW re-architecture).  Governing design:
 * adopted/adr/2026-06-20-pre-decision-harness-arc2.md ("Amendment 2026-06-21 (Slice 5b live-fire) —
 * the channel law; H3/H4 re-architecture") + D-C/D-D/D-E/D-F.
 *
 * THE CHANNEL LAW (Slice 5b live-fire, FUNDAMENTAL): a hook harness has two delivery channels and a
 * capable agent treats them oppositely. OUT-OF-BAND actions (the hook DOES it on its own credential;
 * the agent is never asked) are robust to a resistant agent. SOFT-INJECTED instructions-to-act
 * (a decision:block reason telling the agent to make an outbound POST with a credential it doesn't
 * hold) are correctly REFUSED — a MORE capable agent refuses HARDER. So every load-bearing step is
 * classified by CHANNEL, not stage. This hook delivers reflect-at-close across three channels:
 *
 *   ENFORCE (the hook forces it; no outbound instruction) — REFLECT TURN (D-C). On the first Stop,
 *     {"decision":"block","reason":…} forces exactly ONE more in-conversation turn. The reason is a
 *     non-imperative, NO-endpoint / NO-POST / NO-credential INVITATION to review one's OWN reasoning
 *     (within task scope ⇒ does not trip the scope-expansion defence). The MODEL reviews; the hook
 *     never asks it to call anything. Gated by GATE1_REFLECT_TURN_ENABLED (default on; the operator
 *     opt-out — keeps guard + accred + persist while disabling the one extra turn).
 *
 *   INSTRUMENT (the hook records out-of-band, on its OWN credential, the agent is never asked) —
 *     (a) ACCREDITATION WRITE (D-D) — reads the session's ACCUMULATED signed assessments (the
 *         top-level frame + H3 consults appended these) and POSTs an accreditation seed carrying
 *         them (R18f). NON-MARKER accreditation_write credential bound to the loop agent_id —
 *         NEVER the standing pre_decision_harness marker (a write on it clobbers the marker —
 *         established 2026-06-21). No provenance / no non-marker credential ⇒ writes NOTHING, says so.
 *     (b) persistReflection() (Slice 5c) — on the stop_hook_active===true loop-guard turn (i.e. the
 *         turn AFTER the forced reflect turn, when last_assistant_message IS the agent's reflection),
 *         read that VERBATIM text and POST it out-of-band under the reflect credential. The hook NEVER
 *         authors first-person introspection: it transmits the agent's literal words (context_source
 *         'agent_stated'), or — when there is no reflection — records an honest "not performed"
 *         (open-only, no fabricated answer). The session_summary the hook supplies is marked
 *         context_source 'harness_inferred' (the harness inferred it; the agent did not state it).
 *         DARK by default: SAGE_GATE1_REFLECT_PERSIST_ENABLED unset ⇒ no egress of the agent's words.
 *         OFF-MACHINE EGRESS (honesty contract): persisting transmits the agent's introspective text
 *         to SageReasoning — DISCLOSED + consented at operator-install (see the harness README).
 *
 * CLOSE-EVENT CONTRACT (D-E; confirmed first-hand at the founder-walked Slice-5b live-fire):
 *   `Stop` (NOT `SessionEnd`) is the event — only `Stop` can INITIATE a model turn. This desktop
 *   build's `Stop` stdin carries `last_assistant_message` (the agent's closing text) alongside
 *   { session_id, transcript_path, cwd, hook_event_name:"Stop", stop_hook_active, effort,
 *   background_tasks, session_crons }. To continue the agent: exit 0 with
 *   {"decision":"block","reason":"…"}. LOOP GUARD: `stop_hook_active === true` means a Stop hook
 *   already blocked THIS turn — we then run persistReflection (the agent's reflection is now in
 *   last_assistant_message) and ALLOW the stop.
 *
 * FAIL POSTURE (D-F / KG1 / R18): every step fails-honest. No fabricated reflection, no fabricated
 *   accreditation, never the standing marker credential. An outage logs + writes nothing false.
 *
 * No third-party dependencies. Node 18+ (global fetch + AbortSignal.timeout).
 */

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig, readStdin, maybeDebugDump, honestLog, deriveSibling, markerPath, parseBool } from "./lib/framing-core.mjs";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { readProvenance } from "./lib/session-state.mjs";

const HOOK_DIR = dirname(fileURLToPath(import.meta.url)); // …/claude-code/hooks

function loadCloseConfig() {
  const cfg = loadConfig({ hookDir: HOOK_DIR, eventName: "Stop", allowStrict: true });
  cfg.reflectEndpoint = process.env.GATE1_REFLECT_ENDPOINT || deriveSibling(cfg.endpoint, "practice/reflect");
  cfg.accredEndpoint = process.env.GATE1_ACCRED_ENDPOINT || deriveSibling(cfg.endpoint, "accreditation");
  // cfg.agentId + cfg.accredCredential are read in the shared loadConfig (so H3 derives
  // captureProvenance from the same write-path inputs, founder election #2). The accred credential is
  // DISTINCT from cfg.credential (the consult credential, which in the dogfood IS the standing marker
  // credential): it must carry accreditation_write + be a NON-marker credential, unset ⇒ no write
  // (honest skip), and it NEVER falls back to cfg.credential (the marker-refusal guards below).
  // The standing pre_decision_harness MARKER credential, named so the write guard can refuse it by
  // identity (a marker sr_prac_ token is indistinguishable from a non-marker one by VALUE alone).
  // DEFAULTS to the consult credential (in the dogfood the consult credential IS the marker), so the
  // most likely accident — pasting the dogfood SAGE_GATE1_CREDENTIAL into the accred slot — is
  // refused by default. When the consult and marker credentials genuinely DIFFER (a non-dogfood
  // install), name the marker explicitly via SAGE_GATE1_MARKER_CREDENTIAL at Slice-5b activation.
  cfg.markerCredential = (process.env.SAGE_GATE1_MARKER_CREDENTIAL || cfg.credential || "").trim();
  // The reflect persist credential — needs the `reflect` capability. Defaults to the accred
  // credential (a UPC carrying both). Unset ⇒ persistReflection has no credential ⇒ honest skip.
  cfg.reflectCredential = (process.env.SAGE_GATE1_REFLECT_CREDENTIAL || cfg.accredCredential || "").trim();
  // Reflect-turn mode (ENFORCE channel): 'block' (default — force ONE in-conversation review turn via
  // decision:block), 'context' (soft — additionalContext only), 'off' (no reflect turn; still do the
  // accred write + persist). The reason text is a NON-imperative, no-endpoint/POST/credential
  // invitation to review one's own reasoning (channel law) — NEVER an instruction to call the API.
  const mode = (process.env.GATE1_REFLECT_INITIATE_MODE || "block").toLowerCase();
  cfg.reflectInitiateMode = mode === "context" || mode === "off" ? mode : "block";
  // Operator opt-out (ADR-011 open-question 4, Slice-5c): GATE1_REFLECT_TURN_ENABLED=false disables
  // the one-extra-turn-per-close while KEEPING guard + accred (+ persist, which then has nothing to
  // capture, so it honestly records nothing). Default on. A false flag overrides the mode to 'off'.
  cfg.reflectTurnEnabled = parseBool(process.env.GATE1_REFLECT_TURN_ENABLED, true);
  if (!cfg.reflectTurnEnabled) cfg.reflectInitiateMode = "off";
  // persistReflection (INSTRUMENT, Slice 5c): DARK by default — unset ⇒ the agent's reflection is
  // NEVER transmitted off-machine (no egress). Enabling it (a standing operator install, with
  // install-time disclosure + consent) lets H4 POST the agent's VERBATIM reflection out-of-band.
  cfg.reflectPersistEnabled = parseBool(process.env.SAGE_GATE1_REFLECT_PERSIST_ENABLED, false);
  return cfg;
}

// The close fire-once marker (distinct from the per-task .framed markers).
function closeMarkerPath(cfg, sessionId) {
  return markerPath(cfg, `close-${sessionId}`).replace(/\.framed$/, ".closed");
}
function writeCloseMarker(cfg, sessionId, detail) {
  try {
    mkdirSync(cfg.stateDir, { recursive: true });
    writeFileSync(closeMarkerPath(cfg, sessionId), `${new Date().toISOString()} ${detail}\n`);
  } catch {
    /* a lost marker just means the next Stop re-runs once — bounded by stop_hook_active */
  }
}

// The reflect-persist fire-once marker (the stop_hook_active turn can in principle re-fire; this
// keeps persistReflection's out-of-band POST to ONCE per session).
function reflectedMarkerPath(cfg, sessionId) {
  return markerPath(cfg, `close-${sessionId}`).replace(/\.framed$/, ".reflected");
}
function writeReflectedMarker(cfg, sessionId, detail) {
  try {
    mkdirSync(cfg.stateDir, { recursive: true });
    writeFileSync(reflectedMarkerPath(cfg, sessionId), `${new Date().toISOString()} ${detail}\n`);
  } catch {
    /* a lost marker just means a second stop_hook_active turn could re-persist once — bounded */
  }
}

// ---------------------------------------------------------------------------
// ACCREDITATION WRITE (D-D). Returns a short status string for the log; never throws.
// ---------------------------------------------------------------------------
async function writeAccreditation(cfg, sessionId) {
  const signed = readProvenance(cfg, sessionId);
  if (signed.length === 0) {
    return "no-provenance"; // no examination accumulated ⇒ nothing to attest (R18f). Honest skip.
  }
  if (!cfg.accredCredential) {
    return "no-accred-credential"; // never fall back to the marker credential (D-D).
  }
  if (!cfg.agentId) {
    return "no-agent-id"; // the write boundary needs a K1-canonical agent_id.
  }
  // D-D — NEVER write on the standing pre_decision_harness MARKER credential (a write on it would
  // clobber the marker's accreditation row with this degraded seed). Two independent guards, neither
  // using a `cfg.credential &&` short-circuit (accredCredential is already guaranteed non-empty
  // above, so an empty consult credential cannot disable either):
  //   (A) refuse if the accred credential equals the NAMED marker credential (the real protection —
  //       markerCredential defaults to the consult credential, covering the dogfood, and is
  //       overridable via SAGE_GATE1_MARKER_CREDENTIAL when consult ≠ marker);
  //   (B) belt-and-braces: refuse if it equals the consult credential directly.
  if (cfg.markerCredential && cfg.accredCredential === cfg.markerCredential) {
    return "refused-marker-credential";
  }
  if (cfg.accredCredential === cfg.credential) {
    return "refused-marker-credential";
  }

  const nowIso = new Date().toISOString();
  const expiresIso = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const url = `${cfg.accredEndpoint.replace(/\/+$/, "")}/${encodeURIComponent(cfg.agentId)}`;
  // A minimal, CONSERVATIVE-TRUTHFUL seed record (S3 / build-plan §3.3). The grade fields below are
  // persisted VERBATIM by the server's seedAccreditation (only coverage_status / monitored_since /
  // credential_basis / examination_mode are server-composed), so a real-looking grade here would be a
  // FABRICATION. The honest seed states no windowed evaluation occurred (senecan_grade pre_progress,
  // actions_evaluated 0, typical_proximity reflexive, dimension_levels emerging); the LOAD-BEARING
  // attestation is the genuine accumulated provenance.signed_assessments (R18f). The harness does NOT
  // claim the server computes the grade — it submits a truthful floor and the real signed chain.
  const body = {
    kind: "seed",
    profile: {
      agent_id: cfg.agentId,
      evaluated_actions: [],
      total_actions_evaluated: 0,
      regressing_check_count: 0,
      accreditation_record: {
        agent_id: cfg.agentId,
        senecan_grade: "pre_progress",
        typical_proximity: "reflexive",
        authority_level: "supervised",
        dimension_levels: {
          passion_reduction: "emerging",
          judgement_quality: "emerging",
          disposition_stability: "emerging",
          oikeiosis_extension: "emerging",
        },
        direction_of_travel: "stable",
        evaluation_window_size: 100,
        actions_evaluated: 0,
        grade_since: nowIso,
        last_evaluation: nowIso,
        passions_persisting: [],
        verification_url: `${cfg.accredEndpoint.replace(/\/+$/, "")}/${encodeURIComponent(cfg.agentId)}`,
        expires_at: expiresIso,
        disclaimer:
          "This accreditation evaluates reasoning quality using Stoic philosophical frameworks. " +
          "It does not guarantee specific outcomes, legal compliance, or fitness for any particular " +
          "purpose. Ancient reasoning, modern application.",
        created_at: nowIso,
        updated_at: nowIso,
        typical_deliberation_breadth: "intuited",
        typical_kathekon_quality: "contrary",
      },
      window_config: {
        window_size: 100,
        grade_check_interval: 20,
        minimum_actions_for_grade: 20,
        typical_proximity_threshold: 0.6,
        dimension_level_threshold: 0.5,
        carried_candidates_max: 5,
      },
      carried_candidates: [],
    },
    provenance: { signed_assessments: signed },
  };

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.accredCredential}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(cfg.timeoutMs),
    });
  } catch (e) {
    return `outage:${e && e.name === "TimeoutError" ? "timeout" : e?.message || e}`;
  }
  if (res.status === 409) return `already-exists(${signed.length})`; // a row already exists — honest, not an error.
  if (!res.ok) return `http-${res.status}`;
  // S3 (build-plan §3.3): surface the LIVE write-boundary loop-closure verdict HONESTLY. In DETECT
  // mode the server runs analyseLoopClosure over the signed chain and annotates `loop_closure` on the
  // 200 (it cannot reject). Read it back and report it as-is — a reversible loop that was never
  // re-consulted reads `unclosed`, which is the truth (the harness does not force closure on the
  // discounted ADVISE channel; only guard-on-retry on the irreversible set re-examines, §3.2).
  let loopVerdict = null;
  try {
    const body = await res.json();
    if (body && typeof body === "object" && body.loop_closure && typeof body.loop_closure === "object") {
      loopVerdict = body.loop_closure;
    }
  } catch {
    /* a non-JSON / bodiless 200 is still a successful write — just no closure annotation to surface */
  }
  if (loopVerdict && typeof loopVerdict.verdict === "string") {
    return `written(${signed.length},loop=${loopVerdict.verdict}[open:${loopVerdict.open ?? "?"}])`;
  }
  return `written(${signed.length})`;
}

// ---------------------------------------------------------------------------
// REFLECT TURN (ENFORCE/ADVISE channel, Slice 5c). A PURE invitation — NO fetch, NO endpoint, NO
// POST, NO credential. It forces ONE in-conversation turn (via decision:block in main) inviting the
// agent to review its OWN reasoning. Reviewing one's own reasoning is within task scope, so a capable
// agent does NOT read this as injected scope-expansion (the channel law). It makes NO claim about
// what happens to the reflection afterwards — the off-machine egress is disclosed at OPERATOR-install
// time (the harness README), never asserted to (or hidden from) the agent here.
// ---------------------------------------------------------------------------
function renderReflectInvitation() {
  return (
    "[SageReasoning — Sage Reflect: review your reasoning this session]\n" +
    "Before this session closes, take one turn to review your own reasoning from the work just " +
    "completed: the impressions you formed and how you described them to yourself, where you gave or " +
    "withheld assent, the actions you chose, what (if anything) you would judge differently, and " +
    "whether the work served its purpose. This is a review of your own reasoning, within the scope of " +
    "this task — there is nothing to call and nothing to send."
  );
}

// The session_summary the harness supplies to OPEN a reflect record. The agent did not state these —
// the harness inferred them — so the open call carries context_source 'harness_inferred' (the Slice-5c
// reflect-contract field); the record is then honest about provenance. Minimal + neutral (R17i).
const HARNESS_INFERRED_SUMMARY = {
  purpose_at_open:
    "Session-close reflection captured by the Gate-1 harness; the agent's purpose at open was not stated to the harness.",
  circle_at_open: "community",
  role_at_open: "agent operating under the SageReasoning Gate-1 pre-decision harness",
  capacity_at_open: [],
  sage_reasoning_passes: 0,
};

// A generous transport cap on the agent's verbatim reflection (the bulk is preserved; over-long text
// is truncated at the transport boundary, recorded honestly in the log — never altered or authored).
const MAX_REFLECTION_CHARS = 6000;

// POST a reflect call (open or answer) out-of-band under the reflect credential. Returns
// { ok, status, body } — never throws. Pure transport; the caller decides honesty semantics.
async function postReflect(cfg, payload) {
  let res;
  try {
    res = await fetch(cfg.reflectEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.reflectCredential}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(cfg.timeoutMs),
    });
  } catch (e) {
    return { ok: false, status: `outage:${e && e.name === "TimeoutError" ? "timeout" : e?.message || e}` };
  }
  if (!res.ok) return { ok: false, status: `http-${res.status}` };
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* a non-JSON 200 is still a successful write for our purposes */
  }
  return { ok: true, status: "ok", body };
}

// ---------------------------------------------------------------------------
// persistReflection (INSTRUMENT channel, Slice 5c, D-D analogue). Out-of-band: the hook POSTs the
// agent's VERBATIM closing reflection under the reflect credential — the agent is never asked. The
// hook NEVER authors first-person introspection:
//   • non-empty last_assistant_message ⇒ open (session_summary marked 'harness_inferred') + answer Q1
//     with the agent's VERBATIM words (marked 'agent_stated'). An honest PARTIAL (one turn captured),
//     never a claimed full Q1–Q6.
//   • empty/absent ⇒ open-only (or skip) and record "not-performed" — NO fabricated answer.
// DARK by default (SAGE_GATE1_REFLECT_PERSIST_ENABLED unset ⇒ no egress). Returns a status string for
// the log; never throws.
// ---------------------------------------------------------------------------
async function persistReflection(cfg, sessionId, lastAssistantMessage) {
  if (!cfg.reflectPersistEnabled) return "disabled"; // dark: the agent's words never leave the machine.
  if (!cfg.reflectCredential) return "no-reflect-credential";
  if (!cfg.agentId) return "no-agent-id";

  const reflectSessionId = `reflect-${sessionId}`;
  const verbatim = typeof lastAssistantMessage === "string" ? lastAssistantMessage.trim() : "";

  // S9b G4 — the suppression-watch inputs: the session's SIGNED assessments (the
  // at-action screen's own record; Ed25519-re-verified server-side) + whether a
  // screen ran at all. Capped at 32 (the server's bound). Absent provenance ⇒
  // screen_ran:false — honest; the reflect service's cross-check then reads
  // self-screen-absent, never passion-unflagged.
  let screenEvidence = null;
  try {
    const signed = readProvenance(cfg, sessionId) || [];
    screenEvidence = { screen_ran: signed.length > 0, signed_assessments: signed.slice(0, 32) };
  } catch {
    /* best-effort — no evidence supplied is the honest degraded form. */
  }

  // 1. Open the reflect record. session_summary is HARNESS-INFERRED (declared via context_source).
  const open = await postReflect(cfg, {
    session_id: reflectSessionId,
    agent_id: cfg.agentId,
    session_summary: HARNESS_INFERRED_SUMMARY,
    context_source: "harness_inferred",
    ...(screenEvidence ? { screen_evidence: screenEvidence } : {}),
  });
  if (!open.ok) return `open-${open.status}`; // honest: nothing persisted, nothing false written.

  // 2. No reflection text ⇒ honest "not performed" (open-only). NEVER fabricate an answer.
  if (!verbatim) return "opened-not-performed";

  // 3. Submit the agent's VERBATIM reflection as the Q1 answer (context_source 'agent_stated').
  const truncated = verbatim.length > MAX_REFLECTION_CHARS;
  const response = truncated ? verbatim.slice(0, MAX_REFLECTION_CHARS) : verbatim;
  const answer = await postReflect(cfg, {
    session_id: reflectSessionId,
    agent_id: cfg.agentId,
    response,
    context_source: "agent_stated",
  });
  if (!answer.ok) return `opened-answer-${answer.status}`; // open exists; the answer didn't land. Honest.
  return `persisted(${response.length}${truncated ? "+truncated" : ""})`;
}

async function main() {
  const cfg = loadCloseConfig();

  const raw = readStdin();
  maybeDebugDump(cfg, raw); // GATE1_DEBUG → dump the raw Stop stdin (confirms the close-event shape live).
  let event = {};
  try {
    event = JSON.parse(raw || "{}");
  } catch {
    process.exit(0); // cannot parse → allow the stop (never trap the session on a parse error).
  }

  const sessionId = event.session_id || "no-session";

  // LOOP GUARD 1 (D-E + Slice 5c INSTRUMENT): stop_hook_active===true means a Stop hook already
  // blocked THIS turn — the agent has just produced the forced REFLECT turn, so its reflection is now
  // in last_assistant_message. Persist it OUT-OF-BAND (fire-once via the .reflected marker), then
  // allow the stop. When the reflect turn is OFF, no block was issued ⇒ this branch never runs ⇒
  // nothing is persisted (honest: there is no reflection to capture).
  if (event.stop_hook_active === true) {
    if (cfg.fireOnce) {
      try {
        if (existsSync(reflectedMarkerPath(cfg, sessionId))) process.exit(0);
      } catch {
        /* cannot check the marker → persist once (bounded by the single stop_hook_active turn) */
      }
    }
    const persistStatus = await persistReflection(cfg, sessionId, event.last_assistant_message);
    writeReflectedMarker(cfg, sessionId, `persist=${persistStatus}`);
    honestLog(cfg, `CLOSE-PERSIST session=${sanitizeLog(sessionId)} persist=${persistStatus}`);
    process.exit(0); // allow the stop — the loop ends here.
  }

  // LOOP GUARD 2 (fire-once per session): if we already ran the close, allow the stop.
  if (cfg.fireOnce) {
    try {
      if (existsSync(closeMarkerPath(cfg, sessionId))) process.exit(0);
    } catch {
      /* if we cannot check the marker, fall through and run once (bounded by stop_hook_active) */
    }
  }

  // 1. Accreditation write (INSTRUMENT, D-D) — out-of-band; happens regardless of the reflect path.
  const accredStatus = await writeAccreditation(cfg, sessionId);

  // 2. Reflect turn (ENFORCE/ADVISE) — a PURE in-conversation invitation; no fetch, no outbound ask.
  const reflectText = cfg.reflectInitiateMode === "off" ? "" : renderReflectInvitation();

  // 3. Record the close (fire-once) BEFORE we block, so the stop_hook_active re-fire routes to persist.
  writeCloseMarker(cfg, sessionId, `accred=${accredStatus} mode=${cfg.reflectInitiateMode}`);
  honestLog(
    cfg,
    `CLOSE session=${sanitizeLog(sessionId)} accred=${accredStatus} mode=${cfg.reflectInitiateMode} persistEnabled=${cfg.reflectPersistEnabled}`,
  );

  // 4. Emit. 'block' forces the in-conversation review turn (its result is captured out-of-band on
  //    the next Stop by persistReflection); 'context' injects it softly (no forced turn ⇒ no persist);
  //    'off' just allows the stop after the accred write.
  if (cfg.reflectInitiateMode === "block" && reflectText) {
    process.stdout.write(JSON.stringify({ decision: "block", reason: reflectText }));
    process.exit(0);
  }
  if (cfg.reflectInitiateMode === "context" && reflectText) {
    process.stdout.write(
      JSON.stringify({ hookSpecificOutput: { hookEventName: "Stop", additionalContext: reflectText } }),
    );
    process.exit(0);
  }
  process.exit(0); // mode 'off' (or no reflect text) — allow the stop; the accred write already ran.
}

function sanitizeLog(s) {
  return String(s || "no-session").replace(/[^a-zA-Z0-9._-]/g, "_");
}

// Catch-all: any unexpected error → allow the stop (never trap the user's session on a hook bug).
main().catch((e) => {
  try {
    honestLog(loadConfig({ hookDir: HOOK_DIR, eventName: "Stop" }), `CLOSE-ERROR reason="internal hook error: ${e?.message || e}"`);
  } catch {
    /* logging must never throw */
  }
  process.exit(0);
});
