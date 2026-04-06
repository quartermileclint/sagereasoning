---
name: quarterly-compliance-pipeline
description: Run the 7-stage regulatory compliance pipeline: scan for changes, assess impact, update register, review files, flag mandate revisions, and log the audit trail.
---

You are running the SageReasoning Quarterly Compliance Pipeline (R14). Execute all 7 stages in order.

CONTEXT: Read /sessions/admiring-funny-bohr/mnt/sagereasoning/SageReasoning_Evolving_Compliance_Pipeline.docx for full pipeline documentation. Read /sessions/admiring-funny-bohr/mnt/sagereasoning/manifest.md for governance rules R1–R14. Read /sessions/admiring-funny-bohr/mnt/sagereasoning/compliance_register.json for the current register state.

STAGE 1 — REGULATORY SCAN
Search the web for changes to:
- EU AI Act (classification guidance, enforcement updates, new implementing acts)
- Australian AI policy (VAISS mandatory conversion, AI Safety Institute publications)
- Australian Privacy Act reform bill
- GDPR amendments or new guidance affecting AI evaluation services
- NIST AI RMF updates
- ISO/IEC 42001 updates
- ACCC enforcement actions against AI companies
- ASIC guidance on AI and financial services

For each change found, record: regulation name, change summary, date, source URL.

STAGE 2 — IMPACT ASSESSMENT
For each regulatory change found in Stage 1:
- Map it to affected CR-IDs in compliance_register.json
- Map it to affected mandate rules (R1–R14)
- Classify impact as: None, Minor (wording change needed), Major (structural change needed), or Critical (blocks operation)
- List affected files (using the place-marker fields to identify which files have relevant regulatory_references)

STAGE 3 — REGISTER UPDATE
Update compliance_register.json:
- Change status fields where warranted
- Update notes with new findings
- Add new actions where needed
- Set next_review_due to the next quarter's first Monday
- Add new CR-IDs if entirely new obligations are discovered
- Save the updated file

STAGE 4 — FILE-LEVEL REVIEW
For each file affected by Stage 2 findings:
- Read the file's @compliance place-marker block
- Check if the file's language or logic conflicts with the new regulatory requirements
- If deprecated language is found, set deprecation_flag to true in the place-marker block
- Draft specific amendment text for any changes needed
- Update last_regulatory_review and compliance_version in the place-marker block

STAGE 5 — MANDATE REVISION CHECK
If any Stage 2 findings are classified as Major or Critical:
- Draft a proposed amendment to the affected manifest rule(s)
- If a new rule is needed (R15+), draft it
- Flag this for founder approval — do NOT modify manifest.md without approval

STAGE 6 — CODEBASE COMPLIANCE
For any code files affected (sage-mentor/*.ts, security.ts, API routes):
- Run a compliance check in the same format as the existing P*.md review reports
- Check each applicable rule (R1–R14) against the file's current implementation
- Report any non-compliance found

STAGE 7 — AUDIT TRAIL
Append a new entry to /sessions/admiring-funny-bohr/mnt/sagereasoning/compliance_audit_log.json with:
{
  "run_date": "[today's ISO date]",
  "run_type": "quarterly" or "out-of-cycle",
  "trigger": "scheduled quarterly review",
  "regulatory_changes_found": [list from Stage 1],
  "impact_assessments": [list from Stage 2],
  "register_updates": [list of CR-IDs changed in Stage 3],
  "files_reviewed": [list from Stage 4],
  "mandate_revisions_proposed": [list from Stage 5, or "none"],
  "codebase_compliance_status": "pass" or "issues found",
  "actions_for_founder": [list of items requiring founder decision],
  "next_scheduled_run": "[next quarter first Monday ISO date]"
}

OUTPUT: Present a concise summary of findings to the founder, highlighting any items that require a decision. If no regulatory changes were found, confirm the register is current and no action is needed.