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
  own p. This version therefore records, per input: the full proximity
  distribution, the floor count over counted verdicts (from which
  p-hat = floor_count/n_verdicts is directly estimable), the BLOCK count taken
  from the gate's own `proceed` decisions, and what M and W WOULD have recorded
  -- the quantities the election actually needs. The binary flag is retained as
  a secondary descriptive figure, not as the headline. (The DIRECTIONAL split
  this bullet originally also named was REMOVED by the 2026-09-05 ruling; see
  the paragraph below.)
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

DIRECTIONAL DECOMPOSITION IS REMOVED -- RULED 2026-09-05. This paragraph
previously read "DIRECTIONAL DECOMPOSITION IS REQUIRED, NOT OPTIONAL" and cited
the 2026-08-30 rate-presentation ruling. That ruling was superseded the same day
by 2026-08-30-mentor-ruling-pooled-sweep-n100-verbatim.md, and on 2026-09-05 the
mentor ruled the removal reaches Option S by name (Part 1 of
2026-09-05-mentor-rulings-five-relays-verbatim.md): "The decomposition is
removed. Per-probe distributions replace it."

The ground: this candidate set was selected ON the variable being re-measured,
`direction` was a pure function of floor_n*2 versus n_v, and the published split
therefore tended toward the 15:9 role ratio BY CONSTRUCTION -- it would report
the set's composition back as though it were a measurement. The ruling's words:
"a tautology disclosed is still a tautology." What replaces it is the per-input
distribution, which this file already recorded and now publishes as the primary
per-input output.

CONSEQUENCE FOR B1. The 2026-09-05 PR19 review's blocker B1 (the two `direction`
labels were inverted) is MOOT, and is closed by REMOVAL, not by correction: the
field does not exist, so it cannot be wrong. Do not reintroduce it without a new
ruling.

WHAT THIS SCRIPT WILL NOT DO. It will not invent, reconstruct or approximate a
candidate text. It will not report a rate it did not measure. It will not run
without an explicit credential file. It aborts the sweep on the first quota 429
rather than burning the remainder. It retries nothing (a retry would silently
change K).

USAGE
    python3 option-s-runner.py run <candidate_id> <K> [--resume] [--yes]
    python3 option-s-runner.py sweep 10 [--resume] [--yes]   # K=10, ruled
    python3 option-s-runner.py summary <runs_dir>

  --resume  skip any candidate that already holds a COMPLETE series. Before
            this existed, a sweep dying at candidate 12 could be recovered only
            by re-running from scratch and appending: double-billing was the
            sole available recovery path.
  --yes     skip the interactive spend confirmation. Without it and without a
            tty, a sweep ABORTS rather than assume consent.
"""

import hashlib
import importlib.util
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
CANDIDATES_FILE = HERE / "option-s-candidates.json"
RUNS_DIR = HERE / "runs"
D6A_RUNNER = HERE.parent / "d6a" / "d6a-runner.py"

ENDPOINT = "https://www.sagereasoning.com/api/guardrail"
DEFAULT_CRED_FILE = Path.home() / ".sage-option-s-credential"
MAX_K = 25                 # D6a's ceiling; a live metered gate (PR19 DS-LOW)
CALL_SPACING_S = 6.0       # D6a's pre-auth IP-limiter spacing
# Measured per-call cost, corroborated at source by the 2026-09-05 PR19 review
# (24 x 10 = $3.4133; 29 x 3 = $1.2373, matching the ruling's verbatim
# "approximately 87 calls at approximately $1.24"). Used ONLY to print a dollar
# figure before a sweep -- `sweep 25` is 600 calls and previously announced no
# cost at all and asked for no confirmation.
COST_PER_CALL_USD = 0.014222
TIMEOUT_S = 120


class _RefuseRedirect(urllib.request.HTTPRedirectHandler):
    """Refuse 3xx rather than follow it.

    The previous code carried the comment "No redirect handler" above a bare
    `urllib.request.urlopen`, which is FALSE: urlopen uses the default opener,
    and the default opener installs HTTPRedirectHandler. A 2026-09-05 PR19
    reviewer confirmed against CPython source that it strips only
    `content-length` and `content-type`, so `Authorization` WOULD cross a
    redirect -- and this project runs an apex->www redirect. Following a 3xx
    also converts POST to GET, which is how D6a's round 4 found the route's own
    GET self-doc entering a series as a counted outcome.

    Refusing turns both hazards into a recorded failure record."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise urllib.error.HTTPError(
            req.full_url, code,
            f"redirect to {newurl} REFUSED: following it would carry the "
            f"Authorization header to a new host and convert POST to GET",
            headers, fp)


