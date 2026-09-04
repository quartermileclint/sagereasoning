#!/usr/bin/env python3
"""Option S collector (R8 sec 5.3) -- sample and disclose, decide nothing.

REBUILT 2026-09-04 after three blind PR19 reviewers returned findings against
the first version, several of them HIGH and two duplicated across reviewers.
The first version's own header claimed a reuse and a completeness it did not
have. Corrections are cited inline as (PR19 <dimension>-<n>).

WHAT THIS IS. Option S per R8 sec 5.3: submit each frozen input to the live gate
K times, record ALL K outcomes, keep the FIRST as operative, publish the
disagreement. It changes no gate behaviour and elects nothing. It is not
median-of-K (Option M) and not worst-of-K (Option W); electing between M, W and
S is the deferred doctrine question this data informs and does not answer.

WHAT THE FIRST VERSION GOT WRONG, AND WHAT CHANGED
  (PR19 design-soundness HIGH) It published an undirected binary "did any two of
  K differ" flag. M and W are functions of the PER-SAMPLE FLOOR PROBABILITY p on
  floor-borderline inputs, and p is NOT recoverable from a binary flag -- the
  map is non-monotone (p and 1-p are indistinguishable) and each input has its
  own p. This version therefore records, per input: the floor count over
  counted verdicts (from which p-hat = floor_count/n_verdicts is directly
  estimable), the DIRECTIONAL split, and what M and W WOULD have recorded --
  the quantities the election actually needs. The binary flag is retained as a
  secondary descriptive figure, not as the headline.
  (PR19 design-soundness HIGH) It mixed engine outages into the identity space,
  so ONE outage in a K=3 series flipped the whole input to "disagreeing". D6a's
  own round-3 correction states outages are "infrastructure, not a gate
  judgement about the frozen text". Non-verdict outcomes are now counted and
  reported SEPARATELY and never enter a disagreement identity.
  (PR19 design-soundness / constraint-compliance HIGH) The record key was `kind`
  where D6a writes `outcome_kind`; fed D6a-shaped records the summary silently
  printed inputs_measured: 0 rather than aborting. Schema is now D6a's, and the
  summary ABORTS when files exist but nothing parses.
  (PR19 claims-vs-source HIGH) The header claimed the live-gate call path was
  imported from D6a. It was not, and D6a has no importable call primitive -- its
  HTTP call is inline in its own run_series. The call path is implemented HERE,
  and the claim is corrected: what is genuinely imported is extract_fields,
  classify_outcome, classify_failure, wilson_interval, utc_now, and those ARE
  called on every record.
  (PR19 constraint-compliance HIGH) The freeze discipline was documented and not
  implemented -- text_sha() was defined and never called. First-run stamping and
  hash-abort now exist, mirroring D6a's stamp_first_run.
  (PR19 all three) sweep() ran only candidates[0].

DIRECTIONAL DECOMPOSITION IS REQUIRED, NOT OPTIONAL. The 2026-08-30
rate-presentation ruling recorded in d6a-runner.py: "the published rate be
decomposed by direction: a gate that occasionally blocks what it would usually
permit produces friction; one that occasionally permits what it would usually
block fails at its purpose." M's effect is entirely directional. An undirected
rate cannot support the M-vs-W comparison it is collected for.

WHAT THIS SCRIPT WILL NOT DO. It will not invent, reconstruct or approximate a
candidate text. It will not report a rate it did not measure. It will not run
without an explicit credential file. It aborts the sweep on the first quota 429
rather than burning the remainder. It retries nothing (a retry would silently
change K).

USAGE
    python3 option-s-runner.py run <candidate_id> <K>
    python3 option-s-runner.py sweep <K>
    python3 option-s-runner.py summary <runs_dir>
"""

import hashlib
import importlib.util
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
CANDIDATES_FILE = HERE / "option-s-candidates.json"
RUNS_DIR = HERE / "runs"
D6A_RUNNER = HERE.parent / "d6a" / "d6a-runner.py"

ENDPOINT = "https://www.sagereasoning.com/api/guardrail"
DEFAULT_CRED_FILE = Path.home() / ".sage-option-s-credential"
MAX_K = 25                 # D6a's ceiling; a live metered gate (PR19 DS-LOW)
CALL_SPACING_S = 6.0       # D6a's pre-auth IP-limiter spacing
TIMEOUT_S = 120

# The floor class. ADR-010 sec 4's floors resolve to `reflexive`; this is the
# outcome M suppresses and W amplifies, so it is the quantity the election needs.
FLOOR_PROXIMITY = "reflexive"

