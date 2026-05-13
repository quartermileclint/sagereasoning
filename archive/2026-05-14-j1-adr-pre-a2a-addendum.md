# J1 ADR — Pre-A2A-Addendum Snapshot

**Archived:** 2026-05-14 under `D-AGENT-CARD-CURRENCY-CHECK-2026-05-14` per project-instructions §0e (preserve-prior-versions discipline).
**Source:** `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` §"Agentic-commerce-stack adjacency" sub-section, lines 46-79 as of 2026-05-14 session-open.
**Reason for archive:** the J1 ADR is being amended in the Anthropic-native posture session to add an A2A (Agent2Agent) protocol addendum to the agentic-commerce-stack-adjacency sub-section. The addendum names A2A as the foundational coordination protocol layer underneath the commerce-flow protocols (ACP/UCP/AP2/MPP/AgentCore Payments). This snapshot preserves the pre-addendum state of the sub-section.
**Rollback path:** `git revert` of the addendum commit restores the prior J1 ADR text; this archive file persists either way as a verbatim record of the pre-amendment state.

---

## Prior text — `Agentic-commerce-stack adjacency` sub-section (verbatim, as of 2026-05-14 session-open)

### Agentic-commerce-stack adjacency

The May 2026 agentic-commerce inbox synthesis (see `/operations/handoffs/founder/2026-05-12-agentic-commerce-inbox-synthesis-close.md`) identified a six-layer responsibility framework that the agentic-commerce protocols collectively address:

1. **Discovery** — ranking, recommendation, comparison, substitution; the surface where intent forms
2. **Authorization** — the evidence layer recording what the buyer (or buyer's organisation) approved the agent to do
3. **Payment credential** — the card, token, wallet, or stablecoin address the agent uses to pay
4. **Settlement** — how money moves; rail, timing, currency, reconciliation
5. **Merchant relationship** — order management, fulfillment, returns, refunds, support, disputes
6. **Governance** — spending policies, vendor lists, budget limits, audit trails, revocation authority

The agentic-commerce protocols map onto these layers:

- **ACP** (Agentic Commerce Protocol; OpenAI + Stripe) — agent-to-merchant checkout; primarily authorization + payment credential
- **UCP** (Universal Commerce Protocol) — merchant-system interoperability; primarily merchant relationship + settlement
- **AP2** (Agent Payments Protocol; Google) — delegated authorization records ("mandates") with scope + constraints + proof of approval; primarily authorization + governance
- **MPP / x402** (Machine Payments Protocol) — machine-to-machine payment rails; primarily settlement + payment credential
- **AWS AgentCore Payments** — enterprise governance of agent spending; primarily governance + authorization

**Character Kernel's position relative to the stack: upstream of commerce.** The judgment primitive that informs commerce action but is not itself in the commerce stack.

[remainder of sub-section preserved verbatim in the live ADR; see git history for full content]

---

*End of archive. The amended J1 ADR in `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` is the operative version from 2026-05-14 onward.*
