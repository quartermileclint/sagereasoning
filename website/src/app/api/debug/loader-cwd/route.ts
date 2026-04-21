/**
 * /api/debug/loader-cwd — Temporary diagnostic endpoint
 *
 * Returns process.cwd(), __dirname equivalent, fs.existsSync() results for all
 * five file-based context loader source paths (direct and parent-traversal),
 * plus directory listings. Founder-gated. Read-only. No state change.
 *
 * Risk classification: Standard (0d-ii). Temporary, gated, read-only.
 * Remove at session close.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/security'
import { promises as fs } from 'fs'
import path from 'path'
// fileURLToPath not needed — __dirname check is sufficient for this diagnostic

export async function GET(request: NextRequest) {
  // Founder-only gate (same pattern as /api/founder/hub)
  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const founderId = process.env.FOUNDER_USER_ID
  if (!founderId || auth.user.id !== founderId) {
    return NextResponse.json(
      { error: 'This endpoint is restricted to the founder.' },
      { status: 403 }
    )
  }

  const cwd = process.cwd()

  // __dirname equivalent for ESM / Next.js compiled output
  let dirname = 'unavailable'
  try {
    // In Next.js compiled output, import.meta.url may not be available.
    // Fall back to __dirname if it exists in the runtime scope.
    dirname = typeof __dirname !== 'undefined' ? __dirname : 'not defined'
  } catch {
    dirname = 'error accessing __dirname'
  }

  // All five loader source paths — direct (from cwd) and parent-traversal
  const directPaths: Record<string, string> = {
    'tech-known-issues (Tech C1)': path.join(cwd, 'operations', 'tech-known-issues.md'),
    'TECHNICAL_STATE (Tech C2)': path.join(cwd, 'TECHNICAL_STATE.md'),
    'growth-actions-log (Growth C1)': path.join(cwd, 'operations', 'growth-actions-log.md'),
    'growth-market-signals (Growth C2)': path.join(cwd, 'operations', 'growth-market-signals.md'),
    'ops handoffs dir (Ops C2 src1)': path.join(cwd, 'operations', 'handoffs'),
    'ops decision-log (Ops C2 src2)': path.join(cwd, 'operations', 'decision-log.md'),
    'ops knowledge-gaps (Ops C2 src3)': path.join(cwd, 'operations', 'knowledge-gaps.md'),
    'ops compliance_register (Ops C2 src4)': path.join(cwd, 'compliance', 'compliance_register.json'),
    'ops build-knowledge-extraction (Ops C2 src5)': path.join(cwd, 'operations', 'build-knowledge-extraction-2026-04-17.md'),
    'operations dir (direct)': path.join(cwd, 'operations'),
  }

  const parentPaths: Record<string, string> = {
    'tech-known-issues (Tech C1) via ..': path.join(cwd, '..', 'operations', 'tech-known-issues.md'),
    'TECHNICAL_STATE (Tech C2) via ..': path.join(cwd, '..', 'TECHNICAL_STATE.md'),
    'growth-actions-log (Growth C1) via ..': path.join(cwd, '..', 'operations', 'growth-actions-log.md'),
    'growth-market-signals (Growth C2) via ..': path.join(cwd, '..', 'operations', 'growth-market-signals.md'),
    'ops handoffs dir (Ops C2 src1) via ..': path.join(cwd, '..', 'operations', 'handoffs'),
    'ops decision-log (Ops C2 src2) via ..': path.join(cwd, '..', 'operations', 'decision-log.md'),
    'ops knowledge-gaps (Ops C2 src3) via ..': path.join(cwd, '..', 'operations', 'knowledge-gaps.md'),
    'ops compliance_register (Ops C2 src4) via ..': path.join(cwd, '..', 'compliance', 'compliance_register.json'),
    'ops build-knowledge-extraction (Ops C2 src5) via ..': path.join(cwd, '..', 'operations', 'build-knowledge-extraction-2026-04-17.md'),
    'operations dir (via ..)': path.join(cwd, '..', 'operations'),
  }

  // Check existence for all paths
  async function checkExists(p: string): Promise<{ exists: boolean; isDir: boolean | null; error: string | null }> {
    try {
      const stat = await fs.stat(p)
      return { exists: true, isDir: stat.isDirectory(), error: null }
    } catch (e) {
      return { exists: false, isDir: null, error: e instanceof Error ? e.message : String(e) }
    }
  }

  const directResults: Record<string, Awaited<ReturnType<typeof checkExists>> & { resolved_path: string }> = {}
  for (const [label, p] of Object.entries(directPaths)) {
    const result = await checkExists(p)
    directResults[label] = { ...result, resolved_path: p }
  }

  const parentResults: Record<string, Awaited<ReturnType<typeof checkExists>> & { resolved_path: string }> = {}
  for (const [label, p] of Object.entries(parentPaths)) {
    const result = await checkExists(p)
    parentResults[label] = { ...result, resolved_path: p }
  }

  // Directory listing of cwd (first 30 entries)
  let cwdListing: string[] = []
  try {
    const entries = await fs.readdir(cwd)
    cwdListing = entries.slice(0, 30)
  } catch (e) {
    cwdListing = [`error: ${e instanceof Error ? e.message : String(e)}`]
  }

  // Directory listing of parent (first 30 entries)
  let parentListing: string[] = []
  try {
    const entries = await fs.readdir(path.join(cwd, '..'))
    parentListing = entries.slice(0, 30)
  } catch (e) {
    parentListing = [`error: ${e instanceof Error ? e.message : String(e)}`]
  }

  return NextResponse.json({
    diagnostic: 'loader-cwd-check',
    timestamp: new Date().toISOString(),
    process_cwd: cwd,
    __dirname: dirname,
    cwd_listing: cwdListing,
    parent_listing: parentListing,
    direct_path_checks: directResults,
    parent_path_checks: parentResults,
  }, { status: 200 })
}