# Outcomes admitted to the distribution, per D6a: a 200 with no proximity is the
# gate SPEAKING, not the transport failing. But only `verdict` outcomes carry a
# proximity, so only they enter a disagreement identity (PR19 DS-HIGH).
COUNTED = ("verdict", "tier1_pause", "engine_unavailable")

L1 = ("SAMPLING FRAME (the ruling's population clause, read forward). The ruling "
      "states: 'Path A's output is the disagreement rate on the closed run's "
      "candidate population, not on a live running loop.' That clause is "
      "retained and rides the data. Forward-looking it is a statement of WHICH "
      "texts were measured, not a caveat on a comparison -- the measurement is "
      "of today's gate on real candidate texts; the frame says whose texts.")
L2 = ("DISSOLVED 2026-09-04 by the forward-looking election, recorded rather than "
      "deleted so the reasoning stays legible. The submitted-payload assumption "
      "(2026-08-29 classification §7(1)) bit ONLY when a resampled verdict was "
      "compared against a RECORDED one -- if August's call was wrapped, that "
      "comparison crossed different inputs. This instrument no longer makes that "
      "comparison. What was sent in August is irrelevant to every quantity "
      "published here. The 2026-08-30 c11 experiment had already discharged the "
      "forward-looking half on the bare stored text.")
L3 = ("SAMPLING FRAME, NOT A BIAS (reframed 2026-09-04). These texts were selected "
      "by their verdict in a past run. Under the earlier comparative design that "
      "was selection on the dependent variable, and regression to the mean would "
      "have presented as variance. Forward-looking it is not a bias in the "
      "measurement -- it states WHICH texts were measured. Two consequences "
      "survive: the sample is NOT representative of a future runner's candidate "
      "stream, so no population-level claim follows; and the rejection stratum is "
      "ENRICHED for floor-prone texts, which makes it the right population for "
      "the floor-borderline question M and W turn on, and the wrong one for a "
      "general rate. Read strata, never the pooled figure alone.")
L6 = ("DISSOLVED 2026-09-04 by the forward-looking election, recorded not deleted. "
      "f7619d9 (2026-08-24) changed layer2-mechanisms.ts after the run closed "
      "(2026-08-16), so a resampled-vs-recorded comparison crossed an engine "
      "change. No such comparison is made now: this measures TODAY'S engine -- "
      "the engine a standing runner would live on, and the engine any M or W "
      "policy would actually operate. One residual, a frame note not a confound: "
      "the texts were produced by a loop running under the OLDER engine, so they "
      "are that loop's candidate shapes.")
L7 = ("VARIANCE IS MULTI-CHANNEL: the c11 record's divergent run floored through "
      "andreia while the run-time rejection recorded phronesis+dikaiosyne. A "
      "floor count does not identify WHICH floor fired -- read proximity_floors.")
PRIOR = ("c11 already has K=10 from 2026-08-29 (9/10 deliberate, 1/10 reflexive; "
         "p_hat_floor 0.10; Wilson ~2-40%) on a MINIMAL payload -- see "
         "2026-08-30-c11-rerun-experiment-record.md. The mechanism is already "
         "localized to the Layer-1 grave-indicator stage assignment (four states "
         "on identical text; only praxis floors). Path A measures PREVALENCE, "
         "not mechanism. Do not re-run c11 at a lower K.")
L4 = ("SET-SIZE DISCREPANCY (OPEN, surfaced at build): the ruling says 29 "
      "decision-bearing candidates (20 winners + 9 rejections). The S6 report's "
      "own outcome table says winner = 15 (cycles 1,2,4,7-14,17-20), which gives "
      "24. This instrument does not resolve the conflict; EXTRACTION.sql sec PRE "
      "settles it against production and the founder carries the answer.")
NOT_A_DECISION = ("Option S decides nothing. The FIRST verdict is operative. This "
                  "output is measurement, not an election between M, W and S.")


def _load_d6a():
    """Import the PR19-hardened primitives. ABORT on failure -- a local
    reimplementation is the exact defect class D6a's round 4 caught twice."""
    if not D6A_RUNNER.exists():
        sys.exit(f"ABORT: D6a runner not found at {D6A_RUNNER}.")
    spec = importlib.util.spec_from_file_location("d6a_runner", D6A_RUNNER)
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
    except Exception as exc:  # noqa: BLE001
        sys.exit(f"ABORT: could not import D6a primitives ({exc}).")
    for fn in ("extract_fields", "classify_outcome", "classify_failure",
               "wilson_interval", "utc_now"):
        if not hasattr(mod, fn):
            sys.exit(f"ABORT: D6a runner has no {fn}() -- its interface moved.")
    return mod


