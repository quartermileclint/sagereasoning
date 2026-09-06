#!/usr/bin/env python3
"""Estimator battery for option-s-runner.py. Run: python3 option-s-runner-test.py

WHY THIS FILE EXISTS. The 2026-09-05 PR19 review found three of its four
pre-run blockers in the ESTIMATORS -- would_option_M_record was a mode not a
median, would_option_W_record was the first verdict not the worst, the floor
count could not see `habitual`, and a tier-1 pause flipping `proceed` published
as "stable". None of those was caught by a test, because there were no tests.
Each fix below therefore ships with the case that would have caught the defect,
and each case is written so it FAILS against the pre-fix behaviour.

Nothing here makes a network call. The instrument is never executed.
"""
import importlib.util
import io
import json
import os
import subprocess
import sys
import tempfile
from contextlib import redirect_stdout
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("osr", HERE / "option-s-runner.py")
R = importlib.util.module_from_spec(spec)
spec.loader.exec_module(R)

passed, failures = 0, []


def check(label, cond, detail=""):
    global passed
    if cond:
        passed += 1
    else:
        failures.append(f"{label}{(' -- ' + detail) if detail else ''}")


def rec(kind, prox=None, proceed=None, k=3, sid="s1", role="winner", at="2026-01-01T00:00:00Z"):
    r = {"outcome_kind": kind, "intended_k": k, "series_id": sid,
         "decision_role": role, "requested_at": at, "candidate_id": "c1"}
    if kind != "failure":
        r["fields"] = {"katorthoma_proximity": prox, "proceed": proceed}
    return r


def run_summary(files: dict) -> dict:
    """files: {candidate_id: [records]} -> the parsed summary document."""
    with tempfile.TemporaryDirectory() as d:
        for cid, recs in files.items():
            (Path(d) / f"{cid}.jsonl").write_text(
                "\n".join(json.dumps(r) for r in recs) + "\n", encoding="utf-8")
        buf = io.StringIO()
        with redirect_stdout(buf):
            R.summary(d)
        return json.loads(buf.getvalue())


# === B3a: worst-of-K is the ORDINAL worst, not the first verdict ==============
check("B3a ordinal_worst picks the lowest rank",
      R.ordinal_worst(["deliberate", "habitual", "deliberate"]) == "habitual",
      "pre-fix returned prox[0] = deliberate, understating W")
check("B3a ordinal_worst single value", R.ordinal_worst(["principled"]) == "principled")
check("B3a ordinal_worst empty is None", R.ordinal_worst([]) is None)
check("B3a ordinal_worst finds reflexive under principled",
      R.ordinal_worst(["sage_like", "principled", "reflexive"]) == "reflexive")

# === B3b: median is an ORDINAL median, deterministic, lower on even K =========
check("B3b odd-K median is the middle rank",
      R.ordinal_median(["reflexive", "deliberate", "principled"]) == "deliberate")
check("B3b even-K median takes the LOWER central value",
      R.ordinal_median(["reflexive", "deliberate"]) == "reflexive")
check("B3b upper convention is available and differs",
      R.ordinal_median(["reflexive", "deliberate"], "upper_median") == "deliberate")


def raises_value_error(fn, *args):
    try:
        fn(*args)
        return False
    except ValueError:
        return True
    except Exception:
        return False


check("B3b unknown convention raises rather than guessing",
      raises_value_error(R.ordinal_median, ["reflexive", "deliberate"], "midpoint"))

# A set where the MODE and the ORDINAL MEDIAN genuinely differ, so this case
# can actually fail against the pre-fix mode implementation. Sorted by rank the
# seven values are [reflexive x3, deliberate x2, sage_like x2]; the 4th (index
# 3) is `deliberate`, while the most frequent value is `reflexive`.
# The first draft of this case used [reflexive x4, deliberate, sage_like x2],
# where mode AND median are both `reflexive` -- it distinguished nothing and the
# battery caught it. Kept in the comment because a vacuous pin is the failure
# mode this file exists to prevent.
check("B3b median is a MEDIAN not a MODE",
      R.ordinal_median(["reflexive"] * 3 + ["deliberate"] * 2 + ["sage_like"] * 2) == "deliberate",
      "the mode is reflexive (3 of 7); the ordinal median is deliberate")

