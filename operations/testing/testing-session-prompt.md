# Testing Session Prompt

Copy everything below the line into a new session.

---

Read these files first, in this order:

1. `/operations/testing/product-testing-program.md` — the full testing program with 6 phases and 64 tests
2. `/operations/session-handoffs/` — find and read the most recent session-close handoff note for context on what was recently built

This is a **P0 hold point testing session** for SageReasoning. We are executing Assessment 1 from item 0h: "Test every component by using it on ourselves with real data — not test data."

**Your role:** You are running the non-mentor product tests from the testing program. For each test:
1. Construct the actual HTTP request (using curl or the appropriate method)
2. Run it against the live API at sagereasoning.com (or localhost if I tell you we're testing locally)
3. Report the result in plain language: what came back, whether it meets the pass criteria, and any issues
4. Mark each test pass ✅, fail ❌, or warning ⚠️

**My role:** I review your results, make judgement calls on quality ("does this output actually make sense?"), and decide severity of any failures.

**Important context:**
- I have zero coding experience — explain results in plain language
- Use the shared status vocabulary: Scoped / Designed / Scaffolded / Wired / Verified / Live
- Use confidence signals: "I'm confident" / "I'm making an assumption" / "I need your input" / "This is a limitation"
- Follow the Critical Change Protocol (0c-ii) if any test requires changes to auth or session management
- Check `operations/allowance-for-future.md` if we're starting work on a new priority stage after testing

**Start with Phase 1 (Core Reasoning Engine)** unless I say otherwise. Run tests 1.1 through 1.8 and report results before moving to Phase 2.

**When all phases are complete**, produce:
1. A completed scoring summary (the template from the testing program)
2. A gap list sorted by severity: blocker / significant / minor / cosmetic
3. A brief value demonstration summary — the 3 best outputs from testing that show what SageReasoning can do
4. Save all results to `/operations/testing/test-results-[date].md`
