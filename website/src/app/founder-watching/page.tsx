'use client';

/**
 * /founder-watching — the founder's `watching` dashboard (agent-circles, RULED
 * 2026-08-09, ruled scope §2.4). Follows the founder-hub pattern exactly: a
 * client page fetching a founder-gated GET route (no push/websocket/SSE — the
 * repo-wide grep-confirmed house pattern) with the Bearer JWT read from the
 * Supabase localStorage session.
 *
 * The two ruled RENDER requirements (§2.10 dimensions (1) + (2) — build
 * requirements, not optional):
 *   (1) Q7 transparency ON THE PAGE: rejected candidates visible with heuristic
 *       attribution — every candidate row renders its heuristic + outcome,
 *       including rejected_by_guardrail with the guardrail result.
 *   (2) The runner-composed disclosure RENDERED (RUNNER_COMPOSED_DISCLOSURE
 *       from watching-shared.ts — the same literal the API serves, so page and
 *       wire cannot drift).
 *
 * DARK: the API answers 503 while SUBSTRATE_WATCHING_ENABLED is unset; the page
 * surfaces that honestly. Never public — the route is FOUNDER_USER_ID-gated.
 */

import { useCallback, useEffect, useState } from 'react';
import { RUNNER_COMPOSED_DISCLOSURE } from '@/lib/substrate/watching-shared';

interface CandidateRow {
  id: string;
  gap_ref: string | null;
  heuristic: string;
  proposed_action: string;
  classification_kind: string;
  classified_domains: string[] | null;
  generation_confidence: number | null;
  guardrail_proximity: string | null;
  guardrail_domains: string[] | null;
  guardrail_session_id: string | null;
  passed_novelty_check: boolean | null;
  novelty_confidence: number | null;
  novelty_basis: string | null;
  cycle_outcome: string;
  unavailable_dependency: string | null;
}

interface CycleRow {
  id: string;
  loop_id: string;
  cycle_number: number;
  gap_ref: string | null;
  cycle_outcome: string;
  winner_candidate_id: string | null;
  friction_only_mode: boolean;
  cost_cents: number | null;
  elapsed_ms: number | null;
  maximum_duration_ms: number | null;
  agent_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  idea_loop_candidates: CandidateRow[];
}

const OUTCOME_COLORS: Record<string, string> = {
  winner: '#5B8C6D',
  null_cycle: '#4A5568',
  dependency_unavailable: '#C9A84C',
  terminated_by_timeout: '#B2AC88',
  rejected_by_guardrail: '#8B6F47',
  rejected_by_novelty: '#4A5568',
};

function outcomeBadge(outcome: string) {
  return (
    <span
      style={{
        background: OUTCOME_COLORS[outcome] || '#4A5568',
        color: 'white',
        borderRadius: 4,
        padding: '2px 8px',
        fontSize: 12,
        whiteSpace: 'nowrap',
      }}
    >
      {outcome}
    </span>
  );
}