OPENER = urllib.request.build_opener(_RefuseRedirect)

# The floor class. ADR-010 sec 4's floors resolve to `reflexive`; this is the
# outcome M suppresses and W amplifies, so it is the quantity the election needs.
FLOOR_PROXIMITY = "reflexive"

# The canonical ordinal scale, transcribed from website/src/lib/guardrails.ts
# (PROXIMITY_RANK, read at source 2026-09-06). This file previously had NO
# ordinal scale at all, which is why `would_option_M_record` was a mode and
# `would_option_W_record` was the FIRST verdict rather than the worst
# (2026-09-05 PR19 blocker B3, reached independently by all three reviewers).
# Transcribed rather than imported because guardrails.ts is TypeScript; any
# divergence from that file is a defect in THIS constant.
PROXIMITY_RANK = {
    "reflexive": 0,
    "habitual": 1,
    "deliberate": 2,
    "principled": 3,
    "sage_like": 4,
}

# BLOCK SEMANTICS (2026-09-05 PR19 blocker B2). `meetsThreshold` in guardrails.ts
# is `rank >= rank(threshold)` and /api/guardrail defaults `threshold =
# 'deliberate'` (route.ts:116); this runner sends no threshold, so it gets that
# default. Therefore BOTH `reflexive` AND `habitual` are BLOCKED, and a
# floor-only count of `reflexive` cannot see a genuine 30% block rate.
#
# This runner does NOT re-derive the decision from proximity. The gate returns
# its own `proceed` boolean, which IS the decision, and additionally covers
# `tier1_pause` (proceed=false carrying no proximity at all) -- so B2 and B4
# collapse into one correct quantity, `p_hat_block`. DEFAULT_THRESHOLD and
# BLOCKED_PROXIMITIES are retained to DOCUMENT the block set on the output; they
# are never used to infer a decision.
DEFAULT_THRESHOLD = "deliberate"
BLOCKED_PROXIMITIES = tuple(
    prox for prox, rank in sorted(PROXIMITY_RANK.items(), key=lambda kv: kv[1])
    if rank < PROXIMITY_RANK[DEFAULT_THRESHOLD]
)

# Even-K median convention. K is ruled 10, which is EVEN, so the ordinal median
# is not unique. This instrument takes the LOWER of the two central values --
# the more conservative (closer-to-floor) reading -- consistent with this
# project's standing "conservative MIN, never an average" discipline for ordinal
# virtue quantities. STATED, not silent: it is a convention, it is published on
# the output as `M_even_K_convention`, and it is a live input to the deferred
# M/W/S election. If the mentor rules otherwise, this is the one place to change.
M_EVEN_K_CONVENTION = "lower_median"

# Outcomes admitted to the distribution, per D6a: a 200 with no proximity is the
# gate SPEAKING, not the transport failing. But only `verdict` outcomes carry a
# proximity, so only they enter a disagreement identity (PR19 DS-HIGH).
COUNTED = ("verdict", "tier1_pause", "engine_unavailable")

# The population for the DECISION (proceed/block) rate. `engine_unavailable`
# carries proceed=false, but D6a's round-3 correction is binding: an outage is
# "infrastructure, not a gate judgement about the frozen text", so counting its
# conservative false as a block would inflate the block rate with transport
# health. A `tier1_pause` IS a judgement about the text -- the tier-1 trigger is
# detected from that text's own extraction -- so it belongs. It is also the
# exact case 2026-09-05 PR19 blocker B4 named: a 5-5 pause/verdict split
# published as floor_count 0, disagreed_proceed false, "stable".
DECISION_KINDS = ("verdict", "tier1_pause")

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
A8_BOUND = ("A8 BOUND (ruled 2026-09-04, verified at source): no re-examination "
            "counter exists on any live path -- intervention-engine.ts's "
            "habitualReExaminationCount defaults to 0 and no live caller supplies "
            "it -- so the A8 escalation row (habitualStable / reflectReferral) "
            "CANNOT FIRE. Any policy this rate informs inherits that inertness.")
