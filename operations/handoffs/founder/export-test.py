#!/usr/bin/env python3
"""
R17 export live test — logs in as test user A on the sagereasoning-test
project, calls the local /api/user/export endpoint, and prints whether the
intimate tables are now present. Read-only. 2026-05-30.
Run:  python3 export-test.py
"""
import json
import urllib.request
import urllib.error

SUPABASE_URL = "https://iwdtrvuphogkwmovhnvz.supabase.co"
ANON = ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6"
        "Iml3ZHRydnVwaG9na3dtb3ZobnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1ODEwND"
        "AsImV4cCI6MjA5NTE1NzA0MH0.uGej_kDDJmzp_egYRcPqvXchhTL-KT-c30x1C21_LKw")
EMAIL = "test-erasure-A@example.com"
PASSWORD = "test-erasure-Atest-erasure-A"
APP = "http://localhost:3000"


def post_json(url, headers, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req) as r:
        return json.load(r)


print("1/3  Logging in as", EMAIL, "...")
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

print("2/3  Calling /api/user/export ...")
req = urllib.request.Request(APP + "/api/user/export",
                             headers={"Authorization": "Bearer " + access})
try:
    with urllib.request.urlopen(req) as r:
        export = json.load(r)
except urllib.error.HTTPError as e:
    print("    EXPORT FAILED:", e.code, e.read().decode())
    raise SystemExit(1)
except urllib.error.URLError as e:
    print("    COULD NOT REACH THE APP at", APP, "-", e)
    print("    Is `npm run dev` still running in the other window?")
    raise SystemExit(1)

print("3/3  Result:\n")
intimate = [
    "mentor_profile", "mentor_baseline_appendix", "realtime_journal_entries",
    "passion_events", "premeditatio_entries", "oikeiosis_reflections",
    "mentor_interactions", "mentor_observations_structured", "mentor_journal_refs",
]
print("    Intimate tables now included in the export:")
all_present = True
for k in intimate:
    present = k in export
    all_present = all_present and present
    rows = len(export[k]) if isinstance(export.get(k), list) else "n/a"
    print(f"      {'YES' if present else 'NO '}   {k:<32} rows: {rows}")

print()
print("    All intimate tables present:", "YES ✓" if all_present else "NO ✗")
print("    Total top-level sections in export:", len(export))
