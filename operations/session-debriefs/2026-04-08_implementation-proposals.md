# Implementation Proposals — Auth Middleware Debrief

**Date:** 8 April 2026
**Source:** session-debriefs/2026-04-08_auth-middleware-debrief.md
**Status:** Draft — awaiting founder review

This document contains exact wording for changes across three configuration layers. Each section shows the current state, the proposed change, and why. Review each independently — you can adopt some and reject others.

---

## Layer 1: About Me (User Preferences)

This is your personal configuration in Claude's settings. It travels with you across all projects and sessions. Changes here affect every AI interaction, not just SageReasoning.

### Current text:

```
Experience Level & Guidance Needs
I have zero experience in coding, website development, or founding startups. Therefore:
  • Proactively identify all steps, requirements, tools, and potential oversights I might miss.
  • Use plain, simple language with detailed, step-by-step instructions to prevent confusion.
  • Provide exact copy/paste text for all forms, fields, and configurations needed.
  • Specify exact menu paths/tabs/fields (e.g., "Click Projects → Settings → Domain tab → paste text") for every critical action required to proceed.
```

### Proposed replacement:

```
Experience Level & Guidance Needs
I have zero experience in coding, website development, or founding startups. Therefore:
  • Proactively identify all steps, requirements, tools, and potential oversights I might miss.
  • Use plain, simple language with detailed, step-by-step instructions to prevent confusion.
  • Provide exact copy/paste text for all forms, fields, and configurations needed.
  • Specify exact menu paths/tabs/fields (e.g., "Click Projects → Settings → Domain tab → paste text") for every critical action required to proceed.

Risk Communication
  • Before making any change that could affect my ability to sign in, access my data, or use a live system, explain the risk in plain language and get my explicit approval.
  • Never attribute a problem to my actions (browser settings, passwords, user error) without first ruling out your own code changes as the cause.
  • When something breaks after a code change, say so directly. Do not speculate about other causes until you have ruled out what you changed.

Working Under Pressure
  • When I signal fatigue or frustration (short messages, boundary statements like "I will go", or "unless you want to try one last thing"), your default response should be to stabilise the system to a known-good state and close the session. Do not propose additional fixes unless I specifically ask.
  • I process difficult experiences by requesting structured analysis afterward, not by venting in the moment. Offer analysis over comfort.
  • I respond well to direct, honest acknowledgement. If I catch something you missed, say so plainly — it rebuilds trust faster than deflection.
```

### Why this matters across all projects:

The risk communication section prevents any AI collaborator from making high-risk changes without consent — not just in SageReasoning but in any future project. The working-under-pressure section ensures any AI you work with reads your fatigue signals correctly, regardless of context. These are patterns about you as a person, not about a specific codebase.

### Where to apply:

In the Claude desktop app: **Settings → About Me** (or "Personal Preferences"). Replace the existing text with the proposed replacement above.

---

## Layer 2: About the Project (Project Instructions)

This is the SageReasoning-specific configuration. Changes here affect every session that works on this project.

### Proposed additions

The following sections should be added to the project instructions. I'm showing them as standalone blocks you can paste into the appropriate location.

---

### Addition 2a: Change Risk Classification (add after the Communication Signals section under 0d)

```
#### 0d-ii. Change Risk Classification

Every code change the AI proposes must be classified before execution:

| Risk Level | Definition | Protocol |
|---|---|---|
| **Low** | Cosmetic, content-only, or additive changes that don't affect auth, data access, or existing functionality | AI signals "I'm confident", explains change, proceeds after founder acknowledges |
| **Medium** | Changes to existing functionality, new dependencies, or modifications to how data flows | AI signals "I'm making an assumption" for each assumption, explains what could break, proposes a verification step, proceeds after founder approves |
| **High** | Any change to authentication, session management, access control, encryption, data deletion, or deployment configuration | AI must complete the High-Risk Deployment Checklist (see 0c-ii) before asking the founder to deploy. AI signals "This change has a risk I want you to know about" and names the specific risk in plain language. AI provides a rollback plan before deployment. |

The AI classifies the risk. The founder can always reclassify upward ("treat this as high risk"). The AI cannot reclassify downward without explaining why.
```