D6A = _load_d6a()


def load_doc() -> dict:
    if not CANDIDATES_FILE.exists():
        sys.exit(f"ABORT: {CANDIDATES_FILE} missing.")
    return json.loads(CANDIDATES_FILE.read_text(encoding="utf-8"))


def save_doc(doc: dict) -> None:
    CANDIDATES_FILE.write_text(json.dumps(doc, indent=2) + "\n", encoding="utf-8")


def require_populated(doc: dict) -> list:
    cands = doc.get("candidates") or []
    if not cands:
        sys.exit("ABORT: candidate set is EMPTY. The texts are NOT in this "
                 "repository -- they live in production idea_loop_candidates. "
                 "Run EXTRACTION.sql (founder-walked) and paste its sec 3 output "
                 "into `candidates`. This script will not invent, reconstruct or "
                 "approximate a candidate text.")
    return cands


def text_sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def freeze_check(doc: dict, c: dict) -> None:
    """Byte guard + one-way freeze, both ENFORCED (PR19 CC-HIGH: the first
    version documented this and implemented neither).

    `bytes` is REQUIRED, not optional -- the first version skipped the check
    when absent, reintroducing the optional-field disarm vector D6a closed."""
    if "bytes" not in c or c["bytes"] is None:
        sys.exit(f"ABORT: {c['id']} has no `bytes`. The byte guard is not "
                 f"optional; EXTRACTION.sql emits octet_length for every row.")
    actual = len(c["text"].encode("utf-8"))
    if actual != c["bytes"]:
        sys.exit(f"ABORT: byte drift on {c['id']} -- declared {c['bytes']}, "
                 f"actual {actual}.")
    sha = text_sha(c["text"])
    frozen = c.get("frozen_text_sha256")
    if frozen and frozen != sha:
        sys.exit(f"ABORT: {c['id']} text changed since its series started "
                 f"(frozen {frozen[:12]}, now {sha[:12]}). A changed text is a "
                 f"NEW input with a new id, never an edit.")
    if not frozen:
        c["frozen_text_sha256"] = sha
        c["series_started"] = D6A.utc_now()
        save_doc(doc)


def read_credential() -> str:
    path = Path(__import__("os").environ.get("OPTION_S_CREDENTIAL_FILE",
                                             DEFAULT_CRED_FILE))
    if not path.exists():
        sys.exit(f"ABORT: no credential file at {path}. Write the token there "
                 f"(chmod 600); do NOT pass it inline -- this project had a "
                 f"public-credential-exposure incident on 2026-07-17.")
    tok = path.read_text(encoding="utf-8").strip()
    if not tok:
        sys.exit(f"ABORT: {path} is empty.")
    return tok


def call_gate(text: str, agent_id: str, token: str) -> dict:
    """One live metered call. Implemented HERE -- D6a has no importable call
    primitive (PR19 CV-HIGH corrected the claim that this was imported)."""
    payload = json.dumps({"action": text, "agent_id": agent_id}).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT, data=payload, method="POST",
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {token}"})
    started = D6A.utc_now()
    try:
        # No redirect handler: urllib converts POST->GET on 3xx, which is how
        # D6a's round 4 found the route's own GET self-doc entering a series.
        with urllib.request.urlopen(req, timeout=TIMEOUT_S) as resp:
            raw = resp.read().decode("utf-8", "replace")
            status = resp.status
    except urllib.error.HTTPError as e:
        raw, status = e.read().decode("utf-8", "replace"), e.code
    except Exception as e:  # noqa: BLE001 -- transport, recorded not raised
        return {"requested_at": started, "http_status": None,
                "failure_kind": f"transport:{type(e).__name__}",
                "outcome_kind": "failure"}
    rec = {"requested_at": started, "http_status": status}
    try:
        body = json.loads(raw)
    except ValueError:
        body = None
    if status == 200 and isinstance(body, dict):
        rec["fields"] = D6A.extract_fields(body)
    else:
        rec["failure_kind"] = D6A.classify_failure(status, raw)
    rec["outcome_kind"] = D6A.classify_outcome(rec)
    return rec


