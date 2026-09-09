/**
 * index.ts — the Cognitive OS Phase 1 state library.
 *
 * A pure, deterministic, dependency-free TypeScript library. No env, no I/O, no
 * DB, no network, no clock read, no randomness. Nothing here is wired to any live
 * response, any route, any flag or any table.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠ MANDATORY PLACEMENT NOTE — Q4 ruling, 2026-09-08: "The note is not optional."
 *
 * THIS LIBRARY'S LOCATION AT `website/src/lib/cognitive-os/` — OUTSIDE
 * `substrate/` — WAS CONSTRAINT-DRIVEN BY THE OBSERVATION WINDOW, NOT CHOSEN ON
 * ARCHITECTURAL GROUNDS, AND MAY BE REVISITED AFTER THE WINDOW CLOSES.
 *
 * A FUTURE SESSION MUST NOT TREAT `cognitive-os/` AS ARCHITECTURALLY SETTLED.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ⚠ WHAT PHASE 1 IS NOT
 *   - It is NOT an actor. Nothing here instantiates one. `Laboratory`, `Attic`,
 *     `Archive` and `Threshold` are PERMISSION SCOPE IDENTIFIERS ONLY (C2), and
 *     any later use of them to instantiate an actor requires its own scoping.
 *   - It is NOT an executor. There is no tool call, command, network call or
 *     scheduler anywhere in it. Threshold produces an AUTHORISED PROPOSAL (C9);
 *     the loop proposes, it never executes.
 *   - It is NOT persistent. The event store is IN-MEMORY by ruling. The table is
 *     its own founder-walked step, and it is OWED WITH: schema, data-rights
 *     wiring (`/api/user/access`, `/export`, `/delete`, `/api/credential/erase`),
 *     a `retain_until` column, a retention sweep, and the migration. That
 *     obligation is carried here so the table step opens with it on the surface.
 *   - It does NOT touch the Stoic harness. It imports nothing from it, and the
 *     live Gate-1 harness continues to fire per action, untouched (Q5).
 *
 * ⚠ STANDING CONSTRAINTS THIS LIBRARY DOES NOT AND CANNOT CLEAR
 *   The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
 *   founder's. Nothing in Phase 1 bears on any of them, and C7 tightens rather
 *   than relaxes the weights position.
 */

export * from './types'
export * from './claim'
export * from './event-store'
export * from './dependency-graph'
export * from './belief-state'
export * from './truth-maintenance'
export * from './belief-revision'
export * from './handoff-envelope'
export * from './permissions'
