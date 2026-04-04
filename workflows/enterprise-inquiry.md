---
workflow_name: Enterprise Inquiry
trigger_description: Handling enterprise/large company inquiries
last_run:
next_scheduled:
---

## Steps

1. Flag inquiry as high priority in support/inbox/ with `priority: high` and `type: enterprise`
2. Research the company:
   - Look up company size, industry, and location
   - Check if they have existing presence in the knowledge base
   - Note any public information about their business model or relevant use cases
3. Create a lead file in leads/active/ with company name, contact information, and initial context
4. Draft initial response that:
   - Acknowledges their interest in SageReasoning
   - Briefly explains API capabilities and evaluation model
   - Offers to schedule a technical briefing or demo
   - References enterprise tier options if applicable
5. Include R3 disclaimer if discussing any evaluative capabilities
6. Escalate to founder with:
   - Research notes on the company
   - Draft response
   - Initial assessment of fit and opportunity
7. Prepare enterprise tier information (pricing, SLAs, custom integration support) for sharing once founder approves

## Ring Governance

- **R10**: Marketplace compliance - ensure enterprise offering aligns with platform policies
- **R3**: Include evaluative disclaimer when discussing API capabilities
- **R9**: Do not promise specific outcomes or performance guarantees
