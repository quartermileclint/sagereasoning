# SageReasoning — Verification Framework

P0 item 0c. Defines how the founder (who can't read TypeScript) and the AI (which can't persist between sessions) verify each other's work.

---

## Principle

Neither party trusts prior output without checking. The founder verifies by observable outcomes. The AI verifies by running checks at session start rather than assuming prior work is intact.

---

## Verification Methods by Work Type

### Website Page
**Founder method:** Open the URL in a browser. Check that the content, layout, and navigation match the specification. Compare against any mockup or description provided.
**AI method:** At session start, fetch the live URL and compare rendered content against the specification on file.

### API Endpoint
**Founder method:** AI provides a ready-to-paste test command (curl or browser URL) with the exact expected output. Founder runs it and compares.
**AI method:** Run the test command programmatically and compare response against expected schema and values.

**Template for founder:**
```
STEP 1: Open your terminal (or browser)
STEP 2: Paste this exact command: [command here]
STEP 3: You should see: [expected output here]
STEP 4: If you see something different, tell me what you see
```

### Database Change
**Founder method:** AI runs a query and shows the result in plain language. Founder confirms the data looks correct.
**AI method:** Query the database directly and validate against the expected state.

### Governance Implementation (Manifest Rules)
**Founder method:** AI produces a checklist showing each requirement from the rule alongside what's been implemented, with a status for each item. Founder reads the checklist and confirms.
**AI method:** Parse the manifest rule, enumerate requirements, check each against the codebase.

**Template:**
```
Rule R[X] requires:
[ ] Requirement 1 — Status: [implemented/not started/partial] — Evidence: [where to look]
[ ] Requirement 2 — Status: ...
```

### Business Document
**Founder method:** Read the document directly. No translation layer needed.
**AI method:** Read the document and flag any inconsistencies with the manifest, decision log, or current project state.

### Manifest or Project Instructions Change
**Founder method:** Read the proposed change. Compare against the current version. Approve or reject.
**AI method:** Diff the proposed change against the current version. Flag conflicts with other rules.

### Code Change (New Feature or Fix)
**Founder method:** AI describes what the change does in plain language, then provides a verification step the founder can perform (e.g., "click this button and you should see X", or "run this command and check the output").
**AI method:** Run tests if they exist. If no tests, manually verify the change produces the expected behaviour.

### File Organisation Change
**Founder method:** Check that files are in the expected locations. Open INDEX.md and confirm it matches reality.
**AI method:** Run `ls` commands to verify file locations match INDEX.md. Flag any discrepancies.

### Ecosystem Map Update
**Founder method:** Open the HTML file in a browser. Use the search/filter to find the updated component. Confirm the status, path, and description are correct.
**AI method:** Read the JavaScript data array and validate paths exist, statuses are consistent, and no components are missing.

### Authentication or Access Control Change
**Founder method:** After deployment, check three things:
1. Visit a protected page while signed in — page should load normally.
2. Visit a protected page in an incognito/private window (not signed in) — should redirect to sign-in.
3. Check the NavBar on any page — should show your name if signed in, or a sign-in button if not.
If any of these three checks fail, report what you see. Do not attempt to fix it.

**AI method:** Before deployment, answer five questions in the conversation:
1. What happens when a signed-in user visits the protected page?
2. What happens when a signed-out user visits the protected page?
3. What happens to existing sessions (localStorage, cookies, or both)?
4. What does the auth page show if reached via redirect vs direct navigation?
5. What is the exact rollback command if any of the above fail?

All five questions must be answered visibly in the conversation. If any answer reveals a contradiction, resolve it before deployment.

---

## AI Session-Start Verification Protocol

At the start of any session continuing previous work:

1. **Read the latest session handoff note** in `/operations/session-handoffs/`
2. **Check knowledge-gaps.md** — scan `/operations/knowledge-gaps.md` for any concepts relevant to today's planned work. If a listed concept applies, read the resolution before beginning — do not re-derive it in the session.
3. **Check status claims** — for any component claimed as "wired" or above, run a quick verification (file exists, endpoint responds, page loads)
4. **Check INDEX.md** — confirm it reflects current file locations
5. **Check decision log** — read the latest entries to understand recent context
6. **Report discrepancies** — if anything doesn't match what the handoff note claims, flag it before starting new work

