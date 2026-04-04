---
workflow_name: New Customer Inquiry
trigger_description: Standard response flow for new customer questions
last_run:
next_scheduled:
---

## Steps

1. Check support/inbox/ for open items awaiting response
2. Read and understand the customer message, noting their specific question or concern
3. Search knowledge-base/ for relevant articles and documentation that address the inquiry
4. Draft a response that:
   - Directly addresses the customer's question
   - References relevant knowledge base articles
   - Provides clear next steps or guidance
5. Include R3 disclaimer if response contains any evaluative content or guidance ("Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.")
6. Set support file status to `in_progress` in frontmatter
7. Submit draft to ring for review
8. Wait for founder approval before sending response to customer

## Ring Governance

- **R3**: Disclaimer on evaluative output required for any guidance or recommendations
- **R1**: Ensure response does not imply therapeutic use
- **R9**: Do not promise specific outcomes or guarantees