export default function FounderWatchingPage() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [cycles, setCycles] = useState<CycleRow[]>([]);
  const [loopFilter, setLoopFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load auth token from localStorage (the founder-hub pattern).
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sb-jdbefwkonfbhjquozgxr-auth-token');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAuthToken(parsed.access_token || null);
      }
    } catch {
      setError('Could not load authentication. Please sign in.');
    }
  }, []);

  const load = useCallback(async (token: string, loopId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const qs = loopId ? `?loop_id=${encodeURIComponent(loopId)}` : '';
      const res = await fetch(`/api/founder/watching${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 503) {
        setError('The watching surface is dark (SUBSTRATE_WATCHING_ENABLED unset) or unavailable.');
        setCycles([]);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCycles(data.cycles || []);
    } catch (err) {
      setError(`Failed to load cycles: ${err instanceof Error ? err.message : 'unknown'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authToken) load(authToken, '');
  }, [authToken, load]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Watching — IDEA loop per-cycle record</h1>
      <p style={{ color: '#4A5568', fontSize: 14, marginBottom: 12 }}>
        The founder&apos;s operational dashboard for the IDEA loop. One row per completed cycle;
        every generated candidate is shown — including candidates the guardrail refused, with
        heuristic attribution — so guardrail calibration can be evaluated honestly. The loop
        proposes; it never executes: a winner is a proposal awaiting human election.
      </p>

      {/* The ruled §2.5 disclosure — RENDERED, not just documented (§2.10 dim 2). */}
      <div
        data-testid="runner-composed-disclosure"
        style={{
          background: '#FBF7EE',
          border: '1px solid #C9A84C',
          borderRadius: 6,
          padding: '10px 14px',
          fontSize: 13,
          color: '#5A4A28',
          marginBottom: 20,
        }}
      >
        {RUNNER_COMPOSED_DISCLOSURE}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={loopFilter}
          onChange={(e) => setLoopFilter(e.target.value)}
          placeholder="Filter by loop_id (blank = all)"
          style={{ flex: 1, padding: '6px 10px', border: '1px solid #CBD5E0', borderRadius: 6, fontSize: 14 }}
        />
        <button
          onClick={() => authToken && load(authToken, loopFilter.trim())}
          disabled={!authToken || isLoading}
          style={{
            padding: '6px 16px',
            borderRadius: 6,
            border: 'none',
            background: '#4A5568',
            color: 'white',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          {isLoading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: 6, padding: 12, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {!error && cycles.length === 0 && !isLoading && (
        <p style={{ color: '#718096', fontSize: 14 }}>No cycles recorded yet.</p>
      )}

      {cycles.map((cy) => (
        <div
          key={cy.id}
          style={{ border: '1px solid #E2E8F0', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}
        >
          <div style={{ background: '#F7FAFC', padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', fontSize: 13 }}>
            <strong>
              {cy.loop_id} · cycle {cy.cycle_number}
            </strong>
            {outcomeBadge(cy.cycle_outcome)}
            {cy.friction_only_mode && (
              <span style={{ color: '#8B6F47' }}>friction-only mode</span>
            )}
            <span>cost: {cy.cost_cents === null ? '—' : `${cy.cost_cents}¢`}</span>
            <span>
              elapsed: {cy.elapsed_ms === null ? '—' : `${cy.elapsed_ms}ms`}
              {' / max (runner-declared): '}
              {cy.maximum_duration_ms === null ? '—' : `${cy.maximum_duration_ms}ms`}
            </span>
            <span style={{ color: '#718096' }}>{new Date(cy.created_at).toLocaleString()}</span>
          </div>
          {cy.gap_ref && (
            <div style={{ padding: '4px 14px', fontSize: 12, color: '#718096' }}>gap: {cy.gap_ref}</div>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#4A5568' }}>
                <th style={{ padding: '6px 14px' }}>heuristic</th>
                <th style={{ padding: '6px 8px' }}>proposed action</th>
                <th style={{ padding: '6px 8px' }}>outcome</th>
                <th style={{ padding: '6px 8px' }}>guardrail</th>
                <th style={{ padding: '6px 8px' }}>novelty</th>
              </tr>
            </thead>
            <tbody>
              {(cy.idea_loop_candidates || []).map((cand) => (
                <tr key={cand.id} style={{ borderTop: '1px solid #EDF2F7', verticalAlign: 'top' }}>
                  {/* Q7: heuristic attribution on EVERY candidate, incl. refused ones. */}
                  <td style={{ padding: '6px 14px', whiteSpace: 'nowrap' }}>{cand.heuristic}</td>
                  <td style={{ padding: '6px 8px', maxWidth: 420 }}>{cand.proposed_action}</td>
                  <td style={{ padding: '6px 8px' }}>
                    {outcomeBadge(cand.cycle_outcome)}
                    {cand.cycle_outcome === 'dependency_unavailable' && cand.unavailable_dependency && (
                      <div style={{ fontSize: 11, color: '#718096' }}>{cand.unavailable_dependency}</div>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', fontSize: 12 }}>
                    {cand.guardrail_proximity ?? '—'}
                    {cand.guardrail_domains && cand.guardrail_domains.length > 0 && (
                      <div style={{ color: '#718096' }}>{cand.guardrail_domains.join(', ')}</div>
                    )}
                    {cand.guardrail_session_id && (
                      <div style={{ color: '#A0AEC0', fontSize: 11 }}>ref {cand.guardrail_session_id}</div>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', fontSize: 12 }}>
                    {cand.passed_novelty_check === null
                      ? '—'
                      : cand.passed_novelty_check
                        ? `novel (${cand.novelty_confidence ?? '—'})`
                        : `not novel (${cand.novelty_confidence ?? '—'})`}
                    {cand.novelty_basis && (
                      <div style={{ color: '#718096' }}>{cand.novelty_basis}</div>
                    )}
                  </td>
                </tr>
              ))}
              {(cy.idea_loop_candidates || []).length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '6px 14px', color: '#718096' }}>
                    No candidate rows for this cycle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