# === B3c: determinism ACROSS PROCESSES (the hash-seed salting defect) =========
_probe = (
    "import importlib.util,json,sys;"
    "spec=importlib.util.spec_from_file_location('osr',%r);"
    "m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);"
    "print(m.ordinal_median(['deliberate','deliberate','deliberate',"
    "'reflexive','reflexive','reflexive']))" % str(HERE / "option-s-runner.py")
)
_outs = set()
for seed in ("0", "1", "12345", "99999"):
    env = dict(os.environ, PYTHONHASHSEED=seed)
    _outs.add(subprocess.run([sys.executable, "-c", _probe], env=env,
                             capture_output=True, text=True).stdout.strip())
check("B3c median is stable across PYTHONHASHSEED values",
      len(_outs) == 1 and _outs == {"reflexive"},
      f"got {_outs}; the pre-fix mode tie-break used set() order, which CPython salts")

# === B2: `habitual` blocks, and the block rate sees it ========================
check("B2 blocked set derived from the canonical rank",
      R.BLOCKED_PROXIMITIES == ("reflexive", "habitual"))
doc = run_summary({"c1": [rec("verdict", "deliberate", True, k=10)] * 7
                          + [rec("verdict", "habitual", False, k=10)] * 3})
row = doc["per_input"][0]
check("B2 floor rate is 0 on a deliberate/habitual split", row["p_hat_floor"] == 0.0)
check("B2 block rate SEES the habitual blocks", row["p_hat_block"] == 0.3,
      f"got {row['p_hat_block']}; pre-fix this input published as 0.0 with no block figure")
check("B2 descriptive proximity-side count agrees",
      row["blocked_proximity_count_DESCRIPTIVE"] == 3)
check("B2 pooled block rate reaches the stratum",
      doc["strata"][0]["pooled_p_hat_block"] == 0.3)

# === B4: a tier-1 pause flipping `proceed` is visible =========================
doc = run_summary({"c1": [rec("tier1_pause", None, False, k=10)] * 5
                          + [rec("verdict", "deliberate", True, k=10)] * 5})
row = doc["per_input"][0]
check("B4 pause/verdict split reports disagreed_proceed", row["disagreed_proceed"] is True,
      "pre-fix: proceed was read off verdicts only, so this said False")
check("B4 pause/verdict split reports a 50% block rate", row["p_hat_block"] == 0.5,
      f"got {row['p_hat_block']}; pre-fix: 0 blocks, 'stable_no_variance'")
check("B4 pauses do not enter the proximity distribution", row["n_verdicts"] == 5)

# === outages are counted but excluded from the DECISION population ============
doc = run_summary({"c1": [rec("engine_unavailable", None, False, k=6)] * 3
                          + [rec("verdict", "deliberate", True, k=6)] * 3})
row = doc["per_input"][0]
check("outage excluded from the decision denominator", row["n_decisions"] == 3,
      f"got {row['n_decisions']}; an outage is infrastructure, not a judgement")
check("outage block rate is 0, not 0.5", row["p_hat_block"] == 0.0)
check("outage still counted overall", row["n_counted"] == 6)

# === the ruled removal ========================================================
doc = run_summary({"c1": [rec("verdict", "deliberate", True, k=3)] * 2
                          + [rec("verdict", "reflexive", False, k=3)]})
row = doc["per_input"][0]
check("RULED: `direction` is absent from every per-input row",
      "direction" not in row, "removed by mentor ruling 2026-09-05; B1 moot")
check("RULED: the per-probe distribution is published",
      row["proximity_distribution"] == {"deliberate": 2, "reflexive": 1})
check("RULED: the document records the removal and its ground",
      "REMOVED by mentor ruling 2026-09-05" in doc["directional_decomposition"])

