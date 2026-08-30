#!/usr/bin/env python3
"""R8-D6a verdict-repeatability runner — probes the LIVE /api/guardrail.

Built 2026-08-30 under the D6a build prompt
(operations/handoffs/founder/2026-08-30-R8-D6a-verdict-repeatability-instrument-BUILD-NEXT-SESSION-PROMPT.md),
then substantially rewritten the same day after three independent PR19
reviewers returned 4 HIGH and a long MEDIUM tail against the first version.
Findings folded are cited inline as (PR19 <id>).

MEASURE-only: this script submits fixed frozen texts to the live gate and
records responses. Nothing consumes its output as a signal into generation or
election (binding boundary, build prompt section A). It changes no gate
behaviour.

USAGE — one probe per invocation. Chunking is deliberate: at pilot latency
(14.5-19.1s/call) plus 6s spacing, K=10 is ~4 min, and the 120s per-call
timeout makes the worst case ~21 min against a 10-minute tool ceiling. Run
probes as separate invocations, or in the background.

    python3 d6a-runner.py run <probe_id> <K>
    python3 d6a-runner.py summary <runs_dir>

CREDENTIAL. Read from a gitignored file, NOT the command line: an inline
`D6A_PROBE_CREDENTIAL=sr_prac_... python3 ...` writes a live production token
into shell history, and this project had a public-credential-exposure incident
on 2026-07-17 (PR19 M9). Default path below; override with D6A_CREDENTIAL_FILE.
There is NO fallback to the dogfood credential — identity separation per the
build prompt's Q1c note.

QUOTA — SIZE THE CREDENTIAL BEFORE RUNNING (PR19 M7 / 10a). Every metered call
consumes TWO quota units, not one: `increment_api_usage` fires in
validateApiKey AND again in recordLoopBilling on the live CI-10 path. So:

    quota units = probes x K x 2

The frozen 7-probe set at K=10 is 70 calls = 140 units. A credential minted at
the CI-6 free-tier defaults (monthly 30 / daily 1) is exhausted at 15 calls,
and a single K=10 series is 20 units against a daily of 1. Raising limits and
reading the stored row back is a founder-walked Critical step; this script
refuses to guess and will abort the series on the first quota 429 rather than
burn the remainder (PR19 L19).

Field paths. Each was resolved by reading the named source file in the
2026-08-30 build session; the check is recorded next to the claim rather than
deferred to another document (PR25, tightened after PR19 8b):
  - Envelope {result, meta} — read of buildEnvelope's return in
    lib/response-envelope.ts and its call in the guardrail route.
  - Verdict fields under result.* — read of the route's resultBody assembly.
  - proximity_floors: result.signed_assessment.assessment.proximity_floors
    when signing is ON (production), else result.assessment.proximity_floors —
    read of layer2-signer.ts, whose sign function returns
    {assessment, signature, key_id}, i.e. one level deeper.
  - meta.ai_model (NOT meta.model_used, which is emitted nowhere and appears
    only in a stale header comment — PR19 F1/M4/8a, which found the first
    version recording a permanent silent null here).
  - meta.cost_usd is a BODY field (CI-8). On the LIVE sandwich branch a null
    means the ENGINE WAS UNAVAILABLE, not a cache hit — guardrail-sandwich.ts
    has no response cache; the cache-hit story belongs to the dark legacy
    runSageReason path (PR19 F2).
  - The IP-keyed limiter (RATE_LIMITS.publicAgent, 30 req/60s) is checked
    BEFORE auth in the route — read of the route's first two statements. This
    is why calls are sequential with 6s spacing: a REQUIREMENT carried from the
    pilot, not a nicety.
  - agent_id is sent in every payload so the unconditional analytics_events
    insert is excludable. It also reaches loop_billing_events via the loop
    accumulator (PR19 F4), so BOTH tables' probe rows are excludable by it. It
    is not validated, not passed to the sandwich, and not in the extraction
    context, so it does not perturb the verdict.

THREE OUTCOME KINDS, not two (PR19 H1 — the worst defect in the first
version). runGuardrailSandwich can return tier1_pause and engine_unavailable.
Both are HTTP 200 with katorthoma_proximity null and proceed false. The first
version counted them as transport failures, so a probe that paused on 2 of 10
runs — which IS verdict variance, the proceed flag flipping on frozen text —
reported a disagreement rate of ZERO. That would have made the binding public
number dishonest in exactly the direction the disclosure ruling exists to
prevent. Outcomes are now classified as verdict / tier1_pause /
engine_unavailable / failure, and the first three all count in the
distribution.
"""

import hashlib
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROBES_FILE = HERE / "d6a-probes.json"
ENDPOINT = "https://www.sagereasoning.com/api/guardrail"
AGENT_ID = "sagereasoning:d6a-probe@v1"
SPACING_SECONDS = 6
TIMEOUT_SECONDS = 120
MAX_K = 25  # hard ceiling on calls per invocation at a live metered gate
DEFAULT_CRED_FILE = Path.home() / ".sage-d6a-probe-credential"