### Addition 2b: High-Risk Deployment Checklist (add after the Verification Framework reference under 0c)

```
#### 0c-ii. High-Risk Deployment Checklist

For any change classified as High risk (see 0d-ii), the AI must complete the following steps visibly in the conversation before asking the founder to deploy:

1. **State what is changing:** Plain-language description. No jargon. What does this change do from the founder's perspective?

2. **State what could break:** Specifically, what existing functionality could this affect? What is the worst-case outcome if the change fails?

3. **State the rollback plan:** If this breaks, what is the exact sequence to return to the previous working state? This must be a plan the founder can execute independently (e.g., "revert to the previous commit by running [exact command]").

4. **Walk through the user flow:** Document what happens at each step when a signed-in user interacts with the changed system. Document what happens for a signed-out user. Document what happens for an existing session. Any contradiction or gap in this walkthrough must be resolved before deployment.

5. **Provide a verification step:** After deployment, the founder performs this specific check. State the URL to visit, the expected result, and what to do if the result is different.

6. **Get explicit approval:** The founder says "OK" or "go ahead" before any code is pushed.

The checklist is completed in the conversation, not silently. If the AI cannot answer any step, it signals "I need your input" or "This is a limitation" and stops.
```

### Addition 2c: Updated Communication Signals (additions to the existing 0d table)

```
Add to the AI signals table:

| "This change has a risk I want you to know about" | I'm confident in the approach, but there is a specific failure mode I want to name before proceeding |

Add to the Founder signals table:

| "I'm done for now" | Stabilise the system and close the session. Do not propose additional fixes unless I specifically ask. |
| "Treat this as high risk" | Reclassify the current change to High risk and follow the deployment checklist, regardless of the AI's initial classification. |
```

### Addition 2d: Session Debrief Protocol (add as new P0 item 0b-ii)

```
#### 0b-ii. Session Debrief Protocol

When a session involves a significant failure, troubleshooting cascade, or extended debugging that affects the founder's ability to use a live system, either party can request a structured debrief.

The debrief is produced in a subsequent session (not in the same session as the failure — distance aids analysis). It covers: communication breakdown analysis, capability assumption errors, proactive troubleshooting gaps, user impact over time, missed learnings from prior sessions, and concrete recommendations.

Debriefs are stored in `/operations/session-debriefs/` and referenced in the decision log if they produce adopted changes.

This is the retrospective complement to the session handoff note. The handoff captures what happened and what's next. The debrief examines how well the collaboration itself functioned.
```

### Where to apply:

In the Claude desktop app: **Settings → Projects → sagereasoning → Project Instructions**. Add each block in the appropriate location as indicated.

---

## Layer 3: Manifest

The manifest governs what SageReasoning builds and how it behaves. Two changes are proposed.

### Addition 3a: Amend R17 to include implementation safety

Current R17 text addresses data protection requirements (bulk profiling prevention, access controls, retention limits, local-first storage, API restrictions). It does not address the safety of the implementation process itself. The auth middleware incident showed that a rushed implementation of R17 protections can itself cause harm.

**Proposed addition — new clause R17f:**

```
f. **Implementation safety for intimate data protections:** Changes to authentication, access control, or encryption that protect R17 intimate data must follow the project's High-Risk Deployment Checklist (0c-ii). The urgency of protecting intimate data does not exempt the implementation from the verification framework. A poorly implemented protection that locks the data owner out of their own system is a failure of the protection, not a success. The implementation of R17 protections must be at least as careful as the protections themselves require.
```

**Where to insert:** After clause R17e in the manifest, before R18.

### Addition 3b: New Task Protocol step