# === series-awareness / idempotency ==========================================
doc = run_summary({"c1": [rec("verdict", "deliberate", True, k=3, sid="A")] * 2
                          + [rec("verdict", "reflexive", False, k=3, sid="B")] * 3})
check("incomplete series is NOT pooled with a complete one",
      doc["per_input"][0]["n_verdicts"] == 3
      and doc["per_input"][0]["series_id"] == "B",
      "pre-fix the file was pooled wholesale, giving n=5 across two series")
check("the excluded series is named, not silently dropped",
      doc["per_input"][0]["incomplete_series_excluded"] == ["A"])

doc = run_summary({"c1": [rec("verdict", "deliberate", True, k=2, sid="A",
                              at="2026-01-01T00:00:00Z")] * 2
                          + [rec("verdict", "reflexive", False, k=2, sid="B",
                                 at="2026-02-01T00:00:00Z")] * 2})
check("with two complete series the EARLIEST is operative",
      doc["per_input"][0]["series_id"] == "A"
      and doc["per_input"][0]["other_complete_series_not_used"] == ["B"])

# a candidate with NO complete series is excluded and reported
doc = run_summary({"c1": [rec("verdict", "deliberate", True, k=3, sid="A")] * 2,
                   "c2": [rec("verdict", "reflexive", False, k=2, sid="B")] * 2})
check("candidate with no complete series is excluded",
      [e["candidate_id"] for e in doc["inputs_excluded_no_complete_series"]] == ["c1"])
check("...and the surviving candidate still reports", len(doc["per_input"]) == 1)

# === shape drift is surfaced, not silently dropped ===========================
doc = run_summary({"c1": [rec("verdict", "deliberate", True, k=3)] * 2
                          + [rec("verdict", "brand_new_level", False, k=3)]})
row = doc["per_input"][0]
check("an unranked proximity is named", row["unranked_proximities"] == ["brand_new_level"])
check("an unranked proximity does not silently enter the median",
      row["would_option_M_record"] == "deliberate")

# === L4 is read from the candidates file, not restated ========================
l4 = R.l4_status()
check("L4 is resolved from data", "RESOLVED BY DATA" in l4)
check("L4 no longer asserts the open 29 as the measured figure",
      "this figure is" in l4)

# === the spend gate fails CLOSED =============================================
# PR19 2026-09-06 (MEDIUM): the first version of this probe accepted stderr
# containing EITHER "no tty and no --yes" OR "credential". main() reads the
# credential BEFORE confirm_spend, so on any machine without the credential file
# -- this one, and any reviewer's -- the run aborted at the credential check and
# the tty gate was NEVER EXERCISED, while the OR-clause still reported a pass.
# A vacuous pin on the one gate that stands between a typo and real money.
# Fixed by pointing OPTION_S_CREDENTIAL_FILE at a throwaway file so the
# credential check always passes and the probe genuinely reaches the tty gate.
with tempfile.TemporaryDirectory() as _d:
    _cred = Path(_d) / "throwaway-not-a-real-token"
    _cred.write_text("not-a-real-token", encoding="utf-8")
    _env = dict(os.environ, OPTION_S_CREDENTIAL_FILE=str(_cred))
    res = subprocess.run([sys.executable, str(HERE / "option-s-runner.py"), "sweep", "10"],
                         capture_output=True, text=True, stdin=subprocess.DEVNULL,
                         cwd=str(HERE), env=_env)
    check("sweep without a tty and without --yes ABORTS",
          res.returncode != 0 and "no tty and no --yes" in res.stderr,
          f"rc={res.returncode} stderr={res.stderr[-300:]}")
    check("...and it announced the DOLLAR figure before aborting",
          "ABOUT TO SPEND" in res.stderr and "approximately $" in res.stderr,
          f"stderr={res.stderr[-300:]}")
    check("...and it made NO call (no run file was created)",
          not (HERE / "runs").exists() or not any((HERE / "runs").iterdir()))


