/**
 * assertions.ts — plain-assertion ledger for the whole-system harness.
 *
 * Mirrors the repo's existing plain-tsx test pattern (e.g.
 * src/lib/substrate/__tests__/sage-assent-bridge.test.ts): no Jest, just
 * pass/fail counters and a CI-style exit code. PR15: extend the existing
 * pattern, do not introduce a framework.
 */

export interface AssertionResult {
  label: string
  pass: boolean
  detail?: string
}

export class AssertionLedger {
  readonly results: AssertionResult[] = []

  assert(label: string, condition: boolean, detail?: string): void {
    const pass = condition === true
    this.results.push(pass ? { label, pass } : { label, pass, detail })
    if (pass) {
      console.log(`PASS  ${label}`)
    } else {
      console.log(`FAIL  ${detail ? `${label} — ${detail}` : label}`)
    }
  }

  assertEqual<T>(label: string, actual: T, expected: T): void {
    const ok = actual === expected
    this.assert(
      label,
      ok,
      ok
        ? undefined
        : `expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`
    )
  }

  get passCount(): number {
    return this.results.filter((r) => r.pass).length
  }

  get failCount(): number {
    return this.results.filter((r) => !r.pass).length
  }

  /** True only when at least one assertion ran and none failed. */
  get allPassed(): boolean {
    return this.results.length > 0 && this.failCount === 0
  }

  summaryLine(): string {
    return `${this.passCount} passed, ${this.failCount} failed (${this.results.length} assertions)`
  }
}
