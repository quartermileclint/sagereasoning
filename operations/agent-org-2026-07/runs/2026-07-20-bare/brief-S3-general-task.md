# Task Brief — Refresh a Stale Capability Inventory

You have been given a capability inventory document for a software project ("the project"), written about six weeks ago, alongside the project's current, verified state (a status log covering everything that has shipped since the inventory was written).

## Your task

Produce three deliverables:

1. **An updated capability inventory** — same structure/shape as the original, but reflecting what is actually true of the project now, not six weeks ago. Correct anything the original got wrong or that has since changed; add anything materially new; remove or mark anything that's no longer accurate.
2. **A findings memo** — what changed since the original inventory was written, and why each change matters (not just "X shipped" but what it means for how the project should be described, positioned, or relied upon going forward). Call out anything where the original inventory's framing is now actively misleading if left uncorrected, not merely incomplete.
3. **A recommendation set** — for whoever next relies on this inventory (e.g., someone using it to brief an investor, a partner, or a new team member): what should they do differently now versus six weeks ago? Include any judgement calls you'd flag as needing a decision-maker's sign-off rather than being safe to just state as fact (for example: claims about production-readiness, safety posture, or what is or isn't "live" versus merely "built").

You will be given (a) the original inventory document and (b) a log of everything that has happened on the project since. Work from those two inputs plus your own judgement about what matters. Write for a reader who will act on your memo without independently re-verifying it — so be precise about what you are confident of versus inferring, but don't hedge everything into uselessness.

Output all three deliverables as separate markdown files.

---

**Inputs provided:**
- `original-inventory.md` — the capability inventory as originally written
- `project-status-log.md` — everything material that has happened on the project since
