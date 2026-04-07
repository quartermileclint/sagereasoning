'use client'

import { useState, useEffect } from 'react'

export default function OpsHub() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [activeDomain, setActiveDomain] = useState<string | null>(null)
  const [contextFreshness, setContextFreshness] = useState(87)
  const [lastSyncTime, setLastSyncTime] = useState('Today 6:15 AM')
  const [changesCount, setChangesCount] = useState(12)

  // Stoic Check State
  const [stoicInput, setStoicInput] = useState('')
  const [stoicLoading, setStoicLoading] = useState(false)
  const [stoicResult, setStoicResult] = useState<Record<string, unknown> | null>(null)

  // Decision Scoring State
  const [decisionOption1, setDecisionOption1] = useState('')
  const [decisionOption2, setDecisionOption2] = useState('')
  const [scoringLoading, setScoringLoading] = useState(false)
  const [scoringResult, setScoringResult] = useState<Record<string, unknown> | null>(null)

  // Alert State
  const [alertFilter, setAlertFilter] = useState('all')
  const [alertEvaluating, setAlertEvaluating] = useState<string | null>(null)
  const [alertResults, setAlertResults] = useState<Record<string, unknown>>({})

  // Toggle states for settings
  const [settings, setSettings] = useState({
    dailyBriefing: true,
    alertNotifications: true,
    competitiveAlerts: true,
    pipelineSync: true,
  })

  // Briefing checkbox states
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({})

  const handleStoicCheck = async () => {
    if (!stoicInput.trim()) return
    setStoicLoading(true)
    setStoicResult(null)

    try {
      const res = await fetch('/api/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: stoicInput, depth: 'standard' }),
      })
      const data = await res.json()
      setStoicResult(data)
    } catch (error) {
      setStoicResult({
        error: 'Failed to get Stoic evaluation. Please try again.',
      })
    } finally {
      setStoicLoading(false)
    }
  }

  const handleDecisionScoring = async () => {
    if (!decisionOption1.trim() || !decisionOption2.trim()) return
    setScoringLoading(true)
    setScoringResult(null)

    try {
      const res = await fetch('/api/score-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option1: decisionOption1,
          option2: decisionOption2,
        }),
      })
      const data = await res.json()
      setScoringResult(data)
    } catch (error) {
      setScoringResult({ error: 'Failed to score decisions.' })
    } finally {
      setScoringLoading(false)
    }
  }

  const handleAlertEvaluation = async (alertText: string) => {
    if (alertResults[alertText]) {
      delete alertResults[alertText]
      setAlertResults({ ...alertResults })
      return
    }

    setAlertEvaluating(alertText)
    try {
      const res = await fetch('/api/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: alertText, depth: 'quick' }),
      })
      const data = await res.json()
      setAlertResults({ ...alertResults, [alertText]: data })
    } catch (error) {
      setAlertResults({
        ...alertResults,
        [alertText]: { error: 'Failed to evaluate alert.' },
      })
    } finally {
      setAlertEvaluating(null)
    }
  }

  const toggleCheckbox = (key: string) => {
    setCompletedItems({ ...completedItems, [key]: !(completedItems as Record<string, boolean>)[key] })
  }

  const toggleSetting = (key: string) => {
    setSettings({ ...settings, [key]: !(settings as Record<string, boolean>)[key] })
  }

  const switchView = (view: string) => {
    setCurrentView(view)
    setActiveDomain(null)
  }

  const switchDomain = (domain: string) => {
    setActiveDomain(domain)
    setCurrentView('domain')
  }

  const filterAlerts = (filter: string) => {
    setAlertFilter(filter)
  }

  const alerts = [
    {
      severity: 'critical',
      domain: 'Data Extraction',
      time: '2 hours ago',
      message: '5 of 12 journal sections still need structured data extraction (42% gap). Blocking final synthesis for P1 review.',
    },
    {
      severity: 'warning',
      domain: 'Schema',
      time: '5 hours ago',
      message: 'Schema inconsistency across extracted sections — field names shift between sections. Requires normalization pass.',
    },
    {
      severity: 'low',
      domain: 'Mentor Ledger',
      time: '8 hours ago',
      message: 'Mentor Ledger has 103 entries with no prioritization logic. Non-blocking but should implement ranking.',
    },
  ]

  const filteredAlerts = alerts.filter(
    (alert) => alertFilter === 'all' || alert.severity === alertFilter
  )

  return (
    <div style={styles.container}>
      <style>{cssVariables}</style>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.brand}>SageReasoning</div>
          <div style={styles.sageTitle}>
            <div style={styles.sageIcon}>⚙</div>
            Sage Ops
          </div>
        </div>

        {/* Context Freshness Card */}
        <div style={styles.contextCard}>
          <div style={styles.contextCardTitle}>
            <div style={styles.contextStatusDot}></div>
            Layer 0 Status
          </div>
          <div style={styles.contextStat}>
            <span>Freshness:</span>
            <span style={styles.contextStatValue}>{contextFreshness}%</span>
          </div>
          <div style={styles.contextStat}>
            <span>Last Sync:</span>
            <span style={styles.contextStatValue}>{lastSyncTime}</span>
          </div>
          <div style={styles.contextStat}>
            <span>Changes:</span>
            <span style={styles.contextStatValue}>{changesCount} docs</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${contextFreshness}%` }}></div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div style={styles.navSection}>
          <div style={styles.navSectionTitle}>Operations</div>
          <div
            style={{
              ...styles.navItem,
              ...(currentView === 'dashboard' ? styles.navItemActive : {}),
            }}
            onClick={() => switchView('dashboard')}
          >
            <span style={styles.navIcon}>📊</span> Dashboard
          </div>
          <div
            style={{
              ...styles.navItem,
              ...(currentView === 'briefing' ? styles.navItemActive : {}),
            }}
            onClick={() => switchView('briefing')}
          >
            <span style={styles.navIcon}>📋</span> Morning Briefing
          </div>
          <div
            style={{
              ...styles.navItem,
              ...(currentView === 'alerts' ? styles.navItemActive : {}),
            }}
            onClick={() => switchView('alerts')}
          >
            <span style={styles.navIcon}>🔔</span> Alerts
          </div>
          <div
            style={{
              ...styles.navItem,
              ...(currentView === 'weekly' ? styles.navItemActive : {}),
            }}
            onClick={() => switchView('weekly')}
          >
            <span style={styles.navIcon}>📈</span> Weekly Review
          </div>
        </div>

        <div style={styles.navSection}>
          <div style={styles.navSectionTitle}>Intelligence</div>
          <div
            style={{
              ...styles.navItem,
              ...(currentView === 'pipeline' ? styles.navItemActive : {}),
            }}
            onClick={() => switchView('pipeline')}
          >
            <span style={styles.navIcon}>📥</span> Pipeline Status
          </div>
          <div
            style={{
              ...styles.navItem,
              ...(currentView === 'competitive' ? styles.navItemActive : {}),
            }}
            onClick={() => switchView('competitive')}
          >
            <span style={styles.navIcon}>🎯</span> Competitive Intel
          </div>
        </div>

        <div style={styles.navSection}>
          <div style={styles.navSectionTitle}>Domains</div>
          <div style={styles.domainsList}>
            {['Compliance', 'Security', 'Financial', 'Product', 'Operations', 'People'].map((domain) => (
              <div
                key={domain}
                style={{
                  ...styles.domainTag,
                  ...(activeDomain === domain ? styles.domainTagActive : {}),
                }}
                onClick={() => switchDomain(domain)}
              >
                {domain}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.navSection}>
          <div style={styles.navSectionTitle}>System</div>
          <div
            style={{
              ...styles.navItem,
              ...(currentView === 'layer0' ? styles.navItemActive : {}),
            }}
            onClick={() => switchView('layer0')}
          >
            <span style={styles.navIcon}>🔗</span> Layer 0 Sync
          </div>
          <div
            style={{
              ...styles.navItem,
              ...(currentView === 'settings' ? styles.navItemActive : {}),
            }}
            onClick={() => switchView('settings')}
          >
            <span style={styles.navIcon}>⚙️</span> Settings
          </div>
        </div>

        <div style={styles.sidebarFooter}>
          Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.mainContent}>
        {/* DASHBOARD VIEW */}
        {currentView === 'dashboard' && (
          <div style={styles.view}>
            <div style={styles.pageHeader}>
              <div>
                <div style={styles.pageTitle}>Dashboard</div>
                <div style={styles.pageSubtitle}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} — Real-time operations overview
                </div>
              </div>
              <div style={styles.pageControls}>
                <button style={styles.btn}>Refresh</button>
                <button style={{ ...styles.btn, ...styles.btnPrimary }}>Generate Report</button>
              </div>
            </div>

            <div style={styles.contentGrid}>
              {/* KPI Cards */}
              <div style={{ ...styles.card, ...styles.kpiCard }}>
                <div style={styles.cardTitle}>P0 Items</div>
                <div style={styles.kpiValue}>7</div>
                <div style={styles.kpiLabel}>0a through 0g</div>
                <div style={styles.kpiChange}>▼ Exit criteria focused</div>
              </div>

              <div style={{ ...styles.card, ...styles.kpiCard }}>
                <div style={styles.cardTitle}>Hold Point</div>
                <div style={styles.kpiValue}>86%</div>
                <div style={styles.kpiLabel}>6 of 7 exit criteria complete</div>
                <div style={styles.kpiChange}>▲ Criterion 7 pending</div>
              </div>

              <div style={{ ...styles.card, ...styles.kpiCard }}>
                <div style={styles.cardTitle}>Tests Passing</div>
                <div style={styles.kpiValue}>158</div>
                <div style={styles.kpiLabel}>test suite status</div>
                <div style={styles.kpiChange}>▲ All passing</div>
              </div>

              <div style={{ ...styles.card, ...styles.kpiCard }}>
                <div style={styles.cardTitle}>Remaining</div>
                <div style={styles.kpiValue}>1</div>
                <div style={styles.kpiLabel}>Criterion 7</div>
                <div style={styles.kpiChange}>Founder confirmation</div>
              </div>

              {/* Stoic Check */}
              <div style={{ ...styles.card, ...styles.stoicCheck }}>
                <div style={styles.stoicCheckTitle}>
                  <span style={styles.stoicCheckIcon}>φ</span>
                  Today&apos;s Stoic Check
                </div>
                <div style={styles.stoicCheckContent}>
                  <textarea
                    placeholder="Describe a business decision or situation you're facing..."
                    value={stoicInput}
                    onChange={(e) => setStoicInput(e.target.value)}
                    style={styles.stoicTextarea}
                  />
                  <button
                    onClick={handleStoicCheck}
                    disabled={stoicLoading || !stoicInput.trim()}
                    style={stoicLoading ? { ...styles.btn, opacity: 0.6 } : styles.btn}
                  >
                    {stoicLoading ? 'Evaluating...' : 'Get Stoic Evaluation'}
                  </button>
                </div>
                {stoicResult && (
                  <div style={styles.resultBox}>
                    {(stoicResult as Record<string, unknown>).error ? (
                      <div style={styles.errorText}>{String((stoicResult as Record<string, unknown>).error)}</div>
                    ) : (
                      <div>
                        <div style={styles.resultContent}>{String((stoicResult as Record<string, unknown>).reasoning || JSON.stringify(stoicResult.result || stoicResult, null, 2))}</div>
                        {Boolean((stoicResult as Record<string, unknown>).proximity_rating) && (
                          <div style={styles.proximityRating}>
                            Proximity to Sage Reasoning: {String((stoicResult as Record<string, unknown>).proximity_rating)}%
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Morning Briefing */}
              <div style={{ ...styles.card, ...styles.briefingCard }}>
                <div style={styles.cardTitleBold}>Morning Briefing</div>
                <div style={styles.briefingTime}>Generated: {new Date().toLocaleDateString()} at 7:00 AM</div>

                <div style={styles.briefingSection}>
                  <div style={styles.briefingSectionTitle}>SageReasoning Status</div>
                  <div style={styles.briefingItem}>API key connected and tested — 24/24 live API tests passing</div>
                  <div style={styles.briefingItem}>Hold point: 6 of 7 exit criteria complete. Criterion 7 (founder confirms clear view of P1) still open</div>
                  <div style={styles.briefingItem}>Test harness: 158 PASS, 0 FAIL, 5 WARN</div>
                </div>

                <div style={styles.briefingSection}>
                  <div style={styles.briefingSectionTitle}>Deployed Resources</div>
                  {[
                    'Three live hub pages: /private-mentor, /mentor-hub, /ops-hub',
                    'Schema and data extraction pipeline active',
                    'Monitoring journal sections for completeness',
                  ].map((item, idx) => (
                    <div key={idx} style={styles.briefingCheckbox}>
                      <div
                        style={{
                          ...styles.checkbox,
                          ...(completedItems[`priority_${idx}`] ? styles.checkboxChecked : {}),
                        }}
                        onClick={() => toggleCheckbox(`priority_${idx}`)}
                      >
                        {completedItems[`priority_${idx}`] && <span style={styles.checkboxCheck}>✓</span>}
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={styles.briefingSection}>
                  <div style={styles.briefingSectionTitle}>Data Extraction Gaps</div>
                  <div style={styles.briefingItem}>5 of 12 journal sections need structured data extraction (42% gap)</div>
                  <div style={styles.briefingItem}>Schema inconsistency across extracted sections — field names shift between sections</div>
                </div>
              </div>

              {/* Status Row */}
              <div style={styles.statusRow}>
                <div style={styles.statusCard}>
                  <div style={styles.cardTitle}>Latest Competitive Alert</div>
                  <div style={styles.statusLabel}>RivalAI announced new pricing tier</div>
                  <div style={styles.statusItem}>Position: Lower than us on entry price</div>
                  <div style={styles.statusItem}>Threat: Medium — targeting SMBs</div>
                  <div style={styles.statusItem}>Our response: Bundled tier launching next week</div>
                </div>

                <div style={styles.statusCard}>
                  <div style={styles.cardTitle}>Regulatory Deadlines</div>
                  <div style={styles.statusLabel}>Next item: GDPR audit</div>
                  <div style={styles.statusItem}>Days remaining: 8 days</div>
                  <div style={styles.statusItem}>Status: On track, audit scheduled</div>
                  <div style={styles.statusItem}>Owner: Legal & Compliance</div>
                </div>

                <div style={styles.statusCard}>
                  <div style={styles.cardTitle}>Pipeline Health</div>
                  <div style={styles.statusLabel}>Quarterly forecast: $180K</div>
                  <div style={styles.statusItem}>Deals in final stage: 5</div>
                  <div style={styles.statusItem}>Win rate this month: 68%</div>
                  <div style={styles.statusItem}>Avg deal cycle: 22 days</div>
                </div>
              </div>
            </div>

            <div style={styles.footer}>
              <div style={styles.footerDisclaimer}>
                ⚠️ <strong>Philosophical Practice Tool Notice:</strong> This is not professional advice. All recommendations from Sage Ops are informational. Consult qualified professionals for legal, financial, and healthcare decisions.
              </div>
            </div>
          </div>
        )}

        {/* ALERTS VIEW */}
        {currentView === 'alerts' && (
          <div style={styles.view}>
            <div style={styles.pageHeader}>
              <div>
                <div style={styles.pageTitle}>Alerts & Issues</div>
                <div style={styles.pageSubtitle}>{filteredAlerts.length} active alerts across operations</div>
              </div>
              <div style={styles.pageControls}>
                <button style={styles.btn}>Clear All</button>
                <button style={{ ...styles.btn, ...styles.btnPrimary }}>Configure</button>
              </div>
            </div>

            <div style={styles.contentGrid}>
              <div style={{ ...styles.card, ...styles.alertCard }}>
                <div style={styles.alertFilterBar}>
                  <div
                    style={{
                      ...styles.filterBtn,
                      ...(alertFilter === 'all' ? styles.filterBtnActive : {}),
                    }}
                    onClick={() => filterAlerts('all')}
                  >
                    All ({alerts.length})
                  </div>
                  <div
                    style={{
                      ...styles.filterBtn,
                      ...(alertFilter === 'critical' ? styles.filterBtnActive : {}),
                    }}
                    onClick={() => filterAlerts('critical')}
                  >
                    Critical (1)
                  </div>
                  <div
                    style={{
                      ...styles.filterBtn,
                      ...(alertFilter === 'warning' ? styles.filterBtnActive : {}),
                    }}
                    onClick={() => filterAlerts('warning')}
                  >
                    Warning (2)
                  </div>
                </div>

                {filteredAlerts.map((alert, idx) => (
                  <div key={idx} style={styles.alertItem}>
                    <div
                      style={{
                        ...styles.alertSeverity,
                        ...(alert.severity === 'critical'
                          ? styles.alertSeverityCritical
                          : alert.severity === 'warning'
                          ? styles.alertSeverityWarning
                          : styles.alertSeverityInfo),
                      }}
                    ></div>
                    <div style={styles.alertContent}>
                      <div style={styles.alertHeader}>
                        <span style={styles.alertDomain}>{alert.domain}</span>
                        <span style={styles.alertTime}>{alert.time}</span>
                      </div>
                      <div style={styles.alertMessage}>{alert.message}</div>
                      <div style={styles.alertActions}>
                        <button
                          style={styles.alertBtn}
                          onClick={() => handleAlertEvaluation(alert.message)}
                        >
                          {alertEvaluating === alert.message
                            ? 'Evaluating...'
                            : alertResults[alert.message]
                            ? 'Hide Eval'
                            : 'Evaluate'}
                        </button>
                        <button style={styles.alertBtn}>Acknowledge</button>
                      </div>
                      {Boolean(alertResults[alert.message]) && (
                        <div style={styles.resultBox}>
                          {(alertResults[alert.message] as Record<string, unknown>)?.error ? (
                            <div style={styles.errorText}>{String((alertResults[alert.message] as Record<string, unknown>).error)}</div>
                          ) : (
                            <div style={styles.resultContent}>
                              {String((alertResults[alert.message] as Record<string, unknown>)?.reasoning || JSON.stringify(alertResults[alert.message], null, 2))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.footer}>
              <div style={styles.footerDisclaimer}>
                All alerts are monitored by Sage Ops. Critical alerts require acknowledgment within 2 hours.
              </div>
            </div>
          </div>
        )}

        {/* DECISION SCORING VIEW */}
        {currentView === 'briefing' && (
          <div style={styles.view}>
            <div style={styles.pageHeader}>
              <div>
                <div style={styles.pageTitle}>Decision Scoring</div>
                <div style={styles.pageSubtitle}>Compare two options against Stoic principles</div>
              </div>
            </div>

            <div style={styles.contentGrid}>
              <div style={{ ...styles.card, ...styles.stoicCheck }}>
                <div style={styles.cardTitleBold}>Evaluate Two Decisions</div>
                <div style={styles.decisionContainer}>
                  <div style={styles.decisionInputGroup}>
                    <label style={styles.inputLabel}>Option 1:</label>
                    <textarea
                      placeholder="First decision option..."
                      value={decisionOption1}
                      onChange={(e) => setDecisionOption1(e.target.value)}
                      style={styles.stoicTextarea}
                    />
                  </div>

                  <div style={styles.decisionInputGroup}>
                    <label style={styles.inputLabel}>Option 2:</label>
                    <textarea
                      placeholder="Second decision option..."
                      value={decisionOption2}
                      onChange={(e) => setDecisionOption2(e.target.value)}
                      style={styles.stoicTextarea}
                    />
                  </div>

                  <button
                    onClick={handleDecisionScoring}
                    disabled={scoringLoading || !decisionOption1.trim() || !decisionOption2.trim()}
                    style={scoringLoading ? { ...styles.btn, opacity: 0.6 } : styles.btn}
                  >
                    {scoringLoading ? 'Scoring...' : 'Score Decisions'}
                  </button>
                </div>

                {scoringResult && (
                  <div style={styles.resultBox}>
                    {scoringResult.error ? (
                      <div style={styles.errorText}>{String(scoringResult.error)}</div>
                    ) : (
                      <div>
                        <div style={styles.resultContent}>{String(scoringResult.comparison || JSON.stringify(scoringResult.result || scoringResult, null, 2))}</div>
                        {Boolean(scoringResult.recommendation) && (
                          <div style={styles.recommendation}>
                            <strong>Recommendation:</strong> {String(scoringResult.recommendation)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.footer}>
              <div style={styles.footerDisclaimer}>
                Decision scoring is based on Stoic principles and does not constitute professional advice.
              </div>
            </div>
          </div>
        )}

        {/* WEEKLY REVIEW VIEW */}
        {currentView === 'weekly' && (
          <div style={styles.view}>
            <div style={styles.pageHeader}>
              <div>
                <div style={styles.pageTitle}>Weekly Review</div>
                <div style={styles.pageSubtitle}>Week of {new Date().toLocaleDateString()}</div>
              </div>
              <div style={styles.pageControls}>
                <button style={styles.btn}>Previous Week</button>
                <button style={{ ...styles.btn, ...styles.btnPrimary }}>Next Week</button>
              </div>
            </div>

            <div style={styles.contentGrid}>
              <div style={{ ...styles.card, ...styles.timelineCard }}>
                <div style={styles.cardTitleBold}>Key Events This Week</div>

                {[
                  { date: 'Monday, Apr 7', title: 'Series A Investor Meeting', status: 'Scheduled' },
                  { date: 'Wednesday, Apr 9', title: 'Product Launch', status: 'In Progress' },
                  { date: 'Friday, Apr 11', title: 'Board Review', status: 'Upcoming' },
                ].map((event, idx) => (
                  <div key={idx} style={styles.timelineItem}>
                    <div style={styles.timelineMarker}></div>
                    <div style={styles.timelineContent}>
                      <div style={styles.timelineDate}>{event.date}</div>
                      <div style={styles.timelineTitle}>{event.title}</div>
                      <span style={styles.statusBadge}>{event.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.footer}>
              <div style={styles.footerDisclaimer}>
                Weekly reviews help maintain philosophical consistency in operations.
              </div>
            </div>
          </div>
        )}

        {/* PIPELINE VIEW */}
        {currentView === 'pipeline' && (
          <div style={styles.view}>
            <div style={styles.pageHeader}>
              <div>
                <div style={styles.pageTitle}>Pipeline Status</div>
                <div style={styles.pageSubtitle}>Real-time intelligence pipeline health</div>
              </div>
              <div style={styles.pageControls}>
                <button style={styles.btn}>View Logs</button>
                <button style={{ ...styles.btn, ...styles.btnPrimary }}>Run Sync</button>
              </div>
            </div>

            <div style={styles.contentGrid}>
              <div style={{ ...styles.card, ...styles.pipelineCard }}>
                <div style={styles.cardTitleBold}>Priority Roadmap</div>

                <div style={styles.pipelineStat}>
                  <span style={styles.pipelineStatLabel}>P0: Foundations</span>
                  <span style={styles.pipelineStatValue}>6/7 criteria met</span>
                </div>

                <div style={styles.pipelineStat}>
                  <span style={styles.pipelineStatLabel}>P1: Business Plan Review</span>
                  <span style={styles.pipelineStatValue}>Waiting on P0</span>
                </div>

                <div style={styles.pipelineStat}>
                  <span style={styles.pipelineStatLabel}>P2: Ethical Safeguards</span>
                  <span style={styles.pipelineStatValue}>Scoped</span>
                </div>

                <div style={styles.pipelineStat}>
                  <span style={styles.pipelineStatLabel}>P3: Agent Trust Layer</span>
                  <span style={styles.pipelineStatValue}>Scaffolded</span>
                </div>
              </div>

              <div style={{ ...styles.card, ...styles.sourceListCard }}>
                <div style={styles.cardTitleBold}>Exit Criteria Status</div>

                {['0a: Core reasoning engine', '0b: API integration', '0c: Test harness', '0d: Hub pages', '0e: Schema extraction', '0f: Mentor index', '0g: Criterion 7 (pending)'].map(
                  (criterion, idx) => (
                    <div key={idx} style={styles.sourceItem}>
                      <span style={styles.sourceName}>{criterion}</span>
                      <div style={styles.sourceStatus}>
                        <div style={{ ...styles.statusIndicator, ...(idx < 6 ? styles.statusIndicatorActive : styles.statusIndicatorInactive) }}></div>
                        <span style={styles.sourceTime}>{idx < 6 ? 'Complete' : 'Pending'}</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div style={styles.footer}>
              <div style={styles.footerDisclaimer}>
                Pipeline processing is automated. Items flagged for review are queued above.
              </div>
            </div>
          </div>
        )}

        {/* COMPETITIVE INTEL VIEW */}
        {currentView === 'competitive' && (
          <div style={styles.view}>
            <div style={styles.pageHeader}>
              <div>
                <div style={styles.pageTitle}>Competitive Intelligence</div>
                <div style={styles.pageSubtitle}>Top 3 competitor monitoring</div>
              </div>
              <div style={styles.pageControls}>
                <button style={styles.btn}>Add Competitor</button>
                <button style={{ ...styles.btn, ...styles.btnPrimary }}>Weekly Brief</button>
              </div>
            </div>

            <div style={styles.contentGrid}>
              <div style={styles.competitorsGrid}>
                {[
                  { name: 'RivalAI', threat: 'high', change: '52 minutes ago', event: 'Series B: $18M' },
                  { name: 'InnovateAI', threat: 'medium', change: '3 days ago', event: 'Pricing update' },
                  { name: 'TechVentures', threat: 'low', change: '1 week ago', event: 'Expansion' },
                ].map((competitor, idx) => (
                  <div key={idx} style={{ ...styles.card, ...styles.competitorCard }}>
                    <div style={styles.competitorName}>{competitor.name}</div>
                    <div style={styles.competitorStat}>
                      <span>Last Change:</span>
                      <span style={styles.competitorStatValue}>{competitor.change}</span>
                    </div>
                    <div style={styles.competitorStat}>
                      <span>Recent Event:</span>
                      <span style={styles.competitorStatValue}>{competitor.event}</span>
                    </div>
                    <div style={styles.threatIndicator}>
                      <div
                        style={{
                          ...styles.threatLevel,
                          backgroundColor:
                            competitor.threat === 'high'
                              ? '#c95050'
                              : competitor.threat === 'medium'
                              ? '#d9903a'
                              : '#4daa6a',
                        }}
                      ></div>
                      <span style={styles.threatText}>
                        {competitor.threat.charAt(0).toUpperCase() + competitor.threat.slice(1)} threat
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.footer}>
              <div style={styles.footerDisclaimer}>
                Competitive intelligence is gathered from public sources and analyzed for relevance.
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {currentView === 'settings' && (
          <div style={styles.view}>
            <div style={styles.pageHeader}>
              <div>
                <div style={styles.pageTitle}>Settings</div>
                <div style={styles.pageSubtitle}>Configure Sage Ops Hub preferences</div>
              </div>
            </div>

            <div style={styles.contentGrid}>
              <div style={{ ...styles.card, ...styles.settingCard }}>
                <div style={styles.settingTitle}>Notifications</div>

                {[
                  { key: 'dailyBriefing', label: 'Daily Briefing' },
                  { key: 'alertNotifications', label: 'Alert Notifications' },
                  { key: 'competitiveAlerts', label: 'Competitive Alerts' },
                  { key: 'pipelineSync', label: 'Pipeline Sync Status' },
                ].map((item) => (
                  <div key={item.key} style={styles.settingItem}>
                    <span style={styles.settingLabel}>{item.label}</span>
                    <div
                      style={{
                        ...styles.toggle,
                        ...((settings as Record<string, boolean>)[item.key] ? styles.toggleOn : {}),
                      }}
                      onClick={() => toggleSetting(item.key)}
                    >
                      <div style={styles.toggleKnob}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ ...styles.card, ...styles.settingCard }}>
                <div style={styles.settingTitle}>Sync Preferences</div>

                <div style={styles.settingItem}>
                  <span style={styles.settingLabel}>Sync Interval</span>
                  <select style={styles.timeInput}>
                    <option>Every 15 minutes</option>
                    <option>Every 30 minutes</option>
                    <option>Hourly</option>
                  </select>
                </div>

                <div style={styles.settingItem}>
                  <span style={styles.settingLabel}>Context Freshness Target</span>
                  <input type="number" min="0" max="100" defaultValue="87" style={styles.numberInput} />
                </div>
              </div>
            </div>

            <div style={styles.footer}>
              <div style={styles.footerDisclaimer}>
                Settings are saved automatically. Your preferences help personalize the Sage Ops experience.
              </div>
            </div>
          </div>
        )}

        {/* LAYER 0 SYNC VIEW */}
        {currentView === 'layer0' && (
          <div style={styles.view}>
            <div style={styles.pageHeader}>
              <div>
                <div style={styles.pageTitle}>Layer 0 Sync</div>
                <div style={styles.pageSubtitle}>Document synchronization and change tracking</div>
              </div>
              <div style={styles.pageControls}>
                <button style={styles.btn}>View History</button>
                <button style={{ ...styles.btn, ...styles.btnPrimary }}>Sync Now</button>
              </div>
            </div>

            <div style={styles.contentGrid}>
              <div style={{ ...styles.card, ...styles.layer0Card }}>
                <div style={styles.cardTitleBold}>Recently Synced Documents</div>

                {['Compliance Framework v2.3', 'Risk Assessment 2026', 'Security Policy Update'].map((doc, idx) => (
                  <div key={idx} style={styles.docItem}>
                    <span style={styles.docName}>{doc}</span>
                    <span style={styles.docDate}>Today at {9 + idx}:30 AM</span>
                  </div>
                ))}
              </div>

              <div style={{ ...styles.card, ...styles.layer0Card }}>
                <div style={styles.cardTitleBold}>Recent Changes</div>

                {[
                  { title: 'Compliance rules updated', detail: '3 new obligations added' },
                  { title: 'Security policies modified', detail: 'MFA requirement expanded' },
                  { title: 'Financial procedures revised', detail: 'Approval thresholds changed' },
                ].map((change, idx) => (
                  <div key={idx} style={styles.changeItem}>
                    <div style={styles.changeItemTitle}>{change.title}</div>
                    <div style={styles.changeItemDetail}>{change.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.footer}>
              <div style={styles.footerDisclaimer}>
                Layer 0 Sync ensures your operational context is always fresh and up-to-date.
              </div>
            </div>
          </div>
        )}

        {/* DOMAIN VIEW */}
        {currentView === 'domain' && activeDomain && (
          <div style={styles.view}>
            <div style={styles.pageHeader}>
              <div>
                <div style={styles.pageTitle}>{activeDomain} Domain</div>
                <div style={styles.pageSubtitle}>Obligations and guidance for {activeDomain}</div>
              </div>
            </div>

            <div style={styles.contentGrid}>
              <div style={{ ...styles.card, ...styles.domainContent }}>
                <div style={styles.domainHeader}>
                  <div style={styles.domainName}>{activeDomain}</div>
                  <div style={styles.domainDescription}>
                    Active obligations and decisions related to {activeDomain?.toLowerCase()} management
                  </div>
                </div>

                <div style={styles.domainSection}>
                  <div style={styles.domainSectionTitle}>Active Obligations</div>
                  <div style={styles.domainItem}>Maintain {activeDomain} standards and practices</div>
                  <div style={styles.domainItem}>Monitor compliance requirements</div>
                  <div style={styles.domainItem}>Report status weekly</div>
                </div>

                <div style={styles.domainSection}>
                  <div style={styles.domainSectionTitle}>Recent Decisions</div>
                  <div style={styles.domainItem}>Updated {activeDomain} policy (3 days ago)</div>
                  <div style={styles.domainItem}>Approved new procedures (1 week ago)</div>
                </div>

                <div style={styles.domainSection}>
                  <div style={styles.domainSectionTitle}>Stoic Principles for This Domain</div>
                  <div style={styles.domainItem}>Focus on what is within your control</div>
                  <div style={styles.domainItem}>Act with consistency and virtue</div>
                  <div style={styles.domainItem}>Accept outcomes while striving for excellence</div>
                </div>
              </div>
            </div>

            <div style={styles.footer}>
              <div style={styles.footerDisclaimer}>
                Domain guidance reflects Stoic principles applied to {activeDomain?.toLowerCase()} decisions.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const cssVariables = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #282e44;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #343d54;
  }
`

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    backgroundColor: '#0f1117',
    color: '#d0d4e2',
    lineHeight: '1.5',
  },

  sidebar: {
    width: '280px',
    backgroundColor: '#171b26',
    borderRight: '1px solid #282e44',
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  sidebarHeader: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #282e44',
  },

  brand: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6a7192',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },

  sageTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#c9a24d',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,

  sageIcon: {
    width: '20px',
    height: '20px',
    background: 'linear-gradient(135deg, #c9a24d 0%, #d9903a 100%)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#0f1117',
  } as React.CSSProperties,

  contextCard: {
    backgroundColor: '#1d2233',
    border: '1px solid #282e44',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '20px',
    fontSize: '12px',
  },

  contextCardTitle: {
    color: '#eef0f8',
    fontWeight: '600',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  } as React.CSSProperties,

  contextStatusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#4daa6a',
  },

  contextStat: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    color: '#6a7192',
  } as React.CSSProperties,

  contextStatValue: {
    color: '#eef0f8',
    fontWeight: '600',
  },

  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#282e44',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '10px',
  },

  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4daa6a 0%, #c9a24d 100%)',
    borderRadius: '2px',
  },

  navSection: {
    marginBottom: '24px',
  },

  navSectionTitle: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#4a5070',
    letterSpacing: '0.5px',
    marginBottom: '10px',
    padding: '0 8px',
  },

  navItem: {
    padding: '10px 12px',
    marginBottom: '4px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '13px',
    color: '#6a7192',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid transparent',
  } as React.CSSProperties,

  navItemActive: {
    backgroundColor: '#282e44',
    color: '#c9a24d',
    borderColor: '#c9a24d',
    fontWeight: '600',
  },

  navIcon: {
    width: '16px',
    height: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
  } as React.CSSProperties,

  domainsList: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
    marginBottom: '8px',
  } as React.CSSProperties,

  domainTag: {
    padding: '6px 8px',
    backgroundColor: '#1d2233',
    border: '1px solid #282e44',
    borderRadius: '6px',
    fontSize: '11px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#6a7192',
  } as React.CSSProperties,

  domainTagActive: {
    backgroundColor: '#c9a24d',
    color: '#0f1117',
    borderColor: '#c9a24d',
    fontWeight: '600',
  },

  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid #282e44',
    fontSize: '11px',
    color: '#4a5070',
    textAlign: 'center' as const,
  },

  mainContent: {
    flex: '1',
    overflowY: 'auto',
    backgroundColor: '#0f1117',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
  } as React.CSSProperties,

  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#eef0f8',
  },

  pageSubtitle: {
    fontSize: '13px',
    color: '#6a7192',
    marginTop: '4px',
  },

  pageControls: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  } as React.CSSProperties,

  btn: {
    padding: '10px 16px',
    backgroundColor: '#282e44',
    color: '#d0d4e2',
    border: '1px solid #282e44',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  btnPrimary: {
    backgroundColor: '#c9a24d',
    color: '#0f1117',
    borderColor: '#c9a24d',
    fontWeight: '600',
  },

  contentGrid: {
    flex: '1',
    overflowY: 'auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '20px',
    gridAutoRows: 'max-content',
  } as React.CSSProperties,

  view: {
    display: 'block',
  },

  card: {
    backgroundColor: '#1d2233',
    border: '1px solid #282e44',
    borderRadius: '10px',
    padding: '18px',
  },

  cardTitle: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#6a7192',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  } as React.CSSProperties,

  cardTitleBold: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#eef0f8',
    textTransform: 'none',
    marginBottom: '12px',
  },

  kpiCard: {
    gridColumn: 'span 1',
  } as React.CSSProperties,

  kpiValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#c9a24d',
    marginBottom: '4px',
  },

  kpiLabel: {
    fontSize: '13px',
    color: '#6a7192',
  },

  kpiChange: {
    fontSize: '11px',
    color: '#4daa6a',
    marginTop: '8px',
  },

  stoicCheck: {
    gridColumn: 'span 4',
    border: '2px solid #c9a24d',
    background: 'linear-gradient(135deg, rgba(201, 162, 77, 0.1) 0%, rgba(201, 162, 77, 0.05) 100%)',
  } as React.CSSProperties,

  stoicCheckIcon: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    backgroundColor: '#c9a24d',
    borderRadius: '4px',
    marginRight: '8px',
    lineHeight: '20px',
    textAlign: 'center',
    color: '#0f1117',
    fontWeight: 'bold',
    fontSize: '12px',
  } as React.CSSProperties,

  stoicCheckTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#c9a24d',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,

  stoicCheckContent: {
    fontSize: '13px',
    color: '#eef0f8',
    lineHeight: '1.6',
    marginBottom: '10px',
  },

  stoicTextarea: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#282e44',
    border: '1px solid #282e44',
    borderRadius: '6px',
    color: '#d0d4e2',
    fontSize: '13px',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    minHeight: '80px',
    marginBottom: '12px',
  } as React.CSSProperties,

  resultBox: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#282e44',
    borderRadius: '6px',
    borderLeft: '3px solid #c9a24d',
  },

  resultContent: {
    fontSize: '13px',
    color: '#d0d4e2',
    lineHeight: '1.6',
  },

  errorText: {
    color: '#c95050',
    fontSize: '13px',
  },

  proximityRating: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#6b8aef',
    fontWeight: '600',
  },

  briefingCard: {
    gridColumn: 'span 4',
  } as React.CSSProperties,

  briefingTime: {
    fontSize: '11px',
    color: '#6a7192',
    marginBottom: '12px',
  },

  briefingSection: {
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #282e44',
  },

  briefingSectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b8aef',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },

  briefingItem: {
    fontSize: '13px',
    color: '#d0d4e2',
    marginBottom: '6px',
    paddingLeft: '16px',
    position: 'relative',
  } as React.CSSProperties,

  briefingCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#d0d4e2',
    marginBottom: '8px',
    cursor: 'pointer',
  } as React.CSSProperties,

  checkbox: {
    width: '16px',
    height: '16px',
    border: '1px solid #282e44',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  } as React.CSSProperties,

  checkboxChecked: {
    backgroundColor: '#c9a24d',
    borderColor: '#c9a24d',
  },

  checkboxCheck: {
    color: '#0f1117',
    fontWeight: 'bold',
    fontSize: '10px',
  },

  statusRow: {
    gridColumn: 'span 4',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  } as React.CSSProperties,

  statusCard: {
    backgroundColor: '#1d2233',
    border: '1px solid #282e44',
    borderRadius: '10px',
    padding: '18px',
  },

  statusLabel: {
    fontSize: '12px',
    color: '#6a7192',
    marginBottom: '12px',
  },

  statusItem: {
    fontSize: '13px',
    color: '#d0d4e2',
    marginBottom: '8px',
    paddingLeft: '12px',
    position: 'relative',
  } as React.CSSProperties,

  alertCard: {
    gridColumn: 'span 4',
  } as React.CSSProperties,

  alertFilterBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  } as React.CSSProperties,

  filterBtn: {
    padding: '6px 12px',
    backgroundColor: '#282e44',
    color: '#6a7192',
    border: '1px solid #282e44',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  filterBtnActive: {
    backgroundColor: '#282e44',
    color: '#c9a24d',
    borderColor: '#c9a24d',
  },

  alertItem: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    marginBottom: '8px',
    backgroundColor: '#282e44',
    borderRadius: '6px',
    alignItems: 'flex-start',
  } as React.CSSProperties,

  alertSeverity: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '4px',
    flexShrink: 0,
  },

  alertSeverityCritical: {
    backgroundColor: '#c95050',
  },

  alertSeverityWarning: {
    backgroundColor: '#d9903a',
  },

  alertSeverityInfo: {
    backgroundColor: '#6b8aef',
  },

  alertContent: {
    flex: '1',
    minWidth: 0,
  } as React.CSSProperties,

  alertHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '4px',
  } as React.CSSProperties,

  alertDomain: {
    display: 'inline-block',
    padding: '2px 6px',
    backgroundColor: '#1d2233',
    borderRadius: '4px',
    fontSize: '10px',
    color: '#6a7192',
    textTransform: 'uppercase',
  },

  alertTime: {
    fontSize: '11px',
    color: '#6a7192',
  },

  alertMessage: {
    fontSize: '13px',
    color: '#d0d4e2',
    marginBottom: '8px',
  },

  alertActions: {
    display: 'flex',
    gap: '6px',
  } as React.CSSProperties,

  alertBtn: {
    padding: '4px 8px',
    backgroundColor: '#1d2233',
    color: '#6a7192',
    border: '1px solid #282e44',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  pipelineCard: {
    gridColumn: 'span 2',
  } as React.CSSProperties,

  pipelineStat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#282e44',
    borderRadius: '6px',
    marginBottom: '10px',
  } as React.CSSProperties,

  pipelineStatLabel: {
    fontSize: '12px',
    color: '#6a7192',
  },

  pipelineStatValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#c9a24d',
  },

  sourceListCard: {
    gridColumn: 'span 2',
  } as React.CSSProperties,

  sourceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #282e44',
    fontSize: '12px',
  } as React.CSSProperties,

  sourceName: {
    color: '#d0d4e2',
    fontWeight: '500',
  },

  sourceStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  } as React.CSSProperties,

  statusIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },

  statusIndicatorActive: {
    backgroundColor: '#4daa6a',
  },

  statusIndicatorInactive: {
    backgroundColor: '#6a7192',
  },

  sourceTime: {
    fontSize: '10px',
    color: '#6a7192',
  },

  competitorsGrid: {
    gridColumn: 'span 4',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  } as React.CSSProperties,

  competitorCard: {
    backgroundColor: '#1d2233',
    border: '1px solid #282e44',
    borderRadius: '10px',
    padding: '18px',
  },

  competitorName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#eef0f8',
    marginBottom: '12px',
  },

  competitorStat: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    marginBottom: '8px',
    color: '#6a7192',
  } as React.CSSProperties,

  competitorStatValue: {
    color: '#d0d4e2',
  },

  threatIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #282e44',
  } as React.CSSProperties,

  threatLevel: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },

  threatText: {
    fontSize: '11px',
    color: '#6a7192',
  },

  timelineCard: {
    gridColumn: 'span 4',
  } as React.CSSProperties,

  timelineItem: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #282e44',
  } as React.CSSProperties,

  timelineMarker: {
    width: '8px',
    height: '8px',
    backgroundColor: '#c9a24d',
    borderRadius: '50%',
    marginTop: '6px',
    flexShrink: 0,
  },

  timelineContent: {
    flex: '1',
  } as React.CSSProperties,

  timelineDate: {
    fontSize: '12px',
    color: '#6a7192',
    marginBottom: '2px',
  },

  timelineTitle: {
    fontSize: '13px',
    color: '#eef0f8',
    marginBottom: '4px',
    fontWeight: '600',
  },

  statusBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    backgroundColor: 'rgba(77, 170, 106, 0.2)',
    color: '#4daa6a',
  },

  settingCard: {
    gridColumn: 'span 2',
  } as React.CSSProperties,

  settingTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#eef0f8',
    marginBottom: '14px',
  },

  settingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #282e44',
    fontSize: '12px',
  } as React.CSSProperties,

  settingLabel: {
    color: '#d0d4e2',
  },

  toggle: {
    width: '32px',
    height: '18px',
    backgroundColor: '#282e44',
    borderRadius: '9px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    border: '1px solid #282e44',
  } as React.CSSProperties,

  toggleOn: {
    backgroundColor: '#4daa6a',
    borderColor: '#4daa6a',
  },

  toggleKnob: {
    width: '14px',
    height: '14px',
    backgroundColor: '#eef0f8',
    borderRadius: '50%',
    position: 'absolute',
    top: '2px',
    left: '2px',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  timeInput: {
    padding: '6px 10px',
    backgroundColor: '#282e44',
    border: '1px solid #282e44',
    borderRadius: '6px',
    color: '#d0d4e2',
    fontSize: '12px',
    cursor: 'pointer',
  } as React.CSSProperties,

  numberInput: {
    padding: '6px 10px',
    backgroundColor: '#282e44',
    border: '1px solid #282e44',
    borderRadius: '6px',
    color: '#d0d4e2',
    fontSize: '12px',
    width: '80px',
  } as React.CSSProperties,

  layer0Card: {
    gridColumn: 'span 2',
  } as React.CSSProperties,

  docItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #282e44',
    fontSize: '12px',
  } as React.CSSProperties,

  docName: {
    color: '#d0d4e2',
    fontWeight: '500',
  },

  docDate: {
    color: '#6a7192',
    fontSize: '11px',
  },

  changeItem: {
    padding: '10px',
    backgroundColor: '#282e44',
    borderLeft: '3px solid #6b8aef',
    borderRadius: '4px',
    marginBottom: '8px',
    fontSize: '12px',
  },

  changeItemTitle: {
    color: '#d0d4e2',
    fontWeight: '500',
    marginBottom: '4px',
  },

  changeItemDetail: {
    color: '#6a7192',
    fontSize: '11px',
  },

  domainContent: {
    gridColumn: 'span 4',
  } as React.CSSProperties,

  domainHeader: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #282e44',
  },

  domainName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#eef0f8',
    marginBottom: '4px',
  },

  domainDescription: {
    fontSize: '13px',
    color: '#6a7192',
  },

  domainSection: {
    backgroundColor: '#1d2233',
    border: '1px solid #282e44',
    borderRadius: '10px',
    padding: '18px',
    marginBottom: '20px',
  },

  domainSectionTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#6b8aef',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },

  domainItem: {
    fontSize: '13px',
    color: '#d0d4e2',
    marginBottom: '8px',
    paddingLeft: '16px',
    position: 'relative',
  } as React.CSSProperties,

  decisionContainer: {
    marginBottom: '16px',
  },

  decisionInputGroup: {
    marginBottom: '16px',
  },

  inputLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b8aef',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },

  recommendation: {
    marginTop: '8px',
    padding: '8px',
    backgroundColor: 'rgba(77, 170, 106, 0.15)',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#d0d4e2',
  },

  footer: {
    paddingTop: '20px',
    borderTop: '1px solid #282e44',
    fontSize: '10px',
    color: '#4a5070',
    lineHeight: '1.4',
    marginTop: '20px',
  },

  footerDisclaimer: {
    backgroundColor: 'rgba(201, 162, 77, 0.05)',
    border: '1px solid rgba(201, 162, 77, 0.2)',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '12px',
  },
}