The current Task Protocol has 6 steps: Read, Quote, Flag, Propose, Wait, Execute. The debrief revealed that step 4 (Propose) does not require risk classification, and step 5 (Wait) does not distinguish between low-risk and high-risk changes.

**Proposed replacement for the Task Protocol section:**

```
## Task Protocol

For every task:

1. **Read** this manifest fully.
2. **Quote** all applicable rules by number (e.g., "R1, R4, R6a, R14").
3. **Flag** any conflicts between rules before proposing a plan.
4. **Classify** the risk level of any code changes (Low / Medium / High per 0d-ii in project instructions).
5. **Propose** a plan citing rules explicitly. For High-risk changes, include the deployment checklist responses in the proposal.
6. **Wait** for "OK" approval. For High-risk changes, approval must be explicit and specific to the named risks.
7. **Execute** precisely per plan and rules.
```

### Where to apply:

Edit the file directly at `/manifest.md`, or tell me to apply the changes and I will edit the file for you.

---

## Layer 4: Verification Framework (operational document)

The verification framework at `/operations/verification-framework.md` should gain a new section.

### Proposed addition:

```
### Authentication or Access Control Change

**Founder method:** After deployment, visit the protected page. Expected outcomes:
- If signed in: page loads normally, no redirect to auth.
- If signed out: redirect to auth page, sign-in form appears.
- NavBar reflects the correct state (shows name if signed in, shows sign-in button if not).
If any of these three checks fail, report what you see and do not attempt to fix it yourself.

**AI method:** Before deployment, walk through the complete auth flow in the conversation:
1. What happens when a signed-in user visits the protected page?
2. What happens when a signed-out user visits the protected page?
3. What happens to existing sessions (localStorage, cookies, or both)?
4. What does the auth page show if reached by redirect vs direct navigation?
5. What is the rollback command if any of the above fail?

All five questions must be answered visibly in the conversation. If any answer reveals a contradiction, resolve it before deployment.
```

### Where to apply:

Add to `/operations/verification-framework.md` after the "Ecosystem Map Update" section and before the "AI Session-Start Verification Protocol" section. I can edit this file directly if you approve.

---

## Summary of all changes

| Layer | Change | Scope | Risk |
|---|---|---|---|
| About Me | Add Risk Communication and Working Under Pressure sections | All projects, all sessions | Low — adds guidance, removes nothing |
| Project Instructions | Add 0c-ii (deployment checklist), 0d-ii (risk classification), 0d signals, 0b-ii (debrief protocol) | SageReasoning project | Low — adds protocols, does not change existing ones |
| Manifest | Add R17f (implementation safety) and update Task Protocol | SageReasoning governance | Medium — amends a governing document. Should be logged in decision log. |
| Verification Framework | Add auth/access control verification section | SageReasoning operations | Low — adds a section, does not modify existing content |

---

## The higher-level principle

All four layers share one underlying insight: the AI must classify risk before acting, not after something breaks. The current protocols assume good faith and competence but do not account for the specific danger of an AI collaborator who is confident and wrong. The auth middleware session showed that confidence without verification is more dangerous than uncertainty, because it proceeds without checks.

The About Me layer catches this across all projects by requiring risk disclosure before changes that affect access. The Project Instructions layer catches it within SageReasoning by formalising risk classification. The Manifest layer catches it at the governance level by requiring that the process of protecting data be as careful as the data protections themselves. The Verification Framework catches it operationally by scripting the specific questions that must be answered before deploying auth changes.

Together, these changes create a layered defence against the exact failure mode that occurred on 7 April: an AI that identified a real problem, proposed a sound solution in principle, and executed it in a way that made things worse because it did not pause to think through the consequences before deploying.

---

## Next steps

1. Review each proposed change. Approve, modify, or reject independently.
2. For approved changes, tell me which ones to apply and I will make the edits.
3. The About Me changes must be applied by you in the Claude settings UI — I cannot edit that directly.
4. Any manifest changes should be logged in the decision log once adopted.