# =============================================================================
# PR19 2026-09-06 (MEDIUM): direct coverage for four units that previously had
# NONE -- complete_series(), run_series()'s --resume skip, deploy_identity(),
# and the redirect refusal. The series assertions above reached complete_series
# only indirectly, through summary()'s pooling of pre-written files.
#
# RUNS_DIR is PATCHED to a temp directory throughout. The real runs/ directory
# must stay EMPTY: it is the standing evidence that Option S has never made a
# call, and a test that dirtied it would destroy the very fact it is meant to
# protect.
# =============================================================================

_real_runs = R.RUNS_DIR
try:
    with tempfile.TemporaryDirectory() as _d:
        R.RUNS_DIR = Path(_d)

        def _write(cid, recs):
            (R.RUNS_DIR / f"{cid}.jsonl").write_text(
                "\n".join(json.dumps(r) for r in recs) + "\n", encoding="utf-8")

        check("complete_series: absent file yields nothing",
              R.complete_series("nope") == [])
        _write("c1", [rec("verdict", "deliberate", True, k=3, sid="A")] * 2)
        check("complete_series: a SHORT series is not complete",
              R.complete_series("c1") == [])
        _write("c1", [rec("verdict", "deliberate", True, k=3, sid="A")] * 3)
        check("complete_series: a FULL series is complete",
              R.complete_series("c1") == ["A"])

        # --resume must skip WITHOUT making a call. call_gate is replaced with a
        # detonator: if the skip logic is wrong, the test fails loudly rather
        # than reaching the network.
        text = "frozen candidate text"
        cand = {"id": "c1", "text": text, "bytes": len(text.encode("utf-8")),
                "frozen_text_sha256": R.text_sha(text), "decision_role": "winner"}
        _real_call = R.call_gate
        R.call_gate = lambda *a, **k: (_ for _ in ()).throw(
            AssertionError("call_gate must NOT be reached when --resume skips"))
        try:
            out = R.run_series("c1", 3, "tok", "agent:x", {"_meta": {}}, [cand],
                               resume=True)
            check("--resume skips a complete series without calling the gate",
                  out.endswith("c1.jsonl"))
        except AssertionError as e:
            check("--resume skips a complete series without calling the gate",
                  False, str(e))
        finally:
            R.call_gate = _real_call
finally:
    R.RUNS_DIR = _real_runs

check("the real runs/ directory is still empty (Option S has never run)",
      not any((HERE / "runs").iterdir()))

# deploy_identity -- pure, no network
_saved = os.environ.pop("OPTION_S_DEPLOY_ID", None)
try:
    os.environ["OPTION_S_DEPLOY_ID"] = "deploy-abc"
    d = R.deploy_identity()
    check("deploy_identity prefers the explicit env id",
          d["deploy_id"] == "deploy-abc" and d["deploy_id_source"] == "vercel_dashboard")
    del os.environ["OPTION_S_DEPLOY_ID"]
    d = R.deploy_identity()
    check("deploy_identity falls back to a SOURCED proxy, never a bare claim",
          d["deploy_id_source"] in ("origin_main_proxy", "absent"))
    check("...and the proxy carries its caveat rather than asserting the deploy",
          d["deploy_id_source"] != "origin_main_proxy" or "must NOT be claimed" in d["deploy_id_caveat"])
finally:
    if _saved is not None:
        os.environ["OPTION_S_DEPLOY_ID"] = _saved
    else:
        os.environ.pop("OPTION_S_DEPLOY_ID", None)

# the redirect refusal -- instantiate the handler, no connection made
import urllib.error
import urllib.request
_h = R._RefuseRedirect()
_req = urllib.request.Request("https://www.sagereasoning.com/api/guardrail", method="POST")
try:
    _h.redirect_request(_req, io.BytesIO(b""), 302, "Found", {}, "https://evil.example/x")
    check("a 3xx is REFUSED, never followed", False, "redirect_request returned instead of raising")
except urllib.error.HTTPError as e:
    check("a 3xx is REFUSED, never followed", e.code == 302)
except Exception as e:
    check("a 3xx is REFUSED, never followed", False, f"raised {type(e).__name__}")

print()
print(f"{passed} passed, {len(failures)} failed")
if failures:
    print("\nFailures:")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
