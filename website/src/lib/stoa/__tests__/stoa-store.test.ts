/**
 * stoa-store.test.ts — unit battery for the Stoa entry model (ST2).
 * Run: npx tsx website/src/lib/stoa/__tests__/stoa-store.test.ts
 *
 * Plain-assertion house form. Exercises the store against the local in-memory
 * fake (fake-stoa-supabase.ts) — declaration defaults (#1), one-entry (#11),
 * withdrawal/reactivation (#24), removal grounds + the Q5b examined-artifact
 * standard (#16), recency-only ordering with renewal-never-reorders (#8/#23),
 * visibility scoping (#1/#2), data rights (R17c/R17i), missing-table honesty,
 * and fail-honest writes.
 */

import {
  declareStoaEntry,
  readStoaEntryForIdentity,
  updateStoaEntry,
  renewStoaEntry,
  withdrawStoaEntry,
  removeStoaEntry,
  listStoaEntries,
  deleteStoaDataForOwner,
  deleteStoaDataForCredential,
  getStoaDataForOwner,
  getStoaDataForCredentials,
  isStoaEnabled,
  STOA_REMOVAL_GROUNDS,
  type StoaIdentity,
} from '../stoa-store'
import { makeFakeStoaSupabase } from './fake-stoa-supabase'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail?: string) {
  if (cond) {
    pass++
    console.log(`  PASS ${name}`)
  } else {
    fail++
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

const HUMAN: StoaIdentity = { kind: 'human', ownerUserId: 'user-1' }
const HUMAN2: StoaIdentity = { kind: 'human', ownerUserId: 'user-2' }
const AGENT: StoaIdentity = {
  kind: 'agent',
  agentId: 'sagereasoning:stoa-test@v1',
  credentialRef: 'api_key:11111111-1111-1111-1111-111111111111',
}

async function run() {
  // ---- §1 Declaration defaults + identity validation ----
  {
    console.log('§1 declaration defaults + identity validation')
    const fake = makeFakeStoaSupabase()
    const h = await declareStoaEntry(HUMAN, { whatIBring: 'Stoic ethics reading group' }, fake.client)
    check('1.1 human declare ok', h.ok)
    check('1.2 human default visibility = community (#1)', h.ok && h.value.entry.visibility === 'community')
    const a = await declareStoaEntry(AGENT, { whatISeek: 'code-review collaborations' }, fake.client)
    check('1.3 agent declare ok', a.ok)
    check('1.4 agent default visibility = public (#1)', a.ok && a.value.entry.visibility === 'public')
    check('1.5 agent row carries credential_ref (#13)', a.ok && a.value.entry.credentialRef === 'api_key:11111111-1111-1111-1111-111111111111')
    const explicit = await declareStoaEntry(HUMAN2, { visibility: 'public' }, fake.client)
    check('1.6 explicit visibility respected', explicit.ok && explicit.value.entry.visibility === 'public')

    const badAgent = await declareStoaEntry(
      { kind: 'agent', agentId: 'agent_legacy_form', credentialRef: 'api_key:x' },
      {},
      fake.client,
    )
    check('1.7 legacy agent_* id refused (strict K1-canonical)', !badAgent.ok)
    const noCred = await declareStoaEntry(
      { kind: 'agent', agentId: 'sagereasoning:x@v1', credentialRef: '' } as StoaIdentity,
      {},
      fake.client,
    )
    check('1.8 agent without credentialRef refused (#13)', !noCred.ok)
    const badVis = await declareStoaEntry(
      { kind: 'human', ownerUserId: 'user-3' },
      { visibility: 'secret' as never },
      fake.client,
    )
    check('1.9 invalid visibility refused', !badVis.ok)
    const longField = await declareStoaEntry(
      { kind: 'human', ownerUserId: 'user-4' },
      { whatIBring: 'x'.repeat(2001) },
      fake.client,
    )
    check('1.10 over-long field refused (depth cap)', !longField.ok)
    const manyTags = await declareStoaEntry(
      { kind: 'human', ownerUserId: 'user-5' },
      { tags: Array.from({ length: 13 }, (_, i) => `t${i}`) },
      fake.client,
    )
    check('1.11 >12 tags refused', !manyTags.ok)
  }

  // ---- §2 One entry per practitioner (#11) ----
  {
    console.log('§2 one entry per practitioner (#11)')
    const fake = makeFakeStoaSupabase()
    await declareStoaEntry(HUMAN, {}, fake.client)
    const second = await declareStoaEntry(HUMAN, {}, fake.client)
    check('2.1 second active declare refused', !second.ok && second.error === 'already_declared')
    const agentFirst = await declareStoaEntry(AGENT, {}, fake.client)
    const agentSecond = await declareStoaEntry(AGENT, {}, fake.client)
    check('2.2 agent second active declare refused', agentFirst.ok && !agentSecond.ok)
    check('2.3 exactly two rows exist (one per identity)', fake.rows.length === 2)
  }

  // ---- §3 Withdrawal + reactivation (#24: leaves only by their act) ----
  {
    console.log('§3 withdrawal + reactivation')
    const fake = makeFakeStoaSupabase()
    const first = await declareStoaEntry(HUMAN, { whatIBring: 'original' }, fake.client)
    const firstId = first.ok ? first.value.entry.id : ''
    const firstDeclaredAt = first.ok ? first.value.entry.declaredAt : ''
    const w = await withdrawStoaEntry(HUMAN, fake.client)
    check('3.1 withdraw flips status', w.ok && w.value.withdrawn === true)
    const listAfter = await listStoaEntries({ scope: 'community' }, fake.client)
    check('3.2 withdrawn entry not listed', listAfter.ok && listAfter.value.entries.length === 0)
    const w2 = await withdrawStoaEntry(HUMAN, fake.client)
    check('3.3 second withdraw honest no-op', w2.ok && w2.value.withdrawn === false)

    await new Promise((r) => setTimeout(r, 5)) // distinct declared_at
    const re = await declareStoaEntry(HUMAN, { whatIBring: 'renewed presence' }, fake.client)
    check('3.4 re-declare after withdrawal succeeds', re.ok)
    check('3.5 re-declare REACTIVATES the same row (one physical row)', re.ok && re.value.reactivated === true && re.value.entry.id === firstId)
    check('3.6 reactivation carries the new content', re.ok && re.value.entry.whatIBring === 'renewed presence')
    check('3.7 reactivation gets a FRESH declared_at (honest ageing)', re.ok && re.value.entry.declaredAt > firstDeclaredAt)
    check('3.8 reactivation clears renewed_at', re.ok && re.value.entry.renewedAt === null)
    check('3.9 still one row', fake.rows.length === 1)
  }

  // ---- §4 Update + renewal (honest ageing; never a float-to-top lever) ----
  {
    console.log('§4 update + renewal')
    const fake = makeFakeStoaSupabase()
    const d = await declareStoaEntry(HUMAN, { whatIBring: 'v1' }, fake.client)
    const declaredAt = d.ok ? d.value.entry.declaredAt : ''
    // PR19 fold F5 (2026-08-03): without this gap, a mutated update writing
    // declared_at=now would produce an IDENTICAL same-millisecond ISO string
    // and 4.3 would stay green (timing-vacuous — live-proven).
    await new Promise((r) => setTimeout(r, 5))
    const u = await updateStoaEntry(HUMAN, { whatIBring: 'v2' }, fake.client)
    check('4.1 update ok + content changed', u.ok && u.value.whatIBring === 'v2')
    check('4.2 update sets renewed_at (#12/#24 honest ageing)', u.ok && u.value.renewedAt !== null)
    check('4.3 update NEVER touches declared_at (#8: no float-to-top)', u.ok && u.value.declaredAt === declaredAt)
    const r = await renewStoaEntry(AGENT, fake.client)
    check('4.4 renew without an entry → honest no_active_entry', !r.ok && r.error === 'no_active_entry')
    await declareStoaEntry(AGENT, {}, fake.client)
    const r2 = await renewStoaEntry(AGENT, fake.client)
    check('4.5 renew sets renewed_at only', r2.ok && r2.value.renewedAt !== null)
  }

  // ---- §5 Removal — exactly the three grounds + the Q5b artifact standard ----
  {
    console.log('§5 removal grounds (#16, Q5b)')
    check('5.1 the vocabulary is EXACTLY the three ruled grounds', STOA_REMOVAL_GROUNDS.length === 3 && STOA_REMOVAL_GROUNDS.includes('dishonesty_examined') && STOA_REMOVAL_GROUNDS.includes('injustice_facilitation') && STOA_REMOVAL_GROUNDS.includes('spam_flooding'))
    const fake = makeFakeStoaSupabase()
    const d = await declareStoaEntry(HUMAN, {}, fake.client)
    const id = d.ok ? d.value.entry.id : ''
    const noArtifact = await removeStoaEntry(id, 'dishonesty_examined', null, fake.client)
    check('5.2 dishonesty removal WITHOUT artifact refused (accusation never suffices)', !noArtifact.ok)
    // PR19 fold R-F1 (2026-08-03): a whitespace-only "artifact" is accusation-
    // alone wearing an artifact column — refused at the store (and by the
    // hardened btrim DB CHECK).
    const wsArtifact = await removeStoaEntry(id, 'dishonesty_examined', '   ', fake.client)
    check('5.2b whitespace-only artifact refused (substantive-artifact standard)', !wsArtifact.ok)
    const withArtifact = await removeStoaEntry(id, 'dishonesty_examined', 'assessment:abc123', fake.client)
    check('5.3 dishonesty removal WITH examined artifact succeeds', withArtifact.ok && withArtifact.value.removed === true)
    const listAfter = await listStoaEntries({ scope: 'community' }, fake.client)
    check('5.4 removed entry not listed', listAfter.ok && listAfter.value.entries.length === 0)
    check('5.5 removed row PERSISTS as the accountability record', fake.rows.length === 1 && fake.rows[0].status === 'removed' && fake.rows[0].removal_artifact_ref === 'assessment:abc123')
    await new Promise((r) => setTimeout(r, 5))
    const redeclare = await declareStoaEntry(HUMAN, {}, fake.client)
    check('5.6 removal removes the DECLARATION, not the practitioner — re-declare inserts new', redeclare.ok && redeclare.value.reactivated === false && fake.rows.length === 2)
    const spamId = redeclare.ok ? redeclare.value.entry.id : ''
    const spam = await removeStoaEntry(spamId, 'spam_flooding', null, fake.client)
    check('5.7 spam removal needs no artifact (Q5b binds dishonesty specifically)', spam.ok && spam.value.removed === true)
    const badGround = await removeStoaEntry(spamId, 'modesty' as never, null, fake.client)
    check('5.8 a non-ruled ground refused (modesty is never grounds)', !badGround.ok)
  }

  // ---- §6 Ordering (#8) — recency of declaration, ONLY ----
  {
    console.log('§6 ordering: declaration recency only')
    const fake = makeFakeStoaSupabase()
    const ids: string[] = ['user-a', 'user-b', 'user-c']
    for (const uid of ids) {
      await declareStoaEntry({ kind: 'human', ownerUserId: uid }, { visibility: 'public' }, fake.client)
      await new Promise((r) => setTimeout(r, 5))
    }
    const l1 = await listStoaEntries({ scope: 'public' }, fake.client)
    check('6.1 newest declaration first', l1.ok && l1.value.entries[0].ownerUserId === 'user-c' && l1.value.entries[2].ownerUserId === 'user-a')
    // Renew the OLDEST — ordering must NOT change (#23: renewal is not a lever).
    await renewStoaEntry({ kind: 'human', ownerUserId: 'user-a' }, fake.client)
    const l2 = await listStoaEntries({ scope: 'public' }, fake.client)
    check('6.2 renewal does NOT reorder', l2.ok && l2.value.entries[0].ownerUserId === 'user-c' && l2.value.entries[2].ownerUserId === 'user-a')
    // Edit the oldest — same invariant.
    await updateStoaEntry({ kind: 'human', ownerUserId: 'user-a' }, { whatIBring: 'edited' }, fake.client)
    const l3 = await listStoaEntries({ scope: 'public' }, fake.client)
    check('6.3 editing does NOT reorder', l3.ok && l3.value.entries[2].ownerUserId === 'user-a')
  }

  // ---- §7 Visibility scoping (#1/#2) + tag filter (#9) + caps ----
  {
    console.log('§7 visibility + tags + caps')
    const fake = makeFakeStoaSupabase()
    await declareStoaEntry(HUMAN, { tags: ['stoic-ethics'] }, fake.client) // community
    await declareStoaEntry(AGENT, { tags: ['agent-development'] }, fake.client) // public
    const pub = await listStoaEntries({ scope: 'public' }, fake.client)
    check('7.1 public scope sees ONLY public entries', pub.ok && pub.value.entries.length === 1 && pub.value.entries[0].visibility === 'public')
    const comm = await listStoaEntries({ scope: 'community' }, fake.client)
    check('7.2 community scope sees community AND public (#2 presence)', comm.ok && comm.value.entries.length === 2)
    const tagged = await listStoaEntries({ scope: 'community', tag: 'stoic-ethics' }, fake.client)
    check('7.3 tag filter (consultation of the resource, #9)', tagged.ok && tagged.value.entries.length === 1 && tagged.value.entries[0].tags.includes('stoic-ethics'))
    const capped = await listStoaEntries({ scope: 'community', limit: 999999 }, fake.client)
    // PR19 fold F4 (2026-08-03 — the old assertion was live-proven vacuous):
    // assert the clamp actually reached the query via the fake's recorded range.
    check(
      '7.4 limit hard-capped at 200 (range window proves the clamp)',
      capped.ok && fake.lastRange !== null && fake.lastRange.to - fake.lastRange.from + 1 === 200,
      `lastRange: ${JSON.stringify(fake.lastRange)}`,
    )
  }

  // ---- §8 Data rights (R17c/R17i) ----
  {
    console.log('§8 data rights')
    const fake = makeFakeStoaSupabase()
    await declareStoaEntry(HUMAN, {}, fake.client)
    await withdrawStoaEntry(HUMAN, fake.client) // erasure must clear ANY status
    await declareStoaEntry(AGENT, {}, fake.client)
    const delOwner = await deleteStoaDataForOwner('user-1', fake.client)
    check('8.1 owner erasure hard-deletes (any status)', delOwner.ok && delOwner.value === 1 && fake.rows.length === 1)
    const delCred = await deleteStoaDataForCredential('api_key:11111111-1111-1111-1111-111111111111', fake.client)
    check('8.2 credential erasure hard-deletes the agent entry', delCred.ok && delCred.value === 1 && fake.rows.length === 0)
    await declareStoaEntry(HUMAN, { whatIBring: 'export me' }, fake.client)
    const exp = await getStoaDataForOwner('user-1', fake.client)
    check('8.3 owner export returns rows', exp.ok && exp.value.length === 1)
  }

  // ---- §9 Missing-table honesty (pre-migration Live routes) ----
  {
    console.log('§9 missing-table honesty')
    const fake = makeFakeStoaSupabase({ missingTables: true })
    const read = await readStoaEntryForIdentity(HUMAN, fake.client)
    check('9.1 read benign-null', read.ok && read.value === null)
    const list = await listStoaEntries({ scope: 'public' }, fake.client)
    check('9.2 list benign-empty', list.ok && list.value.entries.length === 0)
    const del = await deleteStoaDataForOwner('user-1', fake.client)
    check('9.3 erasure benign-zero (data-rights routes never 207 pre-migration)', del.ok && del.value === 0)
    const exp = await getStoaDataForOwner('user-1', fake.client)
    check('9.4 export benign-empty', exp.ok && exp.value.length === 0)
    // A WRITE must never false-succeed on a missing table (the ack-write lesson).
    const declare = await declareStoaEntry(HUMAN, {}, fake.client)
    check('9.5 declare on missing table is ok:false — never a false success', !declare.ok)
  }

  // ---- §10 Fail-honest writes (transient error injection) ----
  {
    console.log('§10 fail-honest writes')
    const fake = makeFakeStoaSupabase()
    await declareStoaEntry(HUMAN, {}, fake.client)
    fake.failNext('update', { message: 'transient network failure' })
    const u = await updateStoaEntry(HUMAN, { whatIBring: 'x' }, fake.client)
    check('10.1 transient update failure surfaces ok:false', !u.ok && u.error.includes('transient'))
    fake.failNext('delete', { message: 'transient network failure' })
    const d = await deleteStoaDataForOwner('user-1', fake.client)
    check('10.2 transient delete failure surfaces ok:false (no false "deleted")', !d.ok)
  }

  // ---- §11 Flag helper ----
  {
    console.log('§11 flag helper')
    const prev = process.env.SUBSTRATE_STOA_ENABLED
    delete process.env.SUBSTRATE_STOA_ENABLED
    check('11.1 unset ⇒ disabled', isStoaEnabled() === false)
    process.env.SUBSTRATE_STOA_ENABLED = 'true'
    check('11.2 true ⇒ enabled', isStoaEnabled() === true)
    if (prev === undefined) delete process.env.SUBSTRATE_STOA_ENABLED
    else process.env.SUBSTRATE_STOA_ENABLED = prev
  }

  // ---- §12 PR19 coverage folds (2026-08-03) ----
  {
    console.log('§12 PR19 coverage folds')
    // F2 pin: a COLUMN error (PGRST204, message mentions "schema cache") must
    // NEVER be classified benign — a false "erased, 0 rows" on the one table
    // whose only exits are the data-rights paths.
    const fake = makeFakeStoaSupabase()
    await declareStoaEntry(HUMAN, {}, fake.client)
    fake.failNext('delete', {
      code: 'PGRST204',
      message: "Could not find the 'popularity' column of 'stoa_entries' in the schema cache",
    })
    const colErr = await deleteStoaDataForOwner('user-1', fake.client)
    check('12.1 PGRST204 column error is NEVER benign on delete (ok:false)', !colErr.ok)
    fake.failNext('select', { code: '42703', message: 'column stoa_entries.popularity does not exist' })
    const colErr2 = await getStoaDataForOwner('user-1', fake.client)
    check('12.2 42703 column error is NEVER benign on export (ok:false)', !colErr2.ok)

    // F6: the concurrent-insert 23505 branch (the read misses; the DB unique
    // catches) maps to the honest 'already_declared'.
    const fake2 = makeFakeStoaSupabase()
    fake2.failNext('insert', { code: '23505', message: 'duplicate key value violates unique constraint' })
    const race = await declareStoaEntry(HUMAN, {}, fake2.client)
    check('12.3 concurrent-insert 23505 → already_declared (honest refusal)', !race.ok && race.error === 'already_declared')

    // F6: tag normalization — trim, drop empties, dedup.
    const fake3 = makeFakeStoaSupabase()
    const tags = await declareStoaEntry(HUMAN, { tags: ['  stoic-ethics ', 'stoic-ethics', ''] }, fake3.client)
    check('12.4 tags trimmed/deduped/empties dropped', tags.ok && tags.value.entry.tags.length === 1 && tags.value.entry.tags[0] === 'stoic-ethics')
    // F6: whitespace-only field normalises to null.
    const ws = await declareStoaEntry(HUMAN2, { whatIBring: '   ' }, fake3.client)
    check('12.5 whitespace-only field → null', ws.ok && ws.value.entry.whatIBring === null)

    // F6: offset paging.
    const fake4 = makeFakeStoaSupabase()
    for (const uid of ['u1', 'u2', 'u3']) {
      await declareStoaEntry({ kind: 'human', ownerUserId: uid }, { visibility: 'public' }, fake4.client)
      await new Promise((r) => setTimeout(r, 5))
    }
    const page2 = await listStoaEntries({ scope: 'public', limit: 2, offset: 2 }, fake4.client)
    check('12.6 offset paging returns the tail', page2.ok && page2.value.entries.length === 1 && page2.value.entries[0].ownerUserId === 'u1')

    // F6: remove on a nonexistent/non-active entry → honest removed:false.
    const ghost = await removeStoaEntry('row-does-not-exist', 'spam_flooding', null, fake4.client)
    check('12.7 remove on nonexistent entry → removed:false (honest)', ghost.ok && ghost.value.removed === false)

    // F3: the export-by-credentials arm (agent entries in the operator's copies).
    const fake5 = makeFakeStoaSupabase()
    await declareStoaEntry(AGENT, { whatIBring: 'agent presence' }, fake5.client)
    const byCreds = await getStoaDataForCredentials(['api_key:11111111-1111-1111-1111-111111111111'], fake5.client)
    check('12.8 export-by-credentials returns the agent entry', byCreds.ok && byCreds.value.length === 1)
    const emptyRefs = await getStoaDataForCredentials([], fake5.client)
    check('12.9 empty credential set → empty export, no query', emptyRefs.ok && emptyRefs.value.length === 0)
  }

  console.log(`\nstoa-store battery: ${pass} passed, ${fail} failed`)
  if (fail > 0) process.exit(1)
}

run().catch((e) => {
  console.error('battery crashed:', e)
  process.exit(1)
})
