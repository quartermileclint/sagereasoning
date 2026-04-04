---
workflow_name: Governance-Flagged Inquiry
trigger_description: Customer inquiry triggers R1, R2, or R10 governance flags
last_run:
next_scheduled:
governance_flags:
---

## Steps

1. Immediately set support file status to `escalated` in frontmatter
2. Document which governance rule(s) were triggered:
   - **R1**: Inquiry implies therapeutic use or health claim
   - **R2**: Inquiry could constitute employment evaluation
   - **R10**: Inquiry raises marketplace compliance concerns
3. Add detailed notes explaining why the rule applies:
   - Quote the specific language from customer inquiry that triggered the flag
   - Explain the governance concern and why founder review is required
4. **DO NOT draft a response** to the customer:
   - Governance-sensitive inquiries must be handled directly by founder
   - Do not make assumptions about what response is appropriate
5. Create notification in notifications/outbox/ for founder containing:
   - Full customer message and context
   - Governance flags identified
   - Reasoning for each flag
   - Customer account and communication history
6. Add `governance_flags: [R1|R2|R10]` to support file frontmatter
7. Tag inquiry as requiring founder-only response

## Ring Governance

- **R1**: No therapeutic implication - escalate any inquiry suggesting therapeutic benefit
- **R2**: No employment evaluation - escalate inquiries about candidate assessment or hiring decisions
- **R10**: Marketplace compliance - escalate inquiries that may violate platform policies or terms
