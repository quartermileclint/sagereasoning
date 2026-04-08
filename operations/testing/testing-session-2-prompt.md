# Prompt — Copy and paste everything below into a fresh session

---

This is a continuation of the P0 hold point testing session for SageReasoning. Read these files first, in this order:

1. `/operations/session-handoffs/2026-04-08_testing-session-close.md` — what happened last session
2. `/operations/testing/test-results-2026-04-08.md` — current test results (33/64 passed, 30 deferred)
3. `/operations/testing/product-testing-program.md` — the full testing program with all 64 test definitions

**What needs to happen this session:**

**Step 1 — Create an sr_live_ API key.** I need you to walk me through creating a test API key in the Supabase api_keys table. I have zero coding experience so be specific: tell me exactly where to go, what to click, and what to paste. The key format is `sr_live_` followed by 32 hex characters.

**Step 2 — Run the 30 deferred tests.** Once the API key exists, run:
- Phase 3: Tests 3.1–3.9 (guardrail, deliberation chain, skill execution, composition, MCP tools)
- Phase 4: Tests 4.2, 4.4–4.6, 4.9–4.10 (baseline retake block, assessment scoring, receipts, milestones)
- Phase 6: Tests 6.1–6.14 (all 14 marketplace skills via /api/execute)
- Also re-run test 1.7 (urgency detection) to confirm the fix

**Step 3 — Clean up debug fields.** Remove debug_version, debug_parse_error, and debug_tail from the evaluate endpoint error response in `/website/src/app/api/evaluate/route.ts`. These were added during troubleshooting and should be removed before launch.

**Step 4 — Update the test results file.** Merge new results into `/operations/testing/test-results-2026-04-08.md` (or create a new dated file if appropriate). Produce the final:
1. Completed scoring summary (should now cover all 64 tests)
2. Gap list sorted by severity
3. Value demonstration summary (pick the 3 best outputs from across all phases)

Save everything to `/operations/testing/`.

**Important context:**
- I have zero coding experience. Walk me through anything that requires me to do something.
- The site is at https://www.sagereasoning.com (Vercel + Supabase + Anthropic API)
- Use the shared status vocabulary: Scoped / Designed / Scaffolded / Wired / Verified / Live
- Use the communication signals from the project instructions
- If something breaks, tell me directly and own it — don't suggest the problem is on my end unless you've ruled out your own changes first
