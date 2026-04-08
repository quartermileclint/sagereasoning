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
2. **Check status claims** — for any component claimed as "wired" or above, run a quick verification (file exists, endpoint responds, page loads)
3. **Check INDEX.md** — confirm it reflects current file locations
4. **Check decision log** — read the latest entries to understand recent context
5. **Report discrepancies** — if anything doesn't match what the handoff note claims, flag it before starting new work

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

## First Use

This framework will first be used during the P0 hold point (0h) when every component claimed as "wired" or above is tested with real data.
