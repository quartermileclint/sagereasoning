-- ============================================================
-- STOA ST2 — the stoa_entries table (2026-08-03)
-- Run in the Supabase SQL editor. TEST first, then PRODUCTION.
-- Founder-walked per PR17. Run §0 alone first (read-only); then
-- apply §1–§3 AS A SINGLE PASTE — run separately, §1 alone would
-- leave the new table on Supabase's default grants with RLS off
-- until §2/§3 land (the exact ST1 window; one paste closes it via
-- the SQL editor's implicit transaction).
-- The table is INERT until ST5 flips
-- SUBSTRATE_STOA_ENABLED — no live route reads or writes it on
-- this session's deploy (data-rights coverage is missing-table-
-- benign / empty-safe by construction).
--
-- What this creates: the Stoa's entry model — one voluntary
-- self-declaration per practitioner (human or agent), per the
-- fourteen adopted mentor rulings (binding verbatim record:
-- operations/connective-layer-2026-08/2026-08-02-mentor-
-- consultation-connective-layer-verbatim.md; plan §2 constraint
-- numbers cited per column below).
--
-- DELIBERATE ABSENCES (each a ruling, not an oversight):
--   • NO retain_until and NO retention-sweep participation —
--     entries are STANDING declarations that persist until
--     withdrawn or erased; silent expiry is prohibited (#24, Q9).
--     This is a deliberate contrast with the 90-day practice
--     records (agent_assessment_history etc.).
--   • NO engagement columns of any kind — no view counts, no
--     last-seen, no click/match/analytics column. Prohibited for
--     internal use as much as external display (#23, Q8
--     sharpened). Adding one later contradicts the binding
--     record; it is not an enhancement.
--   • NO practice-derived columns — no stage, tier, milestone,
--     alignment (#18, Q6a) and no evaluative field of any kind
--     (#20, Q6c: structural separation from trust/practice).
-- ============================================================

-- ------------------------------------------------------------
-- §0 DIAGNOSTIC (read-only — run FIRST, record the output in
--    the session notes before applying §1+)
-- ------------------------------------------------------------
SELECT
  (SELECT count(*) FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'stoa_entries')
    AS stoa_entries_exists,
  (SELECT count(*) FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'profiles')
    AS profiles_exists,
  (SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'stoa_entries')
    AS stoa_entries_columns_if_any;
-- Expected on first run: stoa_entries_exists = 0, profiles_exists = 1,
-- stoa_entries_columns_if_any = NULL. If stoa_entries_exists = 1,
-- this migration is idempotent (CREATE TABLE IF NOT EXISTS) ONLY
-- when the found columns match §VERIFY V1's expected list exactly —
-- compare them BEFORE proceeding. If they DIFFER, STOP and resolve
-- the remnant deliberately (a hand-created same-name table would be
-- silently skipped by CREATE TABLE IF NOT EXISTS and then wrongly
-- blessed by §2/§3) — do not proceed on the idempotency claim.

-- ------------------------------------------------------------
-- §1 The table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stoa_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity floor (#13, Q4a): account-holding (humans) XOR
  -- credential-binding (agents). Exactly one of the two identity
  -- anchors is present (CHECK below). profiles.id = the auth user
  -- id (NOT user_id — the standing keying lesson).
  owner_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id TEXT,             -- K1-canonical namespace:name@version (store-validated)
  credential_ref TEXT,       -- 'api_key:<uuid>' — the owning credential (agent rows;
                             -- accountability anchor, #13; erasure key for
                             -- /api/credential/erase)

  -- The declaration itself — the practitioner's OWN words (#15, Q5a:
  -- self-declared framing carried by form). All three voluntary — a
  -- row may exist with any subset (plan §3 ST2).
  what_i_bring TEXT,
  what_i_seek TEXT,
  contact_channel TEXT,      -- carries whatever further identity the
                             -- practitioner chooses to extend (#14, Q4b)

  -- Per-entry visibility, declarer-chosen (#1, Q1). NO DB default:
  -- the default is identity-conditional (human → 'community',
  -- agent → 'public') and is applied at the store layer.
  visibility TEXT NOT NULL
    CONSTRAINT stoa_entries_visibility_check
    CHECK (visibility IN ('community', 'public')),

  -- Tags: domains of work and inquiry, NEVER qualities of the
  -- practitioner (#10, Q3c — "experienced/advanced/trusted" are
  -- evaluative and must not appear). The vocabulary discipline is
  -- enforced at the ST3 seed-vocabulary battery; the column carries
  -- the ruling now.
  tags TEXT[] NOT NULL DEFAULT '{}',

  -- Honest ageing (#12, Q3e; #24, Q9): declared_at is when the
  -- declaration was made (the ONLY ordering key, #8 Q3a — recency
  -- of declaration, nothing else); renewed_at is when the
  -- practitioner last tended it (renewal or content edit). Renewal
  -- deliberately does NOT reorder — a renewal-bumps-recency design
  -- would make renewal a float-to-top lever, an engagement-adjacent
  -- incentive the space must not create (#23 spirit).
  declared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  renewed_at TIMESTAMPTZ,

  -- Lifecycle (#16, Q5b). 'withdrawn' = the practitioner's own act
  -- (reversible by re-declaring — reactivates this row). 'removed' =
  -- platform action on EXACTLY the three grounds below; the removed
  -- row persists as the accountability record. Erasure (data rights)
  -- hard-deletes regardless of status.
  status TEXT NOT NULL DEFAULT 'active'
    CONSTRAINT stoa_entries_status_check
    CHECK (status IN ('active', 'withdrawn', 'removed')),

  -- Removal ONLY on the three ruled grounds (#16, Q5b). Modesty is
  -- never grounds; the line is honest vs dishonest/harmful presence.
  removal_ground TEXT
    CONSTRAINT stoa_entries_removal_ground_check
    CHECK (removal_ground IN
      ('dishonesty_examined', 'injustice_facilitation', 'spam_flooding')),
  -- The Q5b examined-artifact standard for dishonesty removal —
  -- "accusation alone never suffices"; the platform is not the sole
  -- judge. Structural: a dishonesty removal MUST carry the examined
  -- artifact reference (see stoa_entries_dishonesty_requires_artifact).
  removal_artifact_ref TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Identity XOR (#13): exactly one of the two anchors.
  CONSTRAINT stoa_entries_identity_xor CHECK (
    (owner_user_id IS NOT NULL)::int + (agent_id IS NOT NULL)::int = 1
  ),
  -- An agent row must carry its owning credential (#13 accountability;
  -- also the /api/credential/erase deletion key).
  CONSTRAINT stoa_entries_agent_requires_credential CHECK (
    agent_id IS NULL OR credential_ref IS NOT NULL
  ),
  -- A human row must not carry a credential_ref (the anchor is the
  -- account; a stray credential_ref would create a second erasure
  -- identity for one row).
  CONSTRAINT stoa_entries_human_no_credential CHECK (
    owner_user_id IS NULL OR credential_ref IS NULL
  ),
  -- Removal-state coupling (#16): removed ⇒ ground present; ground
  -- present ⇒ removed (a ground on a live entry is meaningless).
  CONSTRAINT stoa_entries_removed_requires_ground CHECK (
    status <> 'removed' OR removal_ground IS NOT NULL
  ),
  CONSTRAINT stoa_entries_ground_requires_removed CHECK (
    removal_ground IS NULL OR status = 'removed'
  ),
  -- Q5b examined-artifact standard, structural. The artifact must be
  -- SUBSTANTIVE — IS NOT NULL alone would admit ''/whitespace (an
  -- accusation-alone removal wearing an artifact column; PR19 fold,
  -- 2026-08-03). NOTE the explicit IS NOT NULL: under CHECK
  -- semantics btrim(NULL) <> '' yields NULL and a NULL CHECK passes,
  -- so btrim alone would NOT subsume the null case.
  CONSTRAINT stoa_entries_dishonesty_requires_artifact CHECK (
    removal_ground IS DISTINCT FROM 'dishonesty_examined'
    OR (removal_artifact_ref IS NOT NULL AND btrim(removal_artifact_ref) <> '')
  ),
  -- Symmetry with the ground↔status coupling: a dangling artifact ref
  -- on a live entry is meaningless (PR19 fold, 2026-08-03).
  CONSTRAINT stoa_entries_artifact_requires_removed CHECK (
    removal_artifact_ref IS NULL OR status = 'removed'
  )
);

-- One entry per practitioner (#11, Q3d): the person is the unit of
-- presence. Scoped to ACTIVE rows so a withdrawn or removed row never
-- blocks re-declaring (withdrawal is reversible; removal removes the
-- declaration, not the practitioner).
CREATE UNIQUE INDEX IF NOT EXISTS stoa_entries_owner_active_uniq
  ON public.stoa_entries (owner_user_id)
  WHERE status = 'active' AND owner_user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS stoa_entries_agent_active_uniq
  ON public.stoa_entries (agent_id)
  WHERE status = 'active' AND agent_id IS NOT NULL;

-- The serving read (#8): active entries by declaration recency —
-- the ONLY ordering that exists.
CREATE INDEX IF NOT EXISTS idx_stoa_entries_active_declared
  ON public.stoa_entries (declared_at DESC)
  WHERE status = 'active';
-- Erasure keys (data rights — /api/user/delete by owner is also
-- FK-cascade-backed; /api/credential/erase needs the credential key).
CREATE INDEX IF NOT EXISTS idx_stoa_entries_credential_ref
  ON public.stoa_entries (credential_ref)
  WHERE credential_ref IS NOT NULL;

-- ------------------------------------------------------------
-- §2 RLS — service-role-only (deny-all floor), in the same block
--    as creation (the ST1 lesson: never leave a new public object
--    on Supabase's default grants).
--
-- WHY deny-all rather than owner policies: ST3's declaration route
-- is the R20a distress-check perimeter point — a client-side INSERT/
-- UPDATE policy would let a signed-in browser bypass that check via
-- raw PostgREST. And community-scope reads must admit credentialed
-- agents (#2), who hold no Supabase JWT — so visibility is enforced
-- route-level over service_role (the trust-core precedent), with
-- this deny-all floor beneath it. RLS does not constrain
-- service_role (bypasses by design) — every server path through the
-- store is the deliberate access route.
-- ------------------------------------------------------------
ALTER TABLE public.stoa_entries ENABLE ROW LEVEL SECURITY;
-- No policies are created: anon/authenticated get row-zero access
-- even if a grant ever reappears. (Belt: RLS floor; braces: §3 grants.)

-- ------------------------------------------------------------
-- §3 Grants — REVOKE-FIRST (memory `supabase-view-default-grants-
--    auto-updatable`): Supabase default privileges grant ALL on new
--    public objects to anon/authenticated/service_role. Revoke
--    everything, then grant exactly what the design names.
-- ------------------------------------------------------------
REVOKE ALL ON public.stoa_entries FROM anon, authenticated, PUBLIC;
GRANT ALL ON public.stoa_entries TO service_role;

-- ------------------------------------------------------------
-- §VERIFY (run after §1–§3; every check must be green)
-- ------------------------------------------------------------
-- V1: the table exists with EXACTLY these columns, in order
SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) AS columns
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'stoa_entries';
-- Expected: id, owner_user_id, agent_id, credential_ref, what_i_bring,
--   what_i_seek, contact_channel, visibility, tags, declared_at,
--   renewed_at, status, removal_ground, removal_artifact_ref,
--   created_at, updated_at
-- Must contain NO retain_until and NO engagement column of any kind
-- (view/seen/click/count/match/last_*). ANY extra column is a FAIL.

-- V2: the constraint set (all 10 CHECKs by name + the FK + the PK)
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'public.stoa_entries'::regclass
ORDER BY conname;
-- Expected (contype c unless noted): stoa_entries_agent_requires_credential,
--   stoa_entries_artifact_requires_removed,
--   stoa_entries_dishonesty_requires_artifact, stoa_entries_ground_requires_removed,
--   stoa_entries_human_no_credential, stoa_entries_identity_xor,
--   stoa_entries_owner_user_id_fkey (f), stoa_entries_pkey (p),
--   stoa_entries_removal_ground_check, stoa_entries_removed_requires_ground,
--   stoa_entries_status_check, stoa_entries_visibility_check
--   (a tags NOT NULL is a column constraint, not listed here; on PG 18+
--   additional contype 'n' NOT NULL rows appear — expected, not a FAIL)

-- V3: the four indexes
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'stoa_entries'
ORDER BY indexname;
-- Expected: idx_stoa_entries_active_declared, idx_stoa_entries_credential_ref,
--   stoa_entries_agent_active_uniq, stoa_entries_owner_active_uniq,
--   stoa_entries_pkey

-- V4: RLS enabled
SELECT relrowsecurity FROM pg_class
WHERE oid = 'public.stoa_entries'::regclass;
-- Expected: true

-- V5: grants are EXACTLY service_role (the revoke-first discipline
--     held). ANY anon/authenticated/PUBLIC row is a FAIL — re-run §3.
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'stoa_entries'
ORDER BY grantee, privilege_type;
-- Expected: grantee ∈ {service_role, postgres} ONLY. The exact row
--   count varies by Postgres version (PG 17+ adds MAINTAIN to GRANT
--   ALL ⇒ 8 rows per grantee instead of 7) and table-owner rows for
--   `postgres` normally appear — neither is a FAIL. THE FAIL
--   CONDITION IS EXACT AND VERSION-INDEPENDENT: any row whose
--   grantee is anon, authenticated, or PUBLIC ⇒ FAIL — re-run §3.

-- V6: the FK ON DELETE action is CASCADE (the /api/user/delete backstop)
SELECT confdeltype FROM pg_constraint
WHERE conname = 'stoa_entries_owner_user_id_fkey';
-- Expected: c

-- V7: behavioral probe of the XOR (both should ERROR — run each
--     alone; the errors are the pass condition)
-- INSERT INTO public.stoa_entries (visibility) VALUES ('public');
--   → expected ERROR: violates check constraint "stoa_entries_identity_xor"
-- INSERT INTO public.stoa_entries (agent_id, visibility)
--   VALUES ('probe:xor@v1', 'public');
--   → expected ERROR: violates check "stoa_entries_agent_requires_credential"
-- INSERT INTO public.stoa_entries
--   (agent_id, credential_ref, visibility, status, removal_ground, removal_artifact_ref)
--   VALUES ('probe:artifact@v1', 'api_key:probe', 'public', 'removed',
--           'dishonesty_examined', '   ');
--   → expected ERROR: violates check "stoa_entries_dishonesty_requires_artifact"
--     (the Q5b substantive-artifact standard — whitespace is accusation-alone)

-- ============================================================
-- ROLLBACK / ERASURE SEMANTICS
--
-- Rollback: DROP INDEX IF EXISTS ... (the four above);
--           DROP TABLE IF EXISTS public.stoa_entries;
-- The table is inert until ST5's SUBSTRATE_STOA_ENABLED flip, and
-- the data-rights coverage of a dropped table is missing-table-
-- benign by construction — dropping it breaks nothing live.
--
-- Withdrawal vs erasure (recorded here so the semantics travel with
-- the schema): WITHDRAWAL is the practitioner's own status flip
-- ('withdrawn'; reversible by re-declaring, which reactivates the
-- row). ERASURE is hard delete — /api/user/delete (owner; explicit
-- store delete + the FK cascade backstop) and /api/credential/erase
-- (agent, by credential_ref). This table NEVER enters a retention
-- sweep and has no retain_until: entries are standing declarations
-- (#24 — never silent expiry). Re-adding retain_until, an engagement
-- column, or a practice-derived column would contradict the adopted
-- rulings — a founder decision to do so requires re-opening the
-- mentor record, not a schema tweak.
-- ============================================================
