/**
 * founder-facts.ts — Stable biographical context for the practitioner
 *
 * `FounderFacts` is the practitioner's stable biographical context — who the
 * person IS, alongside their evolving philosophical profile. Injected at the
 * top of the full profile summary so the mentor arrives knowing who the
 * practitioner is as a person, not just their reasoning patterns. Updated
 * manually or by the mentor via session observations.
 *
 * Originally defined in `/website/src/lib/mentor-profile-summary.ts`.
 * Promoted to `/sage-mentor/` on 2026-04-25 under ADR-Ring-2-01 Session 2 so
 * the canonical `MentorProfile` (defined in `./persona.ts`) can reference it
 * without crossing the sage-mentor → website encapsulation boundary. The
 * website's `MentorProfileData` interface continues to consume the same type
 * via a re-export from `mentor-profile-summary.ts`.
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-25
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-002]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance, AU Privacy Act reform]
 * deprecation_flag: false
 */

/**
 * Stable biographical context that persists across sessions.
 *
 * Field semantics are unchanged from the original website definition. The
 * `additional_context` array carries mentor-appended observations about life
 * circumstances, stable traits, relationships, or context that should
 * persist across sessions.
 */
export interface FounderFacts {
  age: number
  years_married: number
  children_ages: number[]
  work_schedule: string
  family_situation: string
  financial_situation: string
  retirement_horizon: string
  /** Mentor-appended observations about life circumstances, stable traits,
   *  relationships, or context that should persist across sessions. */
  additional_context: string[]
  last_updated: string
}
