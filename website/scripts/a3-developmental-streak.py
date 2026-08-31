#!/usr/bin/env python3
"""
A3 activation smoke — Step E: build a 3-consecutive-'deliberate' streak on
sagereasoning:a3-smoke@v1 (three consult -> accreditation-write round trips,
each reusing "Add a unit test before merging." — the D2 control fixture,
which already scored katorthoma_proximity=deliberate, virtue_domains_engaged
=[phronesis] on the live D2 smoke), then opens + drives a reflect completion
on the same agent_id and prints whether developmental_priorities appears.

Usage:
  export SMOKE_KEY="sr_prac_..."
  python3 a3-developmental-streak.py
"""
import json
import os
import sys
import time
import urllib.request
from datetime import datetime, timedelta, timezone

BASE = "https://www.sagereasoning.com"
AGENT_ID = "sagereasoning:a3-smoke@v1"
SMOKE_KEY = os.environ.get("SMOKE_KEY")
if not SMOKE_KEY:
    sys.exit("Set SMOKE_KEY first: export SMOKE_KEY=sr_prac_...")

FIXTURE = "Add a unit test before merging."


def call(method, path, body=None, bearer=True):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if bearer:
        req.add_header("Authorization", f"Bearer {SMOKE_KEY}")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def consult(max_attempts=6):
    """Retries the fixture until it lands proximity=deliberate with phronesis
    engaged — extraction is stochastic, so a single call is not reliable."""
    for attempt in range(1, max_attempts + 1):
        status, body = call("POST", "/api/reason", {"input": FIXTURE})
        if status != 200:
            print("CONSULT FAILED", status, json.dumps(body, indent=2))
            sys.exit(1)
        a = body["assessment"]
        proximity = a["assessment"]["katorthoma_proximity"]
        domains = a["assessment"]["virtue_domains_engaged"]
        print(f"  consult attempt {attempt} -> proximity={proximity} domains={domains}")
        if proximity == "deliberate" and "phronesis" in domains:
            return a["assessment"], a["signature"], a["key_id"]
        time.sleep(1)
    print(f"  FAILED to land 'deliberate'/phronesis after {max_attempts} attempts — stopping.")
    sys.exit(1)


def write_accreditation(round_n, kind, assessment, signature, key_id):
    now = datetime.now(timezone.utc).isoformat()
    expires = (datetime.now(timezone.utc) + timedelta(days=90)).isoformat()
    record = {
        "agent_id": AGENT_ID,
        "senecan_grade": "grade_2",
        "typical_proximity": "deliberate",
        "authority_level": "guided",
        "dimension_levels": {
            "passion_reduction": "developing",
            "judgement_quality": "developing",
            "disposition_stability": "developing",
            "oikeiosis_extension": "developing",
        },
        "direction_of_travel": "stable",
        "evaluation_window_size": 100,
        "actions_evaluated": round_n,
        "grade_since": now,
        "last_evaluation": now,
        "passions_persisting": [],
        "verification_url": f"https://www.sagereasoning.com/api/accreditation/{AGENT_ID}",
        "expires_at": expires,
        "disclaimer": "Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.",
        "created_at": now,
        "updated_at": now,
        "typical_deliberation_breadth": "deliberated",
        "typical_kathekon_quality": "moderate",
    }
    profile = {
        "agent_id": AGENT_ID,
        "accreditation_record": record,
        "regressing_check_count": 0,
        "evaluated_actions": [],
        "total_actions_evaluated": round_n,
        "window_config": {
            "window_size": 100,
            "grade_check_interval": 20,
            "minimum_actions_for_grade": 20,
            "typical_proximity_threshold": 0.6,
            "dimension_level_threshold": 0.5,
            "carried_candidates_max": 5,
        },
        "carried_candidates": [],
    }
    body = {
        "kind": kind,
        "profile": profile,
        "provenance": {
            "signed_assessments": [
                {"assessment": assessment, "signature": signature, "key_id": key_id}
            ]
        },
    }
    if kind == "update":
        body["transition_result"] = {"grade_changed": False, "record": record}

    status, resp = call("POST", f"/api/accreditation/{AGENT_ID}", body)
    print(f"  write ({kind}) -> HTTP {status}")
    print("  ", json.dumps(resp, indent=2)[:600])
    return status, resp