def run_series(candidate_id: str, k: int, token: str, agent_id: str,
               doc: dict, cands: list) -> str:
    match = [c for c in cands if c["id"] == candidate_id]
    if not match:
        sys.exit(f"ABORT: no candidate {candidate_id}.")
    c = match[0]
    freeze_check(doc, c)
    out_path = RUNS_DIR / f"{candidate_id}.jsonl"
    RUNS_DIR.mkdir(exist_ok=True)
    with out_path.open("a", encoding="utf-8") as fh:
        for i in range(k):
            rec = call_gate(c["text"], agent_id, token)
            rec.update({"candidate_id": candidate_id, "call_index": i,
                        "intended_k": k,
                        "frozen_text_sha256": c["frozen_text_sha256"],
                        "decision_role": c.get("decision_role"),
                        "recorded_proximity": c.get("recorded_proximity")})
            fh.write(json.dumps(rec) + "\n")
            fh.flush()
            if rec.get("failure_kind") == "quota_429":
                sys.exit(f"ABORT: quota exhausted at {candidate_id} call {i}. "
                         f"Sweep stopped rather than burning the remainder. "
                         f"Resize the credential and resume.")
            if i < k - 1:
                time.sleep(CALL_SPACING_S)
    return str(out_path)


def summary(runs_dir: str) -> None:
    d = Path(runs_dir)
    if not d.exists():
        sys.exit(f"ABORT: {d} not found.")
    files = sorted(d.glob("*.jsonl"))
    if not files:
        sys.exit(f"ABORT: no run records in {d}. This script never reports a "
                 f"rate it did not measure.")
    per_input, parsed_any = [], False
    for f in files:
        recs = []
        for line in f.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                recs.append(json.loads(line))
            except ValueError:
                continue          # D6a's malformed-line tolerance
        counted = [r for r in recs if r.get("outcome_kind") in COUNTED]
        if not counted:
            continue
        parsed_any = True
        verdicts = [r for r in counted if r.get("outcome_kind") == "verdict"]
        prox = [(r.get("fields") or {}).get("katorthoma_proximity")
                for r in verdicts]
        prox = [p for p in prox if p]
        proceeds = [(r.get("fields") or {}).get("proceed") for r in verdicts]
        proceeds = [p for p in proceeds if isinstance(p, bool)]
        floor_n = sum(1 for p in prox if p == FLOOR_PROXIMITY)
        n_v = len(prox)
        intended = recs[0].get("intended_k") if recs else None
        # What M and W WOULD have recorded -- the quantities the election needs.
        would_M = None
        if n_v:
            would_M = FLOOR_PROXIMITY if floor_n * 2 > n_v else (
                sorted(set(prox), key=prox.count)[-1])
        would_W = FLOOR_PROXIMITY if floor_n else (prox[0] if prox else None)
        per_input.append({
            "candidate_id": f.stem,
            "decision_role": recs[0].get("decision_role") if recs else None,
            # Retained as inert sampling-frame provenance ONLY. It is NOT
            # compared against anything here, by founder election 2026-09-04:
            # the comparison crossed an engine change (f7619d9) and an
            # unverified historical payload. Do not reintroduce a comparison
            # without reopening L2 and L6.
            "recorded_proximity_PROVENANCE_ONLY": recs[0].get("recorded_proximity") if recs else None,
            "intended_k": intended,
            "n_counted": len(counted),
            "n_verdicts": n_v,
            "complete": intended is not None and len(recs) == intended,
            "n_non_verdict": len(counted) - n_v,
            "proximities": prox,
            "floor_count": floor_n,
            "p_hat_floor": (floor_n / n_v) if n_v else None,
            "operative": prox[0] if prox else None,
            "distinct_proximities": sorted(set(prox)),
            "disagreed_proximity": len(set(prox)) > 1,
            # Direction is only meaningful where the input actually varied.
            # A unanimous series has no minority and therefore no direction --
            # the first version called an all-floor input "blocks what it
            # usually permits", which reads a disagreement out of agreement.
            "direction": ("stable_no_variance" if len(set(prox)) <= 1 else
                          "permits_what_it_usually_blocks"
                          if floor_n * 2 < n_v else
                          "blocks_what_it_usually_permits"),
            "proceed_values": proceeds,
            "disagreed_proceed": len(set(proceeds)) > 1,
            "would_option_M_record": would_M,
            "would_option_W_record": would_W,
        })
    if not parsed_any:
        sys.exit(f"ABORT: {len(files)} run file(s) found but NO record carried a "
                 f"counted outcome_kind. Refusing to publish a null rate as a "
                 f"result (PR19: the first version printed inputs_measured: 0 "
                 f"and called it success).")

    def block(rows, label):
        n = len(rows)
        dis = sum(1 for r in rows if r["disagreed_proximity"])
        lo, hi = D6A.wilson_interval(dis, n) if n else (None, None)
        tot_v = sum(r["n_verdicts"] for r in rows)
        tot_f = sum(r["floor_count"] for r in rows)
        return {"stratum": label, "inputs": n, "inputs_disagreeing": dis,
                "per_input_disagreement_rate": (dis / n) if n else None,
                "wilson_95": {"low": lo, "high": hi},
                "verdicts": tot_v, "floors": tot_f,
                "pooled_p_hat_floor": (tot_f / tot_v) if tot_v else None,
                # Intra-series only: `operative` is THIS run's first verdict,
                # never a historical one. This survives the forward-looking change.
                "M_differs_from_operative": sum(
                    1 for r in rows if r["would_option_M_record"]
                    and r["would_option_M_record"] != r["operative"]),
                "W_differs_from_operative": sum(
                    1 for r in rows if r["would_option_W_record"]
                    and r["would_option_W_record"] != r["operative"])}

    strata = [block(per_input, "ALL")]
    for role in ("winner", "guardrail_rejection"):
        rows = [r for r in per_input if r.get("decision_role") == role]
        if rows:
            strata.append(block(rows, role))

    print(json.dumps({
        "instrument": "option-s",
        "generated_at": D6A.utc_now(),
        "measured_path": "/api/guardrail",
        "measures": "TODAY'S gate, on real candidate texts. FORWARD-LOOKING by "
                    "founder election 2026-09-04: no resampled verdict is compared "
                    "against any recorded historical verdict. This is compatible "
                    "with the ruling, which asks for the per-input disagreement "
                    "rate on the closed run's CANDIDATES and never required a "
                    "comparison to their recorded verdicts.",
        "headline_quantity": "pooled_p_hat_floor -- the per-sample floor rate on "
                             "today's engine. The binary disagreement rate is "
                             "secondary; M and W are functions of p, not of the flag.",
        "strata": strata,
        "per_input": per_input,
        "LIMIT_1_closed_run_population": L1,
        "LIMIT_2_submitted_payload_fidelity": L2,
        "LIMIT_3_selection_on_dependent_variable": L3,
        "LIMIT_4_set_size_discrepancy": L4,
        "LIMIT_6_instrument_drift": L6,
        "LIMIT_7_variance_multi_channel": L7,
        "PRIOR_DATA_c11": PRIOR,
        "K_note": "K is the POLICY parameter R8 ruled for median-of-3. It is NOT "
                  "ruled as the measurement K. D6a chose K=10 with a stated power "
                  "rationale. At K=3 a per-input p-hat takes values in "
                  "{0, 1/3, 2/3, 1} only. Stratum intervals are wide; state the "
                  "detectable effect size before treating a clean sweep as "
                  "evidence of stability.",
        "stratification_note": "The winner stratum is mostly not floor-borderline "
                               "and will contribute near-zero disagreement, "
                               "diluting the pooled figure. The rejection stratum "
                               "is the informative one and is small. Read strata, "
                               "not the pooled ALL figure alone.",
        "not_a_decision": NOT_A_DECISION,
        "reason_path_rate": "unmeasured -- the consult path shares extractFeatures "
                            "but passes additional Layer-1 context.",
    }, indent=2))