---

## Verification Signals

When reporting verification results, use these signals:

| Signal | Meaning |
|--------|---------|
| VERIFIED | Checked and confirmed working as expected |
| PARTIAL | Some aspects verified, others could not be checked (explain which) |
| FAILED | Does not match expected state (explain what's wrong) |
| UNABLE | Cannot verify from this environment (explain why and what the founder should check) |

---

## Pre-Commit Checklist

Before any commit to the codebase, the AI completes every applicable item. Items marked "always" run on every commit. Items marked "when applicable" run when the described condition is true.

### Always

- [ ] `npx tsc --noEmit` passes in `website/` — zero errors, zero warnings treated as errors. If it fails, the commit does not proceed. *(Milestone review finding 2.1)*

### When Applicable

- [ ] **New Supabase table or migration:** After running the migration, verify both (a) the table exists and (b) RLS is active with correct policies by running a test insert + select as the authenticated user. *(Finding 2.2)*
- [ ] **Safety-critical function (R17, R18, R20):** At least one endpoint calls the function, and a test confirms the end-to-end path. Status may not advance to "Wired" unless this is demonstrated. *(Finding 1.2)*
- [ ] **Bulk wiring or refactoring (3+ endpoints changed):** A before/after diff checklist was produced showing exactly which endpoints get which changes. The founder reviewed the checklist before execution. *(Finding 1.1)*
- [ ] **Static public files changed (llms.txt, agent-card.json):** Content verified in browser — vocabulary matches current API schema, version matches current API version. *(Finding 1.4)*

---

## Pre-Deployment Checklist

After pushing to GitHub, before asking the founder to test on production:

- [ ] Vercel deployment hash matches the latest commit. Check at Vercel dashboard → Deployments, or compare `/api/health` response if commit hash is exposed. Do not test until the deployment is confirmed live. *(Finding 4.4)*
- [ ] All required env vars are set in Vercel (reference Section 6 of TECHNICAL_STATE.md). Pay attention to any new env vars introduced in this session. *(Finding 2.3)*
- [ ] If the change is **Elevated** or **Critical** (per 0d-ii): rollback plan documented in the conversation before founder deploys.

---

## Knowledge Gap Carry-Forward Rule

**Added:** 18 April 2026 (pre-implementation verification, gap remediation)

During any session, if a concept requires re-explanation (the AI explains something it has explained in a prior session, or the founder asks about something that was previously resolved):

1. **Flag it in the handoff note** under a new section "Knowledge Gap Flags" with the concept name and a cumulative count across sessions.
2. **At 3 cumulative re-explanations:** Add the concept to `/operations/knowledge-gaps.md` with the resolution that finally stuck. Do not attempt another in-session explanation — point to the knowledge-gaps.md entry instead.
3. **If the concept already exists in knowledge-gaps.md:** Update the count and refine the resolution if the new explanation was clearer.

**Handoff note format for flagging:**
```
## Knowledge Gap Flags
- [Concept name]: re-explanation #[N] (cumulative). Context: [why it came up this session]
```

This rule exists because seven concepts required 3-5 re-explanations across the P0 build. Each re-explanation consumed session time and produced inconsistent resolutions. A single, maintained reference file breaks the cycle.

---

## Pre-Session Environment Check

At the start of any session that will involve testing or deployment:

- [ ] Confirm required env vars are set by checking TECHNICAL_STATE.md Section 6 against Vercel. Flag any that are missing or unverified.
- [ ] Note any rate-limit-sensitive services being used (Supabase auth, Anthropic API, Vercel deployments). Before suggesting retries, state the expected rate limit window. *(Finding 2.4)*

---

## First Use

This framework will first be used during the P0 hold point (0h) when every component claimed as "wired" or above is tested with real data.
