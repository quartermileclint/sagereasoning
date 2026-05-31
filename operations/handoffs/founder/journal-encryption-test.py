#!/usr/bin/env python3
"""
R17b realtime-journal encryption — LIVE TEST (Step 2b).
2026-05-31. Runs against the sagereasoning-TEST project + a local dev server.

What it does, in order:
  1. Logs in as the test user (password grant) -> access token.
  2. POSTs a new journal entry to /api/mentor/journal-feed (this is the WRITE
     that should encrypt at rest).
  3. Prints the POST response (should show your READABLE text back).
  4. GETs /api/mentor/journal-feed (should round-trip to READABLE text).
  5. GETs /api/user/export (the journal section should be READABLE).

It NEVER touches production: it talks to the TEST Supabase URL below and to your
local dev server (localhost:3000). Read-then-write of ONE test row only.

Run:  python3 journal-encryption-test.py
(Requires: `npm run dev` running in website/ with the TEST .env.development.local
 in place — see the walkthrough doc Step 2.)
"""
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone

# ── TEST project (sagereasoning-test) — public values, safe to keep here ──────
SUPABASE_URL = "https://iwdtrvuphogkwmovhnvz.supabase.co"
ANON = ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6"
        "Iml3ZHRydnVwaG9na3dtb3ZobnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1ODEwND"
        "AsImV4cCI6MjA5NTE1NzA0MH0.uGej_kDDJmzp_egYRcPqvXchhTL-KT-c30x1C21_LKw")

# ── The test login. If this user no longer exists in TEST, create it in the    ─
#    Supabase dashboard (Authentication -> Users -> Add user, "Auto Confirm"),  ─
#    then put its email/password here. ─────────────────────────────────────────
EMAIL = "test-erasure-a@example.com"
PASSWORD = "test-erasure-Atest-erasure-A"

APP = "http://localhost:3000"

# Recognisable text so you can see the round-trip clearly.
# event_timestamp computed as 2 hours ago (UTC) so it is never "in the future".
_PAST = (datetime.now(timezone.utc) - timedelta(hours=2)).strftime("%Y-%m-%dT%H:%M:%S.000Z")
ENTRY = {
    "impression": "TEST-ENC a colleague took credit for my work in the meeting",
    "assent": "TEST-ENC I judged it a grave injustice that diminishes me",
    "action": "TEST-ENC I stayed silent then vented to a friend afterwards",
    "event_timestamp": _PAST,
}


def post_json(url, headers, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def get_json(url, headers):
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req) as r:
        return json.load(r)


# 1. Log in -------------------------------------------------------------------
print("1/5  Logging in as", EMAIL, "...")
try:
    tok = post_json(
        SUPABASE_URL + "/auth/v1/token?grant_type=password",
        {"apikey": ANON, "Content-Type": "application/json"},
        {"email": EMAIL, "password": PASSWORD},
    )
except urllib.error.HTTPError as e:
    print("    LOGIN FAILED:", e.read().decode())
    print("    -> The test user probably doesn't exist in TEST. Create it in the")
    print("       Supabase dashboard (Authentication -> Users -> Add user, tick")
    print("       'Auto Confirm User'), then re-run.")
    raise SystemExit(1)
access = tok.get("access_token")
if not access:
    print("    LOGIN FAILED, response was:", tok)
    raise SystemExit(1)
print("    Login OK.")
AUTH = {"Authorization": "Bearer " + access}

# 2 + 3. Write a journal entry ------------------------------------------------
print("2/5  POST /api/mentor/journal-feed (this WRITE should encrypt at rest) ...")
try:
    created = post_json(
        APP + "/api/mentor/journal-feed",
        {**AUTH, "Content-Type": "application/json"},
        ENTRY,
    )
except urllib.error.HTTPError as e:
    print("    WRITE FAILED:", e.code, e.read().decode())
    raise SystemExit(1)
except urllib.error.URLError as e:
    print("    COULD NOT REACH THE APP at", APP, "-", e)
    print("    Is `npm run dev` still running in the website/ window?")
    raise SystemExit(1)

entry = created.get("entry", {})
print("3/5  POST response (should show your READABLE text):")
print("       impression:", entry.get("impression"))
print("       assent    :", entry.get("assent"))
print("       action    :", entry.get("action"))
has_cipher_in_response = "entry_ciphertext" in entry or "entry_meta" in entry
print("       (ciphertext columns leaked into response?:",
      "YES - BAD" if has_cipher_in_response else "no - good)")

# 4. Read the feed back -------------------------------------------------------
print("4/5  GET /api/mentor/journal-feed (should round-trip to READABLE text) ...")
feed = get_json(APP + "/api/mentor/journal-feed?limit=3", AUTH)
entries = feed.get("entries", [])
if entries:
    top = entries[0]
    print("       newest entry impression:", top.get("impression"))
    print("       readable?:",
          "YES ✓" if str(top.get("impression", "")).startswith("TEST-ENC") else "NO ✗")
else:
    print("       no entries returned - check the feed.")

# 5. Export -------------------------------------------------------------------
print("5/5  GET /api/user/export (journal section should be READABLE) ...")
try:
    export = get_json(APP + "/api/user/export", AUTH)
    rj = export.get("realtime_journal_entries", [])
    if isinstance(rj, list) and rj:
        sample = rj[0]
        print("       export journal impression:", sample.get("impression"))
        print("       readable?:",
              "YES ✓" if str(sample.get("impression", "")).startswith("TEST-ENC")
              else "NO ✗ (or an older row sorted first)")
        leaked = any("entry_ciphertext" in r for r in rj if isinstance(r, dict))
        print("       (ciphertext leaked into export?:", "YES - BAD" if leaked else "no - good)")
    else:
        print("       export returned no journal rows:", rj)
except urllib.error.HTTPError as e:
    print("    EXPORT FAILED:", e.code, e.read().decode())

print("\nDone. Now run the Step 3 SQL check in the TEST dashboard to confirm the")
print("row is CIPHERTEXT at rest (the prose columns should be NULL).")
