---
workflow_name: Weekly Pattern Summary
trigger_description: Weekly review of support patterns and trends
last_run:
next_scheduled: "Every Monday 9:00 AM"
---

## Steps

1. Count total customer interactions this week:
   - Review all items in support/inbox/ from the past 7 days
   - Include: new inquiries, follow-ups, billing issues, technical support
   - Record total count and break down by type
2. Calculate key metrics:
   - **Resolution rate**: (resolved issues / total issues) × 100%
   - **Escalation rate**: (escalated issues / total issues) × 100%
   - Note any concerning trends (e.g., increasing escalations)
3. Identify top 3 support topics this week:
   - Most common customer questions or issues
   - Categorize as: product questions, API technical, billing, governance, other
   - Note if same topics are recurring week-to-week
4. Review governance flags:
   - Count how many inquiries triggered R1, R2, R10 this week
   - Note if specific patterns emerge (e.g., repeated employment evaluation questions)
   - Flag if any rule is being triggered more frequently than expected
5. Assess knowledge base coverage:
   - Are common questions already addressed in knowledge-base/?
   - Identify gaps where new articles should be created
   - Flag which existing articles may need updating based on repeated questions
6. Generate pattern summary document containing:
   - Week ending date
   - Summary statistics (total interactions, resolution %, escalation %)
   - Top 3 topics with brief description of each
   - Governance flags summary
   - Knowledge base recommendations
   - Trend analysis and observations
7. Sync pattern summary and metrics to Supabase weekly_patterns table
8. Create notification in notifications/outbox/ for founder with:
   - Weekly overview
   - Key metrics and trends
   - Any urgent patterns requiring attention
   - Knowledge base update recommendations

## Ring Governance

- **R1, R2, R10**: Monitor for governance patterns and escalation trends
- **R3**: Track if evaluative content disclaimers are being consistently applied
- **R9**: Ensure outcome promises are not being made in responses