# Fields whose absence means the instrument is broken rather than the gate
# having spoken. Checked on EVERY call, not only the first (PR19 M5: a
# first-call-only check goes silent exactly when a mid-series shape change
# fires, which is the event this instrument exists to detect).
STRICT_FIELDS = [
    "katorthoma_proximity",
    "proceed",
    "proximity_floors",
    "extraction",
    "cost_usd",
    "ai_model",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_probes() -> dict:
    return json.loads(PROBES_FILE.read_text())


def load_probe(probe_id: str) -> dict:
    for p in load_probes()["probes"]:
        if p["id"] == probe_id:
            return p
    sys.exit(f"ABORT: unknown probe id {probe_id!r}. Known: "
             + ", ".join(p["id"] for p in load_probes()["probes"]))


def read_credential() -> str:
    path = Path(os.environ.get("D6A_CREDENTIAL_FILE", DEFAULT_CRED_FILE))
    if not path.exists():
        sys.exit(
            f"ABORT: no credential file at {path}. Write the dedicated probe\n"
            "credential there (chmod 600) — do NOT pass it on the command\n"
            "line (PR19 M9). The mint and its limit-raise are founder-walked\n"
            "Critical steps; this script mints nothing.")
    cred = path.read_text().strip()
    if not cred:
        sys.exit(f"ABORT: credential file {path} is empty.")
    return cred


def deploy_identity() -> dict:
    """Re-read per call (PR19 M6): a deploy landing mid-series would otherwise
    stamp every later record with the pre-series commit."""
    env_id = os.environ.get("D6A_DEPLOY_ID")
    if env_id:
        return {"deploy_id": env_id, "deploy_id_source": "vercel_dashboard"}
    try:
        sha = subprocess.run(
            ["git", "rev-parse", "origin/main"],
            capture_output=True, text=True, check=True, cwd=HERE,
        ).stdout.strip()
        return {
            "deploy_id": sha,
            "deploy_id_source": "origin_main_proxy",
            "deploy_id_caveat": (
                "local origin/main is not necessarily the deployed commit, and "
                "without a fetch may not even be the latest pushed one; drift "
                "attribution to a deploy must NOT be claimed from this proxy "
                "(build prompt section A verified blocker)"
            ),
        }
    except Exception as e:  # recorded, never dropped
        return {"deploy_id": None, "deploy_id_source": "absent",
                "deploy_id_error": str(e)}


def extract_fields(body: dict) -> dict:
    """Pull the discriminating fields from the envelope. Never raises — a
    missing path yields None, which the per-call assertion then catches."""
    result = body.get("result") or {}
    meta = body.get("meta") or {}
    signed = result.get("signed_assessment") or {}
    floors = (signed.get("assessment") or {}).get("proximity_floors")
    if floors is None:
        floors = (result.get("assessment") or {}).get("proximity_floors")
    extraction = result.get("extraction")
    urgency = extraction.get("urgency_indicators") if isinstance(
        extraction, dict) else None
    return {
        "katorthoma_proximity": result.get("katorthoma_proximity"),
        "proceed": result.get("proceed"),
        "recommendation": result.get("recommendation"),
        "is_kathekon": result.get("is_kathekon"),
        "assessment_status": result.get("assessment_status"),
        "proximity_floors": floors,
        "extraction": extraction,
        "urgency_indicators": urgency,
        "cost_usd": meta.get("cost_usd"),
        "ai_model": meta.get("ai_model"),
    }


def classify_outcome(rec: dict) -> str:
    """verdict | tier1_pause | engine_unavailable | failure (PR19 H1).

    A 200 with no proximity is the gate SPEAKING (a tier-1 clarification pause
    or an engine outage producing a conservative fallback), not the transport
    failing. Those are outcomes on frozen text and belong in the distribution;
    filing them as failures understated disagreement to zero in the first
    version."""
    if rec.get("http_status") != 200 or "fields" not in rec:
        return "failure"
    f = rec["fields"]
    if f.get("katorthoma_proximity"):
        return "verdict"
    status = (f.get("assessment_status") or "").lower()
    if "tier1" in status or "clarif" in status:
        return "tier1_pause"
    if "unavailable" in status or f.get("cost_usd") is None:
        return "engine_unavailable"
    return "tier1_pause"


def classify_failure(code, raw_body: str) -> str:
    """Quota 429 vs IP-limiter 429 vs 503 flavours (PR19 L13, L15).

    Read of src/lib/security.ts on 2026-08-30, in validateApiKeyUpc (the live
    validator for an sr_prac_ credential) and checkRateLimit: the daily body is
    error 'Daily limit exceeded'; the monthly body is error 'Monthly QUOTA
    exceeded' — not 'limit', which the first version misquoted — and the IP
    limiter is 'Too many requests. Please try again later.'"""
    lower = (raw_body or "").lower()
    if code == 429:
        if "daily limit" in lower or "monthly quota" in lower \
                or "monthly limit" in lower:
            return "quota_429"
        if "too many requests" in lower:
            return "rate_limit_429"
        return "unclassified_429"
    if code == 503:
        if "signing" in lower:
            return "signing_unavailable_503"
        if "rate limit system" in lower:
            return "quota_system_offline_503"
        return "unclassified_503"
    return f"http_{code}"


def run_series(probe_id: str, k_raw: str) -> None:
    try:
        k = int(k_raw)
    except ValueError:
        sys.exit(f"ABORT: K must be an integer, got {k_raw!r}")
    if k < 1 or k > MAX_K:  # PR19 M12: unbounded K at a live metered gate
        sys.exit(f"ABORT: K must be between 1 and {MAX_K}, got {k}")

    cred = read_credential()
    probe = load_probe(probe_id)
    text = probe["text"]

    actual_bytes = len(text.encode("utf8"))
    if actual_bytes != probe["bytes"]:
        sys.exit(f"ABORT: probe {probe_id} text is {actual_bytes} bytes, "
                 f"frozen record says {probe['bytes']} — the probe file has "
                 "drifted; a changed probe is a NEW probe (one-way freeze).")
    if len(text) >= 5000:
        sys.exit("ABORT: probe text at/over the 5000-char action ceiling")

    # The freeze is enforced by recording, not by prose (PR19 7a/M11: the
    # first version's _meta claimed a `series_started` mechanism the runner
    # never wrote). The text hash rides EVERY record, so a probe edited
    # between run 1 and run 20 is self-evident in the series rather than
    # requiring git archaeology against a file the discipline assumes nobody
    # edits (PR19 7b).
    text_sha = hashlib.sha256(text.encode("utf8")).hexdigest()
    stamp_first_run(probe_id, text_sha)

    series_id = str(uuid.uuid4())  # PR19 H2: same-day re-runs must not pool
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    out_dir = HERE / "runs" / day
    out_dir.mkdir(parents=True, exist_ok=True)
    jsonl = out_dir / f"{probe_id}.jsonl"

    payload = json.dumps({"action": text, "agent_id": AGENT_ID}).encode("utf8")
    print(f"{probe_id}: series {series_id}, K={k} "
          f"({k * 2} quota units), text sha256 {text_sha[:12]}", flush=True)

    for i in range(1, k + 1):
        rec = {
            "probe_id": probe_id,
            "series_id": series_id,
            "intended_k": k,
            "run_index": i,
            "timestamp_utc": utc_now(),
            "probe_text_sha256": text_sha,
            **deploy_identity(),
        }
        req = urllib.request.Request(
            ENDPOINT, data=payload, method="POST",
            headers={"Content-Type": "application/json", "X-Api-Key": cred},
        )
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
                raw = resp.read().decode("utf8")
                rec["http_status"] = resp.status
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf8", errors="replace")
            rec["http_status"] = e.code
            rec["failure"] = classify_failure(e.code, raw)
        except Exception as e:
            raw = ""
            rec["http_status"] = None
            rec["failure"] = f"transport_error: {e}"
            rec["failure_note"] = (
                "a timeout does NOT mean the gate did not process the call: "
                "it likely consumed two quota units and wrote its "
                "analytics_events and loop_billing_events rows (PR19 L18)")

        rec["response_body_raw"] = raw  # full body retained, always
        if rec.get("http_status") == 200:
            try:
                rec["fields"] = extract_fields(json.loads(raw))
            except Exception as e:
                rec["failure"] = f"parse_error: {e}"
        rec["outcome_kind"] = classify_outcome(rec)

        with jsonl.open("a") as f:
            f.write(json.dumps(rec) + "\n")

        kind = rec["outcome_kind"]
        detail = rec.get("failure") or (
            f"{rec['fields']['katorthoma_proximity']} / "
            f"proceed={rec['fields']['proceed']}" if "fields" in rec else "")
        print(f"{probe_id} run {i}/{k}: HTTP {rec['http_status']} "
              f"[{kind}] {detail}", flush=True)

        # Instrument-integrity check, EVERY call (PR19 M5). Only a `verdict`
        # outcome is expected to carry all the fields; a pause or an outage
        # legitimately carries none, and misreporting that as an instrument
        # defect sends an operator hunting a bug that isn't there (PR19 H1's
        # second face). `is None` is load-bearing and must not be
        # "simplified" to a truthiness test: `proceed` is a boolean and False
        # is the expected value on the floor-anchor probe (PR19 N23).
        if kind == "verdict":
            nulls = [f for f in STRICT_FIELDS if rec["fields"].get(f) is None]
            if nulls and i == 1:
                sys.exit(f"ABORT: first call recorded null for {nulls} — "
                         "field-path or instrument defect; fix before any run "
                         "counts as evidence (build prompt section C.2).")
            if nulls:
                print(f"  SHAPE-DRIFT WARNING: run {i} recorded null for "
                      f"{nulls}. The response shape may have changed "
                      "mid-series. Recorded, not halted — but this series' "
                      "later runs are suspect.", flush=True)
        elif i == 1 and kind == "failure":
            sys.exit(f"ABORT: first call of {probe_id} failed "
                     f"({rec.get('failure')}); series not started.")

        if rec.get("failure") == "quota_429":
            # Every remaining call is a guaranteed 429 that still burns
            # monthly quota (increment-then-check), so stop (PR19 L19).
            sys.exit(f"ABORT: quota exhausted at run {i}/{k}. Series "
                     f"{series_id} is INCOMPLETE and must not be pooled into "
                     "a distribution. Raise the credential's limits (calls x "
                     "2 units), verify by reading the row back, and re-run.")

        if i != k:
            time.sleep(SPACING_SECONDS)


def stamp_first_run(probe_id: str, text_sha: str) -> None:
    """Make the one-way freeze real: record when a probe's series began and
    the hash it began on (PR19 7a/M11 — the first version declared this
    mechanism in prose and implemented none of it). After this stamp, editing
    the text changes the hash and every later run records the mismatch."""
    data = load_probes()
    changed = False
    for p in data["probes"]:
        if p["id"] == probe_id:
            if p.get("series_started") is None:
                p["series_started"] = utc_now()
                p["frozen_text_sha256"] = text_sha
                # The CLASS freezes with the text (founder-approved 2026-08-30,
                # recommendation 6). Reclassifying a probe after seeing its
                # results is post-hoc selection on the number destined for
                # publication: dropping a low-variance probe from the
                # borderline set raises the rate, adding one lowers it, and
                # either move is defensible-sounding after the fact. If the
                # run falsifies the class definition, that is REPORTED as a
                # finding alongside the rate as-defined — never fixed by
                # re-partitioning.
                p["frozen_class"] = p["class"]
                changed = True
            elif p.get("frozen_text_sha256") not in (None, text_sha):
                sys.exit(
                    f"ABORT: probe {probe_id} text hash has changed since its "
                    f"series began on {p['series_started']}. The freeze is "
                    "ONE-WAY: a changed probe is a NEW probe with a new id "
                    "and its own series, never an edit.")
    if changed:
        PROBES_FILE.write_text(json.dumps(data, indent=2) + "\n")


def summary(runs_dir: str) -> None:
    """Emit the NAMED aggregate outputs (binding: the disagreement rate must be
    a named output, not merely derivable — 2026-08-30 disclosure ruling)."""
    base = Path(runs_dir)
    if not base.is_dir():  # PR19 L17
        sys.exit(f"ABORT: {base} is not a directory")

    meta = load_probes()["_meta"]
    probes_meta = {p["id"]: p for p in load_probes()["probes"]}
    per_probe, malformed_lines = {}, 0
    deploy_ids = set()
    # A probe's class for aggregation purposes is the one frozen at its first
    # run, NOT the current `class` field — so editing `class` after seeing
    # results cannot move the published rate (founder-approved 2026-08-30,
    # recommendation 6). Any divergence is surfaced, not silently honoured.
    reclassified = [
        p["id"] for p in probes_meta.values()
        if p.get("frozen_class") and p["frozen_class"] != p["class"]
    ]
    # R3-F1 (PR19 round 3): the anti-reclassification guard rested entirely on
    # an OPTIONAL field that whoever edits `class` also controls. Deleting
    # frozen_class disarmed detection (`p.get(...) and ...` is False) AND
    # activated the edit (aggregation `or`-falls back to live `class`).
    # Demonstrated: deleting it on p5-force and relabelling it an anchor moved
    # the published rate 12% -> 7.5% with reclassified_probes_ignored empty,
    # balanced true, complete true, and no warning. A probe that has RUN but
    # carries no frozen class is therefore treated as a falsification.
    missing_frozen = sorted({
        pid for pid in {jf.stem for jf in base.glob("*.jsonl")}
        if pid in probes_meta and not probes_meta[pid].get("frozen_class")})

    for jsonl in sorted(base.glob("*.jsonl")):
        pid = jsonl.stem
        by_series = {}
        for line in jsonl.read_text().splitlines():
            try:
                rec = json.loads(line)
            except Exception:
                malformed_lines += 1  # PR19 M8: one truncated line must not
                continue              # destroy the whole summary
            if rec.get("deploy_id"):
                deploy_ids.add(rec["deploy_id"])
            sid = rec.get("series_id", "unidentified")
            by_series.setdefault(sid, []).append(rec)

        for sid, recs in by_series.items():
            key = pid if len(by_series) == 1 else f"{pid}@{sid[:8]}"
            outcomes = [r.get("outcome_kind", "failure") for r in recs]
            counted = [r for r in recs
                       if r.get("outcome_kind") in
                       ("verdict", "tier1_pause", "engine_unavailable")]
            failures = len(recs) - len(counted)
            _ks = {r.get("intended_k") for r in recs}
            intended = recs[0].get("intended_k")
            # R3-F7: a series whose records disagree about their own intended K
            # (a resumed run, a merge) cannot certify its own completeness.
            intended_k_divergent = len(_ks) > 1
            entry = {
                "class": (probes_meta.get(pid, {}).get("frozen_class")
                          or probes_meta.get(pid, {}).get("class", "unknown")),
                # Carried explicitly, never re-derived by splitting the key on
                # "@": the key's shape depends on how many series a probe has,
                # so deriving the probe id from it couples the count to the
                # very imbalance this field exists to measure.
                "probe_id": pid,
                "series_id": sid,
                "intended_k": intended,
                "calls_attempted": len(recs),
                "counted_outcomes": len(counted),
                "failures": failures,
                # PR19 H3: a partial series must announce itself, not be
                # pooled silently at equal per-call weight.
                "intended_k_divergent": intended_k_divergent,
                "complete": (intended is not None and not intended_k_divergent
                             and len(counted) == intended),
                "outcome_kinds": {k: outcomes.count(k)
                                  for k in sorted(set(outcomes))},
            }
            if counted:
                # An outcome's identity for disagreement purposes is its
                # verdict where it has one, else its kind — a tier-1 pause is
                # a different outcome from `deliberate` on the same frozen
                # text, and that IS the variance being measured (PR19 H1).
                idents, proceeds = [], []
                for r in counted:
                    f = r.get("fields") or {}
                    idents.append(f.get("katorthoma_proximity")
                                  or r.get("outcome_kind"))
                    proceeds.append(f.get("proceed"))
                # Directional attribution is a claim about the GATE'S JUDGEMENT,
                # so it is taken over verdicts only (R3-F3).
                verdict_proceeds = [
                    (r.get("fields") or {}).get("proceed") for r in counted
                    if r.get("outcome_kind") == "verdict"]
                n_non_verdict = len(counted) - len(verdict_proceeds)
                dist = {v: idents.count(v) for v in sorted(set(idents),
                                                           key=str)}
                # `modal_outcome` is a DESCRIPTIVE reference point for
                # computing dispersion. It is NOT an operative-verdict
                # selection rule, and it bears on the deferred M-vs-W ruling
                # in neither direction (PR19 5a; build prompt section D:
                # "D6a data characterises the instrument. It has no standing
                # in the deferred M-vs-W ruling").
                modal = max(dist, key=dist.get)
                # F5 (PR19 2026-08-31): on a 50/50 proceed split `max` returns
                # whichever value the set iterates first — arbitrary. That was
                # tolerable while modal_proceed only fed a flip COUNT; the
                # directional split gives the arbitrary pick publication weight,
                # so a tie is surfaced and the split suppressed rather than
                # attributed to a coin flip.
                _pcounts = {v: verdict_proceeds.count(v)
                            for v in set(verdict_proceeds)}
                _pmax = max(_pcounts.values()) if _pcounts else 0
                modal_proceed_tied = sum(
                    1 for v in _pcounts.values() if v == _pmax) > 1
                modal_proceed = (max(_pcounts, key=_pcounts.get)
                                 if _pcounts else None)
                # Explicit tie-break: never let a {None, True} tie be decided by
                # set-iteration order (hash(None) is documented as arbitrary and
                # only became fixed in 3.12). A real proceed value wins.
                if modal_proceed_tied:
                    modal_proceed = max(
                        _pcounts, key=lambda k: (_pcounts[k], k is not None))
                _dir_ok = not modal_proceed_tied and modal_proceed is not None
                entry.update({
                    "outcome_distribution": dist,
                    "modal_outcome": modal,
                    "disagreement_count": sum(1 for v in idents if v != modal),
                    "proceed_flip_count": sum(1 for p in proceeds
                                              if p != modal_proceed),
                    # Directional split (carried item 3b, 2026-08-31). The two
                    # directions are NOT equivalent and the 2026-08-30
                    # rate-presentation ruling requires the published rate be
                    # decomposed by direction: a gate that occasionally blocks
                    # what it would usually permit produces friction; one that
                    # occasionally permits what it would usually block fails at
                    # its purpose. Computed here so the decomposition is a
                    # NAMED OUTPUT of the instrument rather than hand-derived
                    # from the per-probe records at publication time, which is
                    # how it was produced for the 2026-08-30 disclosure.
                    # R3-F3 (PR19 round 3, 2026-08-31) — CORRECTING AN EARLIER
                    # COMMENT THAT WAS FACTUALLY WRONG. `proceed` is NOT absent
                    # on tier1_pause / engine_unavailable: guardrail/route.ts
                    # emits `proceed: false` explicitly on BOTH branches, and
                    # this file's own module docstring says so. The consequence
                    # of the wrong reading was substantive: an engine outage on a
                    # probe whose modal is proceed:true was counted as a FLIP
                    # TOWARD BLOCKING. An outage is infrastructure, not a gate
                    # judgement about the frozen text — the published split's own
                    # justification ("a gate that occasionally blocks what it
                    # would usually permit produces friction") does not describe
                    # one. Direction is therefore taken over VERDICT outcomes
                    # only, and non-verdict outcomes are counted separately.
                    "modal_proceed_tied": modal_proceed_tied,
                    # R2 (PR19 re-review 2026-08-31): the split is meaningful
                    # ONLY against a real proceed baseline. modal_proceed is
                    # None when the MAJORITY outcome carries no proceed field
                    # (tier1_pause / engine_unavailable) — there is then no
                    # "usually permits" or "usually blocks" behaviour to flip
                    # away from, and counting both directions against a
                    # non-decision produced a clean-looking 2+2 with no warning,
                    # because the arithmetic balanced. The first fix guarded
                    # MINORITY nulls only.
                    "flips_toward_block": None if not _dir_ok else sum(
                        1 for pr in verdict_proceeds
                        if pr is not None and pr != modal_proceed
                        and pr is False),
                    "flips_toward_proceed": None if not _dir_ok else sum(
                        1 for pr in verdict_proceeds
                        if pr is not None and pr != modal_proceed
                        and pr is True),
                    # Renamed from flips_undirected: the old name described a
                    # condition that cannot arise against the live gate. This
                    # counts outcomes that carry no gate JUDGEMENT (pauses and
                    # outages), which do arise and must not be attributed to a
                    # direction.
                    "flips_non_verdict": n_non_verdict,
                    "disagreement_rate": round(
                        sum(1 for v in idents if v != modal) / len(idents), 4),
                })
            if key in per_probe:  # R3-F8: silent overwrite is the one failure
                # mode this instrument must never have — a whole series would
                # vanish from the denominator with no warning.
                sys.exit(f"ABORT: duplicate per_probe key {key!r} — a series "
                         "would be silently discarded.")
            per_probe[key] = entry

    borderline = [e for e in per_probe.values()
                  if e["class"] == "borderline" and e.get("counted_outcomes")]
    # A borderline series that produced ZERO counted outcomes is excluded from
    # the aggregate above (correctly — it contributes no data), but it must not
    # vanish silently: an all-failure series is a fact about the run.
    borderline_empty = [
        e["series_id"] for e in per_probe.values()
        if e["class"] == "borderline" and not e.get("counted_outcomes")]
    # F3 (PR19 2026-08-31): the DESIGN description must cover every borderline
    # series, including those that contributed no outcomes. Deriving it from
    # `borderline` alone makes a wholly-failed probe disappear rather than
    # appear with 0 — so a 5-probe design that yielded 4 reads as a balanced
    # 4-probe design.
    borderline_all = [e for e in per_probe.values()
                      if e["class"] == "borderline"]
    n_total = sum(e["counted_outcomes"] for e in borderline)
    # Raw integer counts, summed — not reconstructed from rounded rates
    # (PR19 2a/L14).
    n_disagree = sum(e.get("disagreement_count", 0) for e in borderline)
    n_flips = sum(e.get("proceed_flip_count", 0) for e in borderline)
    # R1 (PR19 re-review 2026-08-31): these derive over borderline_all, NOT
    # borderline. A wholly-failed series has counted_outcomes == 0, so deriving
    # them over `borderline` reported `borderline_failures: 0` while ten
    # failures sat in the per-probe entry, and `all_borderline_series_complete:
    # true` for a run in which an entire probe failed — and the report's own
    # note tells a reader that an empty incomplete_series means the aggregate is
    # publishable. n_total stays on `borderline`: a failed series contributes no
    # outcomes and must not dilute the rate.
    incomplete = [e["series_id"] for e in borderline_all if not e["complete"]]

    anchors = {k: v for k, v in per_probe.items()
               if v["class"].endswith("anchor")}
    # Calibration assertion (PR19 3a): the class definition is a claim the run
    # can falsify. If an anchor moved, or no borderline probe varied at all,
    # the headline rate is not about the class it says it is.
    calibration = {
        "anchors_stable": {k: v.get("disagreement_rate") == 0
                           for k, v in anchors.items()
                           if v.get("counted_outcomes")},
        # R3-F4: the same filter that hid a failed borderline probe was still
        # in place here. An anchor is a FALSIFICATION CHECK on the class
        # definition; an anchor that did not run is not a passed check, and
        # presenting the surviving anchors as the whole set overstates what was
        # verified.
        "anchors_with_no_counted_outcomes": sorted(
            k for k, v in anchors.items() if not v.get("counted_outcomes")),
        "borderline_probes_showing_variance": sum(
            1 for e in borderline
            if e.get("disagreement_count", 0) > 0),
        # COUNTS PROBES, NOT SERIES (corrected 2026-08-31, carried item 3).
        # This field previously returned len(borderline), which is a count of
        # SERIES: on the 2026-08-30 pooled run it read 8 where five probes were
        # measured, and nothing in the block could see that four probes carried
        # two series each while two carried one. See the balance warning below.
        "borderline_probes_measured": len({e["probe_id"] for e in borderline}),
        "borderline_series_measured": len(borderline),
        "population_note": (
            "borderline_probes_measured and borderline_series_measured count "
            "only series that produced counted outcomes; series_per_probe and "
            "outcomes_per_probe cover ALL borderline series including those "
            "that produced none (which appear as 0). They can therefore differ, "
            "and that difference is itself a finding — see "
            "borderline_series_with_no_counted_outcomes."),
        "series_per_probe": {
            pid: sum(1 for e in borderline_all if e["probe_id"] == pid)
            for pid in sorted({e["probe_id"] for e in borderline_all})},
        # F2 (PR19 2026-08-31): SAMPLING WEIGHT, not series count. A 10-record
        # series and a 3-record series are one series each, so a series-count
        # predicate cannot see unequal weight. This is the field the balance
        # check actually keys on.
        "outcomes_per_probe": {
            pid: sum(e.get("counted_outcomes", 0) for e in borderline_all
                     if e["probe_id"] == pid)
            for pid in sorted({e["probe_id"] for e in borderline_all})},
        "borderline_series_with_no_counted_outcomes": borderline_empty,
        "directional": {
            # None (not 0) when ANY contributing series had a tied modal — a
            # missing direction must not read as "zero flips that way".
            "flips_toward_block": None if any(
                e.get("flips_toward_block") is None for e in borderline) else
            sum(e.get("flips_toward_block", 0) for e in borderline),
            "flips_toward_proceed": None if any(
                e.get("flips_toward_proceed") is None for e in borderline) else
            sum(e.get("flips_toward_proceed", 0) for e in borderline),
            "flips_non_verdict": None if any(
                e.get("flips_non_verdict") is None for e in borderline) else
            sum(e.get("flips_non_verdict", 0) for e in borderline),
            "precision_note": (
                "Event counts, not rates. A small number of events per "
                "direction establishes that both phenomena occur and that "
                "their consequences are not symmetric; it does NOT establish "
                "their relative frequency, and no directional rate or derived "
                "interval should be computed from these counts."),
        },
        "warning": None,
    }
    if calibration["borderline_probes_measured"] and not \
            calibration["borderline_probes_showing_variance"]:
        calibration["warning"] = (
            (calibration["warning"] or "") + " NO borderline probe varied. "
            "Either the instrument is more stable "
            "than c11 suggested, or the probe set is not the borderline class "
            "it claims to be. Do not publish the rate as a class rate without "
            "resolving which.").strip()
    if reclassified:
        calibration["warning"] = (
            (calibration["warning"] or "") + " POST-HOC RECLASSIFICATION "
            f"DETECTED on {reclassified}: the `class` field was edited after "
            "the series began. The frozen class was used for aggregation and "
            "the edit was ignored. Report the falsified class definition as a "
            "finding; do not re-partition to move the rate.").strip()
    if any(v is False for v in calibration["anchors_stable"].values()):
        calibration["warning"] = (
            (calibration["warning"] or "") + " An ANCHOR moved: the clean or "
            "floor probe disagreed with itself, so the class boundaries the "
            "probe set asserts are not holding.").strip()

    # BALANCE (carried item 3, 2026-08-31). An unbalanced design biases
    # COMPOSITION, not merely precision: pooling series unequally across probes
    # weights the over-sampled probes more heavily, so if those happen to be the
    # low-variance ones the pooled rate is pulled down by the design rather than
    # by the instrument. This is exactly what the aborted 2026-08-30 second
    # sweep produced — 7.5% pooled against 12% balanced — and the block reported
    # `all_borderline_series_complete: true` with no warning, because
    # "complete" asks whether each series reached its intended K and cannot see
    # that the probes were not sampled equally.
    # The predicate keys on COUNTED OUTCOMES per probe (F2). An earlier version
    # keyed on series count, which closed only the specific 2026-08-30 shape
    # (a probe gaining an extra series) and left the general one open: truncating
    # two zero-variance probes to K=3 moved the rate 12% -> 16.7% while every
    # series was `complete` and the block reported `balanced: true`.
    _opp = calibration["outcomes_per_probe"]
    _spp = calibration["series_per_probe"]
    # R3 (PR19 re-review): count probes that produced DATA, not probes that
    # produced an entry. Keying on len(_opp) left `balanced: true` standing on a
    # run where all five probes failed entirely — every value 0, therefore
    # "equal" — which is the exact defect F4 was written to close, one level in.
    _measured = {pid: k for pid, k in _opp.items() if k}
    if len(_measured) < 2:
        calibration["balanced"] = None
        calibration["balance_basis"] = (
            "not applicable: fewer than two borderline probes produced counted "
            f"outcomes ({_opp})")
    elif len(set(_opp.values())) > 1:
        _mx, _mn = max(_opp.values()), min(_opp.values())
        calibration["balanced"] = False
        # R5: severity is stratified. `balanced: false` is factually right at
        # 9-vs-10, but emitting byte-identical MUST-NOT-PUBLISH text for a lost
        # call and for a 2x weight difference trains an operator to ignore it —
        # and since transient failures are why `outcome_kind: failure` exists,
        # essentially no real sweep would ever read balanced:true. The bias this
        # check exists to catch was 12% -> 7.5% from a probe carrying 2x weight.
        _material = _mn == 0 or (_mx / _mn) >= 1.25
        calibration["balance_basis"] = (
            f"counted outcomes per probe {_mn}-{_mx}; "
            f"{'material' if _material else 'minor'} imbalance")
        if _material:
            calibration["warning"] = (
                (calibration["warning"] or "") + " UNBALANCED DESIGN: counted "
                f"outcomes per probe range from {_mn} to {_mx} ({_opp}; series "
                f"per probe {_spp}). The pooled rate is composition-biased "
                "toward the over-sampled probes and MUST NOT be published as a "
                "class rate. Either balance the design by sampling the "
                "under-weighted probes to parity, or publish a single balanced "
                "subset. NOTE: per-series completeness does not detect this — "
                "every series can reach its own intended K while the probes "
                "carry unequal weight.").strip()
        else:
            calibration["warning"] = (
                (calibration["warning"] or "") + " MINOR IMBALANCE: counted "
                f"outcomes per probe {_mn}-{_mx} ({_opp}); heaviest probe "
                f"carries {_mx / sum(_opp.values()):.1%} of the pooled weight "
                f"against {1 / len(_opp):.1%} nominal. Composition bias is "
                "small, but the pooled rate is not exactly equal-weighted — "
                "state the range when publishing.").strip()
    else:
        calibration["balanced"] = True
        calibration["balance_basis"] = (
            f"equal weight: {min(_opp.values())} counted outcomes on each of "
            f"{len(_opp)} borderline probes")
    # F3: an all-failure series is a fact about the run; a passive JSON field in
    # a block whose consumers read `warning` is close to silent.
    if borderline_empty:
        calibration["warning"] = (
            (calibration["warning"] or "") + " BORDERLINE SERIES WITH NO "
            f"COUNTED OUTCOMES: {borderline_empty}. These contribute nothing to "
            "the rate and are excluded from it; they appear in "
            "outcomes_per_probe as 0 so the design description stays "
            "honest.").strip()
    # R4 (PR19 re-review): with no borderline series at all, `any()` over an
    # empty list is False and `sum()` over empty is 0, so the block published
    # three clean zeros and no warning for a run containing no borderline data.
    # F4's discipline applied to `balanced` and not to its sibling.
    if not borderline:
        calibration["directional"].update({
            "flips_toward_block": None, "flips_toward_proceed": None,
            "flips_non_verdict": None,
            "basis": ("not applicable: no borderline series produced counted "
                      "outcomes")})
    # F1: the directional split must decompose the flip count, or say it does not.
    _d = calibration["directional"]
    _tot = sum(e.get("proceed_flip_count", 0) for e in borderline)
    _nv = _d.get("flips_non_verdict")
    if (_d["flips_toward_block"] is None or _d["flips_toward_proceed"] is None
            or _nv is None
            or _d["flips_toward_block"] + _d["flips_toward_proceed"] + _nv
            != _tot):
        calibration["warning"] = (
            (calibration["warning"] or "") + " DIRECTIONAL SPLIT INCOMPLETE: "
            f"toward_block + toward_proceed does not account for all {_tot} "
            "proceed flips (outcomes with no proceed field, e.g. tier1_pause or "
            "engine_unavailable, and any series with a tied modal). Do NOT "
            "publish the split as a decomposition of the aggregate.").strip()

    # ── DESIGN-LEVEL (PR19 round 3) ──────────────────────────────────────────
    # Six prior guards (F3, F4, R1, R2, R3, R4) were all one guard written six
    # times: a named aggregate derived over a population that silently loses
    # members, so an empty or partial population reads as a clean zero. Each
    # round fixed the instance a reviewer happened to construct. The invariant
    # they approximate, stated once and enforced here:
    #
    #   EVERY PARSED RECORD LANDS IN EXACTLY ONE NAMED POPULATION, AND EVERY
    #   NAMED AGGREGATE DECLARES THE POPULATION IT WAS DERIVED OVER.
    #
    # This reconciliation makes the next instance self-announcing instead of
    # reviewer-dependent — it is what catches a probe file whose stem is not in
    # d6a-probes.json, which was dropped from EVERY named output while sitting
    # fully populated in per_probe (10 paid calls vanishing from the
    # denominator, rate 0.12 -> 0.15, every publishability signal green).
    _accounted = sum(e["calls_attempted"] for e in per_probe.values())
    _by_class = {}
    for e in per_probe.values():
        _by_class[e["class"]] = _by_class.get(e["class"], 0) + 1
    unclassified = sorted({e["probe_id"] for e in per_probe.values()
                           if e["class"] == "unknown"})
    record_accounting = {
        "lines_parsed": _accounted + malformed_lines,
        "records_accounted": _accounted,
        "malformed_skipped": malformed_lines,
        "entries_by_class": _by_class,
        "unclassified_probe_files": unclassified,
        "invariant": ("every parsed record lands in exactly one named "
                      "population; a non-empty unclassified_probe_files means "
                      "records were parsed that no named aggregate counts"),
    }
    if unclassified:
        calibration["warning"] = (
            (calibration["warning"] or "") + " UNCLASSIFIED PROBE FILES: "
            f"{unclassified}. These .jsonl files have no entry in "
            "d6a-probes.json, so their records are parsed but counted by NO "
            "named aggregate — they silently leave the denominator. Register "
            "them or remove them; do NOT publish this run.").strip()
    if missing_frozen:
        calibration["warning"] = (
            (calibration["warning"] or "") + " MISSING frozen_class ON RUN "
            f"PROBES: {missing_frozen}. The class partition for a probe that "
            "has already run is not frozen, so the aggregation fell back to the "
            "editable `class` field and the reclassification guard cannot fire. "
            "Treat as a falsified partition; do NOT publish this run.").strip()
    if calibration.get("anchors_with_no_counted_outcomes"):
        calibration["warning"] = (
            (calibration["warning"] or "") + " ANCHOR PRODUCED NO OUTCOMES: "
            f"{calibration['anchors_with_no_counted_outcomes']}. An anchor is a "
            "falsification check on the class definition; one that did not run "
            "is not a passed check, and the rate's class claim is untested to "
            "that extent.").strip()
    if any(e.get("intended_k_divergent") for e in per_probe.values()):
        calibration["warning"] = (
            (calibration["warning"] or "") + " INTENDED_K DIVERGENT within a "
            "series: its records disagree about their own intended K, so the "
            "series cannot certify its completeness.").strip()

    rate = {
        "instrument": "R8-D6a verdict-repeatability",
        "record_accounting": record_accounting,
        "computed_utc": utc_now(),
        "measured_path": "/api/guardrail",
        "path_specificity_statement": (
            "This rate was measured on /api/guardrail ONLY. The trust record "
            "aggregates /api/reason-derived events. extractFeatures is shared, "
            "but the consult path passes additional Layer-1 context and NO "
            "rate has ever been measured there. The reason-path rate is "
            "UNKNOWN and must be stated as unknown wherever this rate is "
            "named (binding: 2026-08-30 rate-location ruling)."),
        "input_class": meta["input_class_definition"],
        # Collected during the guarded parse above — NOT by re-reading the
        # files, which is how the first rewrite reintroduced the very
        # malformed-line crash it had just fixed (caught by this module's own
        # self-test on 2026-08-30).
        "deploy_ids_observed": sorted(deploy_ids),
        # ---- THE NAMED OUTPUTS (binding) ----
        "aggregate_disagreement_rate": (round(n_disagree / n_total, 4)
                                        if n_total else None),
        "aggregate_proceed_flip_rate": (round(n_flips / n_total, 4)
                                        if n_total else None),
        "borderline_counted_outcomes": n_total,
        "borderline_disagreements": n_disagree,
        "borderline_failures": sum(e["failures"] for e in borderline_all),
        "all_borderline_series_complete": not incomplete,
        "incomplete_series": incomplete,
        # -------------------------------------
        "calibration": calibration,
        "reclassified_probes_ignored": reclassified,
        "malformed_lines_skipped": malformed_lines,
        "per_probe": per_probe,
        "note": ("Rates cover the borderline class only; the clean and floor "
                 "anchors are calibration checks and are excluded. A tier-1 "
                 "pause or an engine-unavailable fallback counts as an "
                 "outcome, not a failure — on frozen text those ARE verdict "
                 "variance. n at K=10 per probe is a rate demonstration, not "
                 "a precise measurement (the c11 record's Wilson-interval "
                 "caveat carries). If incomplete_series is non-empty the "
                 "aggregate pools partial data and must not be published."),
    }
    out = base / "d6a-rate.json"
    out.write_text(json.dumps(rate, indent=2) + "\n")
    print(json.dumps(rate, indent=2))
    print(f"\nWritten: {out}")
    if incomplete:
        print("\nWARNING: incomplete series pooled — do not publish this rate.")
    if calibration["warning"]:
        print(f"\nCALIBRATION WARNING: {calibration['warning']}")


def main() -> None:
    if len(sys.argv) == 4 and sys.argv[1] == "run":
        run_series(sys.argv[2], sys.argv[3])
    elif len(sys.argv) == 3 and sys.argv[1] == "summary":
        summary(sys.argv[2])
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