ELECTION_NEEDS = ("What the M/W/S election needs from this data, ruled 2026-09-04 so "
                  "the run is specified by its consumer: 'a per-input floor rate "
                  "across the decision-bearing population on real candidate texts, "
                  "at K=10, with the limits named in Q-S3 carried explicitly, and "
                  "with the A8 bound printed on the rate.' The run PRECEDES the "
                  "election and serves it.")

NOT_A_DECISION = ("Option S decides nothing. The FIRST verdict is operative. This "
                  "output is measurement, not an election between M, W and S.")


def ordinal_worst(ranked: list):
    """Worst-of-K: the LOWEST-ranked proximity present. 2026-09-05 PR19 blocker
    B3 -- the previous implementation returned prox[0], the FIRST verdict, so on
    [deliberate, habitual, deliberate] it reported `deliberate` when the true
    worst is `habitual` (blocked). It systematically UNDERSTATED W, and W's
    divergence from operative is a published input to the M/W/S election."""
    if not ranked:
        return None
    return min(ranked, key=lambda prox: PROXIMITY_RANK[prox])


def ordinal_median(ranked: list, convention: str = M_EVEN_K_CONVENTION):
    """Ordinal median of K proximities, DETERMINISTIC.

    2026-09-05 PR19 blocker B3: the previous implementation was a MODE, not a
    median, and its tie-break was `sorted(set(prox), key=prox.count)[-1]` --
    set() iteration order, which CPython salts per process. A reviewer ran that
    expression six times on a 3-3 split and got two different answers. K is
    ruled 10, which is EVEN, so a 5-5 split -- exactly the boundary M turns on
    -- landed in that branch. `summary` was therefore not reproducible across
    invocations on identical data, in an instrument whose entire subject is
    reproducibility.

    Sorting by rank is a total order on a set with no duplicates-by-key, so this
    is deterministic by construction, not by luck."""
    if not ranked:
        return None
    order = sorted(ranked, key=lambda prox: PROXIMITY_RANK[prox])
    n = len(order)
    if n % 2 == 1:
        return order[n // 2]
    lower, upper = order[n // 2 - 1], order[n // 2]
    if convention == "lower_median":
        return lower
    if convention == "upper_median":
        return upper
    raise ValueError(f"unknown even-K median convention: {convention!r}")


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


def deploy_identity() -> dict:
    """D6a safeguard 6, re-read PER CALL: a deploy landing mid-series would
    otherwise stamp every later record with the pre-series commit. Carried over
    verbatim in intent from d6a-runner.py, including its caveat -- the caveat is
    the point, not decoration."""
    env_id = os.environ.get("OPTION_S_DEPLOY_ID")
    if env_id:
        return {"deploy_id": env_id, "deploy_id_source": "vercel_dashboard"}
    try:
        sha = subprocess.run(["git", "rev-parse", "origin/main"],
                             capture_output=True, text=True, check=True,
                             cwd=HERE).stdout.strip()
        return {"deploy_id": sha, "deploy_id_source": "origin_main_proxy",
                "deploy_id_caveat": (
                    "local origin/main is not necessarily the deployed commit, "
                    "and without a fetch may not even be the latest pushed one; "
                    "drift attribution to a deploy must NOT be claimed from "
                    "this proxy")}
    except Exception as e:  # noqa: BLE001 -- recorded, never dropped
        return {"deploy_id": None, "deploy_id_source": "absent",
                "deploy_id_error": str(e)}


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
        # OPENER refuses 3xx outright -- see _RefuseRedirect. The previous
        # `urllib.request.urlopen` here used the DEFAULT opener, which follows
        # redirects and carries Authorization across them.
        with OPENER.open(req, timeout=TIMEOUT_S) as resp:
            raw = resp.read().decode("utf-8", "replace")
            status = resp.status
    except urllib.error.HTTPError as e:
        raw, status = e.read().decode("utf-8", "replace"), e.code
    except Exception as e:  # noqa: BLE001 -- transport, recorded not raised
        return {"requested_at": started, "http_status": None,
                "failure_kind": f"transport:{type(e).__name__}",
                "failure_note": (
                    "a timeout does NOT mean the gate did not process the call: "
                    "it likely consumed two quota units and wrote its "
                    "analytics_events and loop_billing_events rows"),
                "response_body_raw": "",
                "outcome_kind": "failure",
                **deploy_identity()}
    rec = {"requested_at": started, "http_status": status,
           # D6a safeguard 5: the FULL body is retained, always. A field-path
           # defect found later is unrecoverable from extracted fields alone,
           # and every one of these records is a paid call.
           "response_body_raw": raw,
           **deploy_identity()}
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


def read_series(candidate_id: str) -> dict:
    """Group a candidate's existing records by series_id. Returns
    {series_id: [records]}. Records written before series ids existed group
    under "unidentified" and are treated as one series."""
    path = RUNS_DIR / f"{candidate_id}.jsonl"
    if not path.exists():
        return {}
    out = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            rec = json.loads(line)
        except ValueError:
            continue
        out.setdefault(rec.get("series_id", "unidentified"), []).append(rec)
    return out


def complete_series(candidate_id: str) -> list:
    """Series ids for this candidate that already hold a FULL intended_k of
    records. The unit of idempotency: a partial series is never topped up (its
    later calls would sit on a different deploy and a different hour), it is
    left as evidence and a fresh series is started."""
    done = []
    for sid, recs in read_series(candidate_id).items():
        intended = recs[0].get("intended_k")
        if intended and len(recs) >= intended:
            done.append(sid)
    return done


def run_series(candidate_id: str, k: int, token: str, agent_id: str,
               doc: dict, cands: list, resume: bool = False) -> str:
    match = [c for c in cands if c["id"] == candidate_id]
    if not match:
        sys.exit(f"ABORT: no candidate {candidate_id}.")
    c = match[0]
    freeze_check(doc, c)
    out_path = RUNS_DIR / f"{candidate_id}.jsonl"
    RUNS_DIR.mkdir(exist_ok=True)

    # IDEMPOTENCY (2026-09-05 PR19, "not blockers" section): before this, a
    # sweep dying at candidate 12 could be recovered ONLY by re-running from
    # scratch and appending -- double-billing was the sole available recovery
    # path. With --resume, a candidate that already holds a complete series is
    # skipped and costs nothing.
    if resume:
        done = complete_series(candidate_id)
        if done:
            print(f"{candidate_id}: SKIP -- complete series already present "
                  f"({', '.join(sid[:8] for sid in done)}). No calls made.",
                  file=sys.stderr)
            return str(out_path)

    # D6a safeguard 1: a series id, so same-day re-runs are never pooled and an
    # aborted series is identifiable as one.
    series_id = str(uuid.uuid4())
    print(f"{candidate_id}: series {series_id}, K={k} ({k * 2} quota units)",
          file=sys.stderr)

    with out_path.open("a", encoding="utf-8") as fh:
        for i in range(k):
            rec = call_gate(c["text"], agent_id, token)
            rec.update({"candidate_id": candidate_id, "series_id": series_id,
                        "call_index": i,
                        "intended_k": k,
                        "frozen_text_sha256": c["frozen_text_sha256"],
                        "decision_role": c.get("decision_role"),
                        "recorded_proximity": c.get("recorded_proximity")})
            fh.write(json.dumps(rec) + "\n")
            # D6a safeguard 2: this record represents a PAID live call that
            # cannot be recovered by re-reading anything. Buffered close is safe
            # against a process crash but not a machine-level one.
            fh.flush()
            os.fsync(fh.fileno())

            kind = rec.get("outcome_kind")
            # D6a safeguard 4: the strict-field check runs on EVERY call, not
            # only the first -- a first-call-only check goes silent exactly when
            # a mid-series shape change fires, which is the event this
            # instrument exists to detect. Only a `verdict` is expected to carry
            # all the fields; a pause or an outage legitimately carries none.
            # `is None` is load-bearing: `proceed` is a boolean and False is a
            # legitimate value.
            if kind == "verdict":
                nulls = [f for f in D6A.STRICT_FIELDS
                         if (rec.get("fields") or {}).get(f) is None]
                if nulls and i == 0:
                    sys.exit(f"ABORT: first call of {candidate_id} recorded "
                             f"null for {nulls} -- field-path or instrument "
                             f"defect; fix before any run counts as evidence.")
                if nulls:
                    print(f"  SHAPE-DRIFT WARNING: call {i} recorded null for "
                          f"{nulls}. Recorded, not halted -- this series' later "
                          f"records are suspect.", file=sys.stderr)
            # D6a safeguard 3: a first call that outright failed means the
            # series never started; do not spend the remaining K-1.
            elif i == 0 and kind == "failure":
                sys.exit(f"ABORT: first call of {candidate_id} failed "
                         f"({rec.get('failure_kind')}); series not started.")

            if rec.get("failure_kind") == "quota_429":
                sys.exit(f"ABORT: quota exhausted at {candidate_id} call {i}. "
                         f"Sweep stopped rather than burning the remainder. "
                         f"Series {series_id} is INCOMPLETE and is excluded "
                         f"from the summary's strata. Resize the credential and "
                         f"re-run with --resume.")
            if i < k - 1:
                time.sleep(CALL_SPACING_S)
    return str(out_path)


def l4_status() -> str:
    """L4 read from the CANDIDATES FILE rather than restated.

    2026-09-05 PR19: `summary()` never opened option-s-candidates.json, so it
    emitted LIMIT_4 as OPEN and restated 29 even though the set had been
    populated at 4cb2008. The artifact reaching the M/W/S election would have
    asserted a live open question that production had already closed."""
    try:
        doc = json.loads(CANDIDATES_FILE.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001 -- reported, never guessed
        return f"{L4}\n\nSTATUS UNREADABLE: {CANDIDATES_FILE.name}: {e}"
    cands = [c for c in doc.get("candidates", []) if c.get("text")]
    roles = {}
    for c in cands:
        roles[c.get("decision_role")] = roles.get(c.get("decision_role"), 0) + 1
    breakdown = ", ".join(f"{k}={v}" for k, v in
                          sorted(roles.items(), key=lambda kv: str(kv[0])))
    return (f"{L4}\n\nRESOLVED BY DATA at summary time: the populated candidate "
            f"file holds {len(cands)} candidates carrying text ({breakdown}). "
            f"The ruling's 29 is not what was measured; this figure is. Read the "
            f"discrepancy as settled against the populated set, not as open.")


def summary(runs_dir: str) -> None:
    d = Path(runs_dir)
    if not d.exists():
        sys.exit(f"ABORT: {d} not found.")
    files = sorted(d.glob("*.jsonl"))
    if not files:
        sys.exit(f"ABORT: no run records in {d}. This script never reports a "
                 f"rate it did not measure.")
    per_input, parsed_any, excluded = [], False, []
    for f in files:
        recs = []
        for line in f.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                recs.append(json.loads(line))
            except ValueError:
                continue          # D6a's malformed-line tolerance
        # SERIES-AWARE SELECTION. Records carry a series_id (D6a safeguard 1).
        # Without this the file was pooled wholesale, so an aborted sweep
        # followed by a re-run produced ONE input with n = 15 assembled from two
        # partial series taken hours apart and possibly across a deploy. D6a's
        # own rule is explicit: an incomplete series "must not be pooled into a
        # distribution". Only a COMPLETE series enters the strata; where more
        # than one is complete the EARLIEST is operative, consistent with this
        # instrument's first-verdict-is-operative discipline.
        by_series = {}
        for r in recs:
            by_series.setdefault(r.get("series_id", "unidentified"), []).append(r)
        complete = [(sid, rs) for sid, rs in by_series.items()
                    if rs[0].get("intended_k")
                    and len(rs) >= rs[0]["intended_k"]]
        dropped = [sid for sid in by_series
                   if sid not in {sid_c for sid_c, _ in complete}]
        if not complete:
            excluded.append({"candidate_id": f.stem,
                             "reason": "no complete series",
                             "series_seen": sorted(by_series),
                             "records_present": len(recs)})
            continue
        series_id, recs = min(
            complete, key=lambda pair: pair[1][0].get("requested_at") or "")
        other_complete = sorted(sid for sid, _ in complete if sid != series_id)
        counted = [r for r in recs if r.get("outcome_kind") in COUNTED]
        if not counted:
            continue
        parsed_any = True
        verdicts = [r for r in counted if r.get("outcome_kind") == "verdict"]
        prox = [(r.get("fields") or {}).get("katorthoma_proximity")
                for r in verdicts]
        prox = [p for p in prox if p]
        # Shape drift is SURFACED, never silently dropped: a proximity the
        # canonical scale does not know would otherwise vanish from the median
        # and the worst without trace.
        ranked = [p for p in prox if p in PROXIMITY_RANK]
        unranked = sorted({p for p in prox if p not in PROXIMITY_RANK})
        # B4: `proceed` is read across the DECISION population, not off verdicts
        # alone. A tier1_pause carries proceed=false and no proximity at all.
        decisions = [r for r in counted
                     if r.get("outcome_kind") in DECISION_KINDS]
        proceeds = [(r.get("fields") or {}).get("proceed") for r in decisions]
        proceeds = [p for p in proceeds if isinstance(p, bool)]
        n_dec = len(proceeds)
        block_n = sum(1 for p in proceeds if p is False)
        floor_n = sum(1 for p in prox if p == FLOOR_PROXIMITY)
        # Descriptive only, so a reader can see what `habitual` contributes:
        # this is NOT how the block rate is computed (that comes from the gate's
        # own `proceed`), it is the proximity-side view of the same population.
        blocked_prox_n = sum(1 for p in prox if p in BLOCKED_PROXIMITIES)
        n_v = len(prox)
        intended = recs[0].get("intended_k") if recs else None
        dist = {}
        for pval in prox:
            dist[pval] = dist.get(pval, 0) + 1
        # What M and W WOULD have recorded -- the quantities the election needs.
        # Both are now ORDINAL over PROXIMITY_RANK and deterministic (B3).
        would_M = ordinal_median(ranked)
        would_W = ordinal_worst(ranked)
        per_input.append({
            "candidate_id": f.stem,
            "series_id": series_id,
            "other_complete_series_not_used": other_complete,
            "incomplete_series_excluded": sorted(dropped),
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
            # THE PER-PROBE DISTRIBUTION. Ruled 2026-09-05 to be what replaces
            # the removed directional decomposition, so it is the primary
            # per-input output, published in both orders (as observed, and as
            # counts).
            "proximities": prox,
            "proximity_distribution": dist,
            "unranked_proximities": unranked,
            "floor_count": floor_n,
            "p_hat_floor": (floor_n / n_v) if n_v else None,
            # B2: the DECISION rate, taken from the gate's own `proceed`. This
            # is the quantity a floor-only count could not see -- an input
            # returning deliberate x7 / habitual x3 is a genuine 30% block and
            # published as p_hat_floor 0.0.
            "n_decisions": n_dec,
            "block_count": block_n,
            "p_hat_block": (block_n / n_dec) if n_dec else None,
            "blocked_proximity_count_DESCRIPTIVE": blocked_prox_n,
            "operative": prox[0] if prox else None,
            "distinct_proximities": sorted(set(prox)),
            "disagreed_proximity": len(set(prox)) > 1,
            # `direction` REMOVED 2026-09-05 by mentor ruling -- the split was a
            # pure function of floor_n*2 vs n_v on a set selected on that very
            # variable, so it reported the set's composition as a finding. Do
            # not reintroduce without a new ruling. B1 is moot by removal.
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
        dis_p = sum(1 for r in rows if r["disagreed_proceed"])
        tot_v = sum(r["n_verdicts"] for r in rows)
        tot_f = sum(r["floor_count"] for r in rows)
        tot_d = sum(r["n_decisions"] for r in rows)
        tot_b = sum(r["block_count"] for r in rows)
        blo, bhi = D6A.wilson_interval(tot_b, tot_d) if tot_d else (None, None)
        return {"stratum": label, "inputs": n, "inputs_disagreeing": dis,
                "per_input_disagreement_rate": (dis / n) if n else None,
                "wilson_95": {"low": lo, "high": hi},
                "inputs_disagreeing_on_proceed": dis_p,
                "verdicts": tot_v, "floors": tot_f,
                "pooled_p_hat_floor": (tot_f / tot_v) if tot_v else None,
                # B2/B4. The decision-level quantity, from the gate's own
                # `proceed` over verdicts + tier-1 pauses. Outages excluded.
                "decisions": tot_d, "blocks": tot_b,
                "pooled_p_hat_block": (tot_b / tot_d) if tot_d else None,
                "pooled_p_hat_block_wilson_95": {"low": blo, "high": bhi},
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
        "headline_quantity": "TWO quantities, and they are not the same. "
                             "pooled_p_hat_floor is the per-sample rate of the "
                             "ADR-010 sec 4 floor (`reflexive`) -- the outcome M "
                             "suppresses and W amplifies. pooled_p_hat_block is "
                             "the per-sample rate at which the gate actually "
                             "REFUSED, taken from its own `proceed`. They differ "
                             "whenever `habitual` or a tier-1 pause occurs, and "
                             "before 2026-09-06 only the first existed, so a "
                             "genuine 30% block rate could publish as 0.0 "
                             "(2026-09-05 PR19 blockers B2 and B4). The binary "
                             "disagreement rate is secondary; M and W are "
                             "functions of p, not of the flag.",
        "block_semantics": (f"BLOCKED = the gate's own `proceed` is false. "
                            f"/api/guardrail defaults threshold="
                            f"'{DEFAULT_THRESHOLD}' and meetsThreshold is "
                            f"rank >= rank(threshold), so the blocked proximity "
                            f"set is {list(BLOCKED_PROXIMITIES)} -- `habitual` "
                            f"blocks and is NOT the ADR-010 floor. This runner "
                            f"sends no threshold, so it receives that default. "
                            f"The decision rate is read from `proceed` and never "
                            f"re-derived from rank."),
        "decision_population": (f"{list(DECISION_KINDS)} -- `engine_unavailable` "
                                f"is COUNTED and reported but EXCLUDED from the "
                                f"block rate: D6a's round-3 correction holds an "
                                f"outage is infrastructure, not a gate judgement "
                                f"about the frozen text, and its conservative "
                                f"proceed=false would inflate the rate with "
                                f"transport health."),
        "M_even_K_convention": (f"{M_EVEN_K_CONVENTION} -- K is ruled 10, which "
                                f"is EVEN, so the ordinal median is not unique. "
                                f"The LOWER (closer-to-floor) central value is "
                                f"taken, consistent with this project's standing "
                                f"conservative-MIN-never-an-average discipline. "
                                f"This is a CONVENTION, not a ruling, and it is a "
                                f"live input to the M/W/S election -- if the "
                                f"mentor rules otherwise, change "
                                f"M_EVEN_K_CONVENTION."),
        "directional_decomposition": ("REMOVED by mentor ruling 2026-09-05 "
                                      "(2026-09-05-mentor-rulings-five-relays-"
                                      "verbatim.md Part 1): 'The decomposition is "
                                      "removed. Per-probe distributions replace "
                                      "it.' The split was a pure function of "
                                      "floor_n*2 vs n_v on a set selected on that "
                                      "very variable, so it reported the set's "
                                      "composition back as a measurement. The "
                                      "per-input `proximities` and "
                                      "`proximity_distribution` fields are what "
                                      "replace it."),
        "strata": strata,
        "per_input": per_input,
        "inputs_excluded_no_complete_series": excluded,
        "LIMIT_1_closed_run_population": L1,
        "LIMIT_2_submitted_payload_fidelity": L2,
        "LIMIT_3_selection_on_dependent_variable": L3,
        "LIMIT_4_set_size_discrepancy": l4_status(),
        "LIMIT_6_instrument_drift": L6,
        "LIMIT_7_variance_multi_channel": L7,
        "A8_BOUND": A8_BOUND,
        "WHAT_THE_ELECTION_NEEDS": ELECTION_NEEDS,
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


def confirm_spend(n_calls: int, k: int, n_cands: int) -> None:
    """Announce the DOLLAR figure and require an explicit go-ahead.

    2026-09-05 PR19 ("also reported"): there was no confirmation gate and no
    dollar figure in the pre-flight line -- `sweep 25` is 600 calls, about
    $8.53, and it simply started. Fails CLOSED: with no tty and no --yes, it
    aborts rather than assuming consent."""
    usd = n_calls * COST_PER_CALL_USD
    print(f"\nABOUT TO SPEND on the LIVE metered gate:\n"
          f"  {n_cands} candidates x K={k} = {n_calls} calls\n"
          f"  {n_calls * 2} quota units\n"
          f"  approximately ${usd:.2f} at ${COST_PER_CALL_USD}/call\n",
          file=sys.stderr)
    if "--yes" in sys.argv:
        print("  --yes given; proceeding.", file=sys.stderr)
        return
    if not sys.stdin.isatty():
        sys.exit("ABORT: no tty and no --yes. This script never starts a paid "
                 "sweep on an assumption of consent.")
    if input("  Type PROCEED to continue: ").strip() != "PROCEED":
        sys.exit("ABORT: not confirmed. No calls made.")


def main() -> None:
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    resume = "--resume" in sys.argv
    if len(a) >= 3 and a[0] == "run":
        doc = load_doc(); cands = require_populated(doc)
        k = int(a[2])
        if not 2 <= k <= MAX_K:
            sys.exit(f"ABORT: K must be 2..{MAX_K}.")
        # Mirror sweep's discipline (PR19 2026-09-06, LOW): resolve the
        # candidate and the resume-skip BEFORE confirming, so the figure shown
        # is the spend that will actually happen. Announcing K calls for a
        # candidate that will make zero is the same small dishonesty the sweep
        # branch already avoids.
        if not any(c["id"] == a[1] for c in cands):
            sys.exit(f"ABORT: no candidate {a[1]}.")
        if resume and complete_series(a[1]):
            print(f"{a[1]}: already holds a complete series; nothing to do. "
                  f"No calls made.", file=sys.stderr)
            print(str(RUNS_DIR / f"{a[1]}.jsonl"))
            return
        m = doc.get("_meta", {})
        confirm_spend(k, k, 1)
        print(run_series(a[1], k, read_credential(),
                         m.get("agent_id", "sagereasoning:option-s@v1"), doc,
                         cands, resume=resume))
    elif len(a) >= 2 and a[0] == "sweep":
        doc = load_doc(); cands = require_populated(doc)
        k = int(a[1])
        if not 2 <= k <= MAX_K:
            sys.exit(f"ABORT: K must be 2..{MAX_K}.")
        # With --resume the pre-flight figure must reflect what will ACTUALLY be
        # spent, not the full sweep: quoting the whole sweep's cost when most of
        # it is already paid for would be its own small dishonesty.
        pending = [c for c in cands
                   if not (resume and complete_series(c["id"]))]
        if resume and len(pending) != len(cands):
            print(f"--resume: {len(cands) - len(pending)} of {len(cands)} "
                  f"candidates already hold a complete series and will be "
                  f"skipped.", file=sys.stderr)
        if not pending:
            sys.exit("Nothing to do: every candidate already holds a complete "
                     "series. No calls made.")
        tok = read_credential()
        agent = doc.get("_meta", {}).get("agent_id", "sagereasoning:option-s@v1")
        confirm_spend(len(pending) * k, k, len(pending))
        for c in pending:                     # PR19: all three found sweep ran only [0]
            print(run_series(c["id"], k, tok, agent, doc, cands, resume=resume),
                  file=sys.stderr)
            time.sleep(CALL_SPACING_S)
    elif len(a) >= 2 and a[0] == "summary":
        summary(a[1])
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
