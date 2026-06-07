#!/usr/bin/env python3
"""
A15c /api/user/rectify live test — mirrors access-test.py.

Logs in as the stable test user on the sagereasoning-test project and exercises
the GDPR Article 16 rectification endpoint:
  - a valid correction (display_name) returns 200 with before/after + audit_logged
  - a non-allow-listed field is rejected (400)
  - the change is restored, so the test user ends in its starting state
  - rate-limiting trips (429) on the 6th data-rights call

The test RESTORES display_name to its pre-test value at the end, so it is
self-cleaning (the test user is left as it started, give or take an empty string
if it had no display_name to begin with).  2026-06-07.

Run:  python3 rectify-test.py
Pre-reqs:
  1. `compliance_rectification_log` table created in the TEST Supabase project
     (SQL in supabase/migrations/20260607_a15c_compliance_rectification_log.sql).
  2. `npm run dev` running in another Terminal window (serves against TEST via
     website/.env.development.local). RESTART it just before this test so the
     in-memory rate-limit bucket starts fresh — the 5/hour data-rights limit is
     SHARED with /api/user/access, so a prior access-test run would otherwise
     count toward it.
"""
import json
import urllib.request
import urllib.error

SUPABASE_URL = "https://iwdtrvuphogkwmovhnvz.supabase.co"
ANON = ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6"
        "Iml3ZHRydnVwaG9na3dtb3ZobnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1ODEwND"
        "AsImV4cCI6MjA5NTE1NzA0MH0.uGej_kDDJmzp_egYRcPqvXchhTL-KT-c30x1C21_LKw")
EMAIL = "test-access-a15b@example.com"
PASSWORD = "testaccessa15b2026"
APP = "http://localhost:3000"

TEST_NAME = "A15c Rectify Test"


def post_login():
    data = json.dumps({"email": EMAIL, "password": PASSWORD}).encode()
    req = urllib.request.Request(
        SUPABASE_URL + "/auth/v1/token?grant_type=password",
        data=data,
        headers={"apikey": ANON, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def rectify(access, corrections):
    """POST /api/user/rectify; returns (status, body)."""
    data = json.dumps({"corrections": corrections}).encode()
    req = urllib.request.Request(
        APP + "/api/user/rectify",
        data=data,
        headers={"Authorization": "Bearer " + access, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode())
        except Exception:
            return e.code, {}
    except urllib.error.URLError as e:
        print("    COULD NOT REACH THE APP at", APP, "-", e)
        print("    Is `npm run dev` still running in the other window?")
        raise SystemExit(1)


# ---------------------------------------------------------------- 1. log in
print("1/5  Logging in as", EMAIL, "...")
try:
    tok = post_login()
except urllib.error.HTTPError as e:
    print("    LOGIN FAILED:", e.read().decode())
    raise SystemExit(1)

access = tok.get("access_token")
if not access:
    print("    LOGIN FAILED, response was:", tok)
    raise SystemExit(1)
print("    Login OK.")

# ---------------------------------------------------------------- 2. valid rectify
print("\n2/5  Valid correction: set display_name ->", repr(TEST_NAME))
status, body = rectify(access, {"display_name": TEST_NAME})
ok = True
print("      HTTP", status)
rec = body.get("rectified") if isinstance(body, dict) else None
valid_ok = (
    status == 200
    and isinstance(rec, list)
    and len(rec) == 1
    and rec[0].get("field") == "display_name"
    and rec[0].get("new_value") == TEST_NAME
    and "old_value" in rec[0]
    and body.get("audit_logged") is True
)
ok = ok and valid_ok
original_name = rec[0].get("old_value") if (rec and len(rec) == 1) else None
print("      before:", repr(original_name), "-> after:", repr(rec[0].get("new_value")) if rec else None)
print("      audit_logged:", body.get("audit_logged"))
print("      Valid correction OK:", "YES ✓" if valid_ok else f"NO ✗  (body={body})")

# ---------------------------------------------------------------- 3. reject non-allow-listed field
print("\n3/5  Rejection: try a non-correctable field (sage_alignment) ...")
status, body = rectify(access, {"sage_alignment": "999"})
reject_ok = status == 400
ok = ok and reject_ok
print("      HTTP", status, "(expect 400)")
print("      error:", body.get("error") if isinstance(body, dict) else body)
print("      Rejection works:", "YES ✓" if reject_ok else "NO ✗")

# ---------------------------------------------------------------- 4. restore original
restore_val = original_name if original_name is not None else ""
print("\n4/5  Restoring display_name ->", repr(restore_val))
status, body = rectify(access, {"display_name": restore_val})
restore_ok = status in (200, 207)
ok = ok and restore_ok
print("      HTTP", status, "(restored)" if restore_ok else "(restore FAILED)")

# ---------------------------------------------------------------- 5. rate-limit
print("\n5/5  Rate-limit check (limit is 5/hour; calls above were #1-#3) ...")
print("      Sending no-op calls until the limit trips — expect a 429:")
last_status = None
for i in range(4, 8):
    last_status, _ = rectify(access, {"display_name": restore_val})  # no-op (already restored)
    print(f"        call #{i}: HTTP {last_status}")
    if last_status == 429:
        break
rl_ok = last_status == 429
ok = ok and rl_ok
print("\n      Rate-limiting works:",
      "YES ✓ (got 429)" if rl_ok else f"NO ✗ (last was {last_status})")

print("\n" + ("ALL CHECKS PASSED ✓" if ok else "SOME CHECKS FAILED ✗ — tell me; that's a code issue I own."))
print("\nNow check the TEST Supabase SQL editor:")
print("    select * from compliance_rectification_log order by rectified_at;")
print("    -- expect >= 2 rows, field='display_name', event='rectification',")
print("    --   showing the before/after of the change and the restore.")