def reflect_open():
    status, body = call(
        "POST",
        "/api/practice/reflect",
        {
            "session_id": f"a3-smoke-reflect-{int(time.time())}",
            "agent_id": AGENT_ID,
            "session_summary": {
                "purpose_at_open": "A3 activation smoke",
                "circle_at_open": "self_preservation",
                "role_at_open": "test agent",
                "capacity_at_open": ["testing"],
                "sage_reasoning_passes": 3,
            },
        },
    )
    print(f"reflect open -> HTTP {status}, step={body.get('step')}")
    return status, body


def reflect_answer(session_id, answer):
    status, body = call(
        "POST",
        "/api/practice/reflect",
        {"session_id": session_id, "agent_id": AGENT_ID, "response": answer},
    )
    print(f"reflect answer -> HTTP {status}, status={body.get('status')}, step={body.get('step')}")
    return status, body


def main():
    print(f"=== Building the 3-consecutive-deliberate streak on {AGENT_ID} ===")
    for i in range(1, 4):
        print(f"\n-- Round {i} --")
        assessment, signature, key_id = consult()
        kind = "seed" if i == 1 else "update"
        status, resp = write_accreditation(i, kind, assessment, signature, key_id)
        if status not in (200,):
            print(f"  STOP: write {i} failed with {status} — inspect above before continuing.")
            sys.exit(1)
        time.sleep(1)

    print("\n=== Streak built. Driving a reflect completion ===")
    session_id = f"a3-smoke-reflect-{int(time.time())}"
    status, body = call(
        "POST",
        "/api/practice/reflect",
        {
            "session_id": session_id,
            "agent_id": AGENT_ID,
            "session_summary": {
                "purpose_at_open": "A3 activation smoke — reflect completion",
                "circle_at_open": "self_preservation",
                "role_at_open": "test agent",
                "capacity_at_open": ["testing"],
                "sage_reasoning_passes": 3,
            },
        },
    )
    print(f"reflect open -> HTTP {status}, step={body.get('step')}")

    answers = {
        "Q1": "I ran three test consults on a benign fixture to build a trust-core streak.",
        "Q2": "I did not identify any passions distorting my reasoning.",
        "Q3": "The action (adding a unit test before merging) was within my control.",
        "Q4": "No craving, fear, or grief-class passion was present.",
        "Q5": "The reasoning was consistent across all three rounds.",
        "Q6": "The purpose was served — the streak and the reflect completion are both testable now.",
    }
    guard = 0
    while status == 200 and body.get("status") == "in_progress" and guard < 10:
        step = body.get("step", "")
        answer = answers.get(step, "No further comment.")
        status, body = call(
            "POST",
            "/api/practice/reflect",
            {"session_id": session_id, "agent_id": AGENT_ID, "response": answer},
        )
        guard += 1

    print(f"\nFinal reflect status: HTTP {status}, status={body.get('status')}")
    print(json.dumps(body, indent=2))

    if "decision" in body:
        d = body["decision"]
        if "developmental_priorities" in d:
            print("\n*** developmental_priorities PRESENT ***")
            print(json.dumps(d["developmental_priorities"], indent=2))
        else:
            print("\n*** developmental_priorities ABSENT — the streak did not land (check WARNINGs above) ***")
        if "suggestion" in d:
            print("\n*** suggestion PRESENT (grade_changed fired) ***")
            print(json.dumps(d["suggestion"], indent=2))
        else:
            print("\n(suggestion absent — expected unless grade_changed was true this round)")


if __name__ == "__main__":
    main()
