#!/usr/bin/env python3
"""
A15b /api/user/access live test — mirrors export-test.py.

Logs in as test user A on the sagereasoning-test project, calls the local
/api/user/access endpoint, checks the response shape (data copy + Article 15
supplementary information), and then confirms rate-limiting by calling it
several times in a row. Read-only except for the access-log row the endpoint
writes (which is the point — confirm it lands).  2026-06-07.

Run:  python3 access-test.py
Pre-reqs:
  1. `compliance_access_log` table created in the TEST Supabase project (SQL in
     supabase/migrations/20260607_a15b_compliance_access_log.sql).
  2. `npm run dev` running in another Terminal window (serves against TEST via
     website/.env.development.local).
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


def post_json(url, headers, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req) as r:
        return json.load(r)


# ---------------------------------------------------------------- 1. log in
print("1/4  Logging in as", EMAIL, "...")
try:
    tok = post_json(
        SUPABASE_URL + "/auth/v1/token?grant_type=password",
        {"apikey": ANON, "Content-Type": "application/json"},
        {"email": EMAIL, "password": PASSWORD},
    )
except urllib.error.HTTPError as e:
    print("    LOGIN FAILED:", e.read().decode())
    raise SystemExit(1)

access = tok.get("access_token")
if not access:
    print("    LOGIN FAILED, response was:", tok)
    raise SystemExit(1)
print("    Login OK.")

# ---------------------------------------------------------------- 2. call /access
print("2/4  Calling /api/user/access ...")
req = urllib.request.Request(APP + "/api/user/access",
                             headers={"Authorization": "Bearer " + access})
try:
    with urllib.request.urlopen(req) as r:
        body = json.load(r)
except urllib.error.HTTPError as e:
    print("    ACCESS FAILED:", e.code, e.read().decode())
    raise SystemExit(1)
except urllib.error.URLError as e:
    print("    COULD NOT REACH THE APP at", APP, "-", e)
    print("    Is `npm run dev` still running in the other window?")
    raise SystemExit(1)

# ---------------------------------------------------------------- 3. check shape
print("3/4  Checking the response shape:\n")
top = ["access_metadata", "your_rights_and_our_processing", "personal_data"]
ok = True
for k in top:
    present = k in body
    ok = ok and present
    print(f"      {'YES' if present else 'NO '}   top-level key: {k}")

supp = body.get("your_rights_and_our_processing", {})
art15 = [
    "purposes_of_processing", "categories_of_personal_data",
    "recipients_and_sub_processors", "retention", "your_rights",
    "right_to_complain", "source_of_data", "automated_processing_and_profiling",
]
print("\n      Article 15 supplementary-information fields:")
for k in art15:
    present = k in supp
    ok = ok and present
    print(f"      {'YES' if present else 'NO '}   {k}")

prof = supp.get("automated_processing_and_profiling", {})
print("\n      Profiling disclosure present (Art 15(1)(h)):",
      "YES ✓" if prof.get("exists") is True else "NO ✗")

pd = body.get("personal_data", {})
print("      personal_data sections returned:", len(pd) if isinstance(pd, dict) else "n/a")
print("\n      Response shape OK:", "YES ✓" if ok else "NO ✗")

# ---------------------------------------------------------------- 4. rate-limit
print("\n4/4  Rate-limit check (limit is 5/hour; the call above was #1) ...")
print("      Sending 5 more rapid calls — expect the last to be 429:")
last_status = None
for i in range(2, 7):
    r2 = urllib.request.Request(APP + "/api/user/access",
                                headers={"Authorization": "Bearer " + access})
    try:
        with urllib.request.urlopen(r2) as resp:
            last_status = resp.status
    except urllib.error.HTTPError as e:
        last_status = e.code
    print(f"        call #{i}: HTTP {last_status}")

print("\n      Rate-limiting works:",
      "YES ✓ (got 429)" if last_status == 429 else f"NO ✗ (last was {last_status})")
print("\nDone. Now check the TEST Supabase SQL editor:")
print("    select * from compliance_access_log;   -- expect >= 1 row, event='access_request'")
