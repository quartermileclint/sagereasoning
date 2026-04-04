---
workflow_name: API Support Request
trigger_description: Technical API support and troubleshooting
last_run:
next_scheduled:
---

## Steps

1. Identify which endpoint the customer is having issues with (e.g., /evaluate, /reasoning, /batch)
2. Check knowledge-base/api/ for relevant articles covering:
   - Endpoint documentation
   - Common error codes and solutions
   - Rate limiting behavior
   - Authentication requirements
3. Determine if the issue is a known limitation or known bug:
   - Search existing support records for similar reports
   - Check if a workaround has been documented
   - Note if issue is within normal API constraints
4. Draft technical response that:
   - Clearly explains the root cause or limitation
   - Provides code examples where helpful to illustrate solution
   - Links to relevant documentation articles
   - Offers next steps for resolution
5. Include rate limit information if relevant:
   - Current plan limits
   - How to request increased quotas
   - Retry strategy recommendations
6. Ensure R3 disclaimer appears if response discusses any evaluative content or capabilities
7. Set status to `in_progress` and submit for founder review before sending

## Ring Governance

- **R3**: Disclaimer required if discussing evaluative capabilities or output interpretation
- **R9**: Do not promise specific performance improvements or guaranteed fixes
- **R10**: Ensure response aligns with documented API policies and tier limits