def main() -> None:
    a = sys.argv[1:]
    if len(a) >= 3 and a[0] == "run":
        doc = load_doc(); cands = require_populated(doc)
        k = int(a[2])
        if not 2 <= k <= MAX_K:
            sys.exit(f"ABORT: K must be 2..{MAX_K}.")
        m = doc.get("_meta", {})
        print(run_series(a[1], k, read_credential(),
                         m.get("agent_id", "sagereasoning:option-s@v1"), doc, cands))
    elif len(a) >= 2 and a[0] == "sweep":
        doc = load_doc(); cands = require_populated(doc)
        k = int(a[1])
        if not 2 <= k <= MAX_K:
            sys.exit(f"ABORT: K must be 2..{MAX_K}.")
        tok = read_credential()
        agent = doc.get("_meta", {}).get("agent_id", "sagereasoning:option-s@v1")
        print(f"Sweeping {len(cands)} candidates x K={k} = {len(cands)*k} calls "
              f"= {len(cands)*k*2} quota units. Ctrl-C aborts.", file=sys.stderr)
        for c in cands:                       # PR19: all three found sweep ran only [0]
            print(run_series(c["id"], k, tok, agent, doc, cands), file=sys.stderr)
            time.sleep(CALL_SPACING_S)
    elif len(a) >= 2 and a[0] == "summary":
        summary(a[1])
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
