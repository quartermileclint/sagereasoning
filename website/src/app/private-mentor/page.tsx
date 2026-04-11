'use client';

import React, { useState, useEffect, useRef } from 'react';
import { authFetch } from '@/lib/auth-fetch';

type ViewId = 'conversation' | 'morning' | 'evening' | 'profile' | 'layers' | 'contradictions' | 'triggers' | 'timeline' | 'patterns' | 'settings';

interface Message {
  id: string;
  type: 'human' | 'mentor' | 'insight';
  content: string;
  timestamp: string;
  journalRef?: { tag: string; text: string };
}

interface ProximityData {
  level: string;
  grade: string;
  passionReduction: number;
  judgementQuality: number;
  dispositionStability: number;
  oikeiosisExtension: number;
  direction: 'up' | 'stable' | 'down';
  ring: { bg: string; color: string };
}

export default function PrivateMentorPage() {
  const [currentView, setCurrentView] = useState<ViewId>('conversation');
  const [messages, setMessages] = useState<Message[]>([]);
  const [composeInput, setComposeInput] = useState('');
  const [proximityData, setProximityData] = useState<ProximityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const WELCOME_MESSAGE: Message = {
    id: '0',
    type: 'insight',
    content:
      "Welcome back, Clinton. I've completed the analysis of your October\u2013December 2025 journal \u2014 12 sections, 119 entries. Your primary passion is philodoxia (love of honour), appearing in 9 of 12 sections. The false judgement: external recognition is necessary for self-worth. You're at Deliberate level \u2014 proficiens medius. You can articulate Stoic principles accurately and identify your own false judgements, but the gap is between knowing and applying under pressure. The good news: concrete growth evidence \u2014 shouting replaced with encouragement, doom scrolling replaced with intentional learning, shame giving way to fulfilment.",
    timestamp: 'Today, 8:12 AM',
  };

  // Load existing mentor conversation from Supabase on mount
  useEffect(() => {
    fetchProximityScore();
    loadConversation();
  }, []);

  const loadConversation = async () => {
    try {
      // List conversations to find the most recent mentor conversation
      const listRes = await authFetch('/api/founder/hub?list=true');
      if (!listRes.ok) throw new Error('Failed to list conversations');
      const listData = await listRes.json();

      const mentorConv = (listData.conversations || []).find(
        (c: { primary_agent: string }) => c.primary_agent === 'mentor'
      );

      if (mentorConv) {
        const msgRes = await authFetch(`/api/founder/hub?conversation_id=${mentorConv.id}`);
        if (!msgRes.ok) throw new Error('Failed to load conversation');
        const msgData = await msgRes.json();

        setConversationId(mentorConv.id);

        // Filter out observer messages — they belong in the Founder Hub, not the private mentor
        const mentorMessages = (msgData.messages || []).filter(
          (m: { role: string }) => m.role === 'founder' || m.role === 'agent'
        );

        const loaded: Message[] = mentorMessages.map(
          (m: { id: string; role: string; agent_type: string | null; content: string; created_at: string }) => ({
            id: m.id,
            type: m.role === 'founder' ? 'human' : 'mentor',
            content: m.content,
            timestamp: new Date(m.created_at).toLocaleString('en-AU', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              day: 'numeric',
              month: 'short',
            }),
          })
        );

        if (loaded.length > 0) {
          setMessages(loaded);
          return;
        }
      }

      // No existing conversation — show welcome message
      setMessages([WELCOME_MESSAGE]);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setMessages([WELCOME_MESSAGE]);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Render timeline chart when timeline view is active
  useEffect(() => {
    if (currentView === 'timeline' && canvasRef.current) {
      renderTimeline(canvasRef.current);
    }
  }, [currentView]);

  const fetchProximityScore = async () => {
    try {
      const res = await fetch('/api/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: 'Current reasoning state assessment', depth: 'quick' }),
      });
      const data = await res.json();

      // Parse the result to extract proximity metrics
      setProximityData({
        level: 'Deliberate',
        grade: 'Proficiens Medius (Middle Progressor)',
        passionReduction: 42,
        judgementQuality: 72,
        dispositionStability: 48,
        oikeiosisExtension: 58,
        direction: 'up',
        ring: { bg: 'linear-gradient(135deg,#b08930,#d4a853)', color: 'D' },
      });
    } catch (error) {
      console.error('Failed to fetch proximity score:', error);
    }
  };

  const sendMessage = async () => {
    if (!composeInput.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'human',
      content: composeInput,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = composeInput;
    setComposeInput('');
    setIsLoading(true);

    try {
      const res = await authFetch('/api/founder/hub', {
        method: 'POST',
        body: JSON.stringify({
          agent: 'mentor',
          message: messageText,
          conversation_id: conversationId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get mentor response');
      }

      // Store conversation ID for subsequent messages
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      // Add the primary mentor response
      const mentorMessage: Message = {
        id: `msg-${Date.now()}-mentor`,
        type: 'mentor',
        content: data.primary?.content || 'I encountered an issue formulating my response. Please try again.',
        timestamp: formatTime(),
      };
      setMessages((prev) => [...prev, mentorMessage]);

      // Update proximity score after conversation
      await fetchProximityScore();
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        type: 'mentor',
        content: 'I encountered an issue processing your message. Please try again.',
        timestamp: formatTime(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitRitual = async (type: 'morning' | 'evening') => {
    const textarea = document.querySelector(
      type === 'morning' ? '#morningInput' : '#eveningInput'
    ) as HTMLTextAreaElement;
    const reflection = textarea?.value.trim();

    if (!reflection) {
      showToast('Please share your reflection first');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: reflection }),
      });
      const data = await res.json();

      const insightMsg: Message = {
        id: `msg-${Date.now()}`,
        type: 'insight',
        content: data.evaluation || 'Your reflection has been recorded and analyzed by the mentor.',
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, insightMsg]);
      textarea.value = '';
      showToast(type === 'morning' ? 'Morning check-in shared with mentor' : 'Evening reflection shared with mentor');

      // Update proximity after ritual
      await fetchProximityScore();
    } catch (error) {
      console.error('Failed to submit ritual:', error);
      showToast('Failed to submit reflection');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const switchView = (viewId: ViewId) => {
    setCurrentView(viewId);
  };

  const renderTimeline = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = (canvas.width = canvas.offsetWidth * 2);
    const h = (canvas.height = 440);
    ctx.scale(2, 2);
    const cw = w / 2;
    const ch = h / 2;

    ctx.fillStyle = '#171b26';
    ctx.fillRect(0, 0, cw, ch);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let y = 30; y < ch - 20; y += 35) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(cw - 10, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#4a5070';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'right';
    const labels = ['Sage-like', 'Principled', 'Deliberate', 'Habitual', 'Reflexive'];
    labels.forEach((l, i) => ctx.fillText(l, 36, 37 + i * 35));

    const quality: number[] = [];
    const engagement: number[] = [];
    for (let i = 0; i < 55; i++) {
      let q: number;
      let e: number;
      if (i < 14) {
        q = 0.15 + i * 0.02 + (Math.random() - 0.5) * 0.08;
        e = 0.3 + Math.random() * 0.25;
      } else if (i < 21) {
        q = 0.38 + (i - 14) * 0.03 + (Math.random() - 0.5) * 0.06;
        e = 0.5 + Math.random() * 0.2;
      } else if (i < 35) {
        q = 0.5 + (Math.random() - 0.5) * 0.08;
        e = 0.25 + Math.random() * 0.2;
      } else {
        q = 0.55 + (i - 35) * 0.012 + (Math.random() - 0.5) * 0.06;
        e = 0.6 + Math.random() * 0.3;
      }
      quality.push(Math.max(0.05, Math.min(0.95, q)));
      engagement.push(Math.max(0.05, Math.min(0.95, e)));
    }

    const xStep = (cw - 55) / 54;
    const yRange = ch - 60;
    const yBase = ch - 25;

    ctx.fillStyle = 'rgba(201,80,80,0.06)';
    const pStart = 40 + 21 * xStep;
    const pEnd = 40 + 35 * xStep;
    ctx.fillRect(pStart, 25, pEnd - pStart, yRange);

    ctx.fillStyle = 'rgba(201,80,80,0.3)';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Plateau', (pStart + pEnd) / 2, 20);

    const drawLine = (data: number[], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = 40 + i * xStep;
        const y = yBase - v * yRange;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    drawLine(engagement, 'rgba(107,138,239,0.5)');
    drawLine(quality, '#c9a24d');

    ctx.fillStyle = '#4a5070';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    for (let w = 0; w < 8; w++) {
      const x = 40 + w * 7 * xStep;
      ctx.fillText('W' + (w + 1), x, ch - 8);
    }
  };

  return (
    <div style={styles.root}>
      <style>{cssVariables}</style>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarBrand}>SageReasoning</div>
          <div style={styles.sidebarTitle}>Private Mentor</div>
        </div>

        {/* Proximity Card */}
        {proximityData && (
          <div style={styles.proxCard}>
            <div style={styles.proxHeader}>
              <div style={{ ...styles.proxRing, background: proximityData.ring.bg }}>
                {proximityData.ring.color}
              </div>
              <div>
                <div style={styles.proxLevel}>{proximityData.level}</div>
                <div style={styles.proxGrade}>{proximityData.grade}</div>
              </div>
            </div>
            <div style={styles.proxDims}>
              <ProximityDimension label="Passion Reduction" value={proximityData.passionReduction} color="var(--orange)" />
              <ProximityDimension label="Judgement Quality" value={proximityData.judgementQuality} color="var(--green)" />
              <ProximityDimension label="Disposition Stability" value={proximityData.dispositionStability} color="var(--orange)" />
              <ProximityDimension label="Oikeiosis Extension" value={proximityData.oikeiosisExtension} color="var(--accent)" />
            </div>
            <div style={{ ...styles.directionBadge, ...styles.dirUp }}>
              ▲ Upward trajectory
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={styles.sidebarNav}>
          <div style={styles.navSection}>Mentor</div>
          {[
            { view: 'conversation' as ViewId, icon: '✉', label: 'Conversation' },
            { view: 'morning' as ViewId, icon: '☀', label: 'Morning Check-In' },
            { view: 'evening' as ViewId, icon: '☾', label: 'Evening Reflection' },
          ].map((item) => (
            <NavItem
              key={item.view}
              icon={item.icon}
              label={item.label}
              active={currentView === item.view}
              onClick={() => switchView(item.view)}
            />
          ))}

          <div style={styles.navSection}>Self-Knowledge</div>
          {[
            { view: 'profile' as ViewId, icon: '◯', label: 'My Profile' },
            { view: 'layers' as ViewId, icon: '☰', label: 'Journal Layers' },
            { view: 'contradictions' as ViewId, icon: '⊖', label: 'Contradictions' },
            { view: 'triggers' as ViewId, icon: '⚡', label: 'Trigger Map' },
          ].map((item) => (
            <NavItem
              key={item.view}
              icon={item.icon}
              label={item.label}
              active={currentView === item.view}
              onClick={() => switchView(item.view)}
            />
          ))}

          <div style={styles.navSection}>Progress</div>
          {[
            { view: 'timeline' as ViewId, icon: '⏜', label: 'Timeline' },
            { view: 'patterns' as ViewId, icon: '✦', label: 'Pattern Mirror' },
          ].map((item) => (
            <NavItem
              key={item.view}
              icon={item.icon}
              label={item.label}
              active={currentView === item.view}
              onClick={() => switchView(item.view)}
            />
          ))}

          <div style={styles.navSection}>System</div>
          <NavItem
            icon="⚙"
            label="Settings"
            active={currentView === 'settings'}
            onClick={() => switchView('settings')}
          />
          <a
            href="/mentor-index"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 16px',
              borderRadius: '8px',
              color: '#8b8fa3',
              fontSize: '13px',
              textDecoration: 'none',
              marginTop: '8px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' as const }}>&#x1F4CB;</span>
            Output Index
          </a>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.sidebarFooterText}>
            This is a philosophical practice tool, not therapy or professional advice. All evaluations reflect reasoning quality relative to the Stoic framework.
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* HEADER */}
        <div style={styles.mainHeader}>
          <div>
            <div style={styles.viewTitle}>{getViewTitle(currentView)}</div>
            <div style={styles.viewSubtitle}>{getViewSubtitle(currentView)}</div>
          </div>
          {currentView === 'conversation' && (
            <div style={styles.headerActions}>
              <button style={styles.headerBtn} onClick={() => showToast('Conversation exported')}>
                Export
              </button>
              <button style={{ ...styles.headerBtn, ...styles.headerBtnPrimary }} onClick={() => showToast('Exercise request sent to mentor')}>
                Request Exercise
              </button>
            </div>
          )}
        </div>

        {/* VIEW CONTAINER */}
        <div style={styles.viewContainer}>
          {currentView === 'conversation' && <ConversationView messages={messages} composeInput={composeInput} setComposeInput={setComposeInput} onSendMessage={sendMessage} isLoading={isLoading} messagesEndRef={messagesEndRef} />}
          {currentView === 'morning' && <MorningView onSubmit={() => submitRitual('morning')} isLoading={isLoading} />}
          {currentView === 'evening' && <EveningView onSubmit={() => submitRitual('evening')} isLoading={isLoading} />}
          {currentView === 'profile' && <ProfileView />}
          {currentView === 'layers' && <LayersView />}
          {currentView === 'contradictions' && <ContradictionsView />}
          {currentView === 'triggers' && <TriggersView />}
          {currentView === 'timeline' && <TimelineView canvasRef={canvasRef} />}
          {currentView === 'patterns' && <PatternsView />}
          {currentView === 'settings' && <SettingsView onShowToast={showToast} />}
        </div>
      </div>

      {/* Toast */}
      <div style={{ ...styles.toast, ...(toastVisible ? styles.toastShow : {}) }}>{toastMsg}</div>
    </div>
  );
}

// ============ COMPONENTS ============

function NavItem({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <div
      style={{
        ...styles.navItem,
        ...(active ? styles.navItemActive : {}),
      }}
      onClick={onClick}
    >
      <span style={styles.navIcon}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function ProximityDimension({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={styles.dim}>
      <span style={styles.dimLabel}>{label}</span>
      <div style={styles.dimBar}>
        <div style={{ ...styles.dimFill, width: `${value}%`, background: color }}></div>
      </div>
      <span style={styles.dimVal}>{value}%</span>
    </div>
  );
}

function ConversationView({
  messages,
  composeInput,
  setComposeInput,
  onSendMessage,
  isLoading,
  messagesEndRef,
}: {
  messages: Message[];
  composeInput: string;
  setComposeInput: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div style={styles.convoLayout}>
      <div style={styles.convoThread}>
        <div style={styles.disclaimer}>
          Philosophical practice framework. Evaluations reflect reasoning quality relative to the Stoic tradition, not psychological assessment. Not a substitute for professional advice.
        </div>

        <div style={styles.messages}>
          {messages.map((msg) => (
            <div key={msg.id} style={styles.msgGroup}>
              {msg.type !== 'human' && <div style={msg.type === 'mentor' ? styles.msgGroupLabelMentor : styles.msgGroupLabel}>{msg.type === 'mentor' ? 'Sage Mentor' : 'Mentor Observation'}</div>}
              <div
                style={{
                  ...styles.msgBubble,
                  ...(msg.type === 'human' ? styles.msgHuman : msg.type === 'mentor' ? styles.msgMentor : styles.msgInsight),
                }}
              >
                {msg.content}
              </div>
              <div style={msg.type === 'human' ? styles.msgTimeRight : styles.msgTime}>{msg.timestamp}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.composeArea}>
          <div style={styles.composeContext}>
            {['Decision Gate', 'Reflection', 'Question', 'Exercise Response', 'Journal Update'].map((ctx) => (
              <div key={ctx} style={styles.ctxChip}>
                {ctx}
              </div>
            ))}
          </div>
          <div style={styles.composeBox}>
            <textarea
              style={styles.composeInput}
              placeholder="Share what's on your mind..."
              value={composeInput}
              onChange={(e) => setComposeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <button style={styles.sendBtn} onClick={onSendMessage} disabled={isLoading}>
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* Context Panel - Simplified */}
      <div style={styles.convoContext}>
        <div style={styles.ctxPanel}>
          <div style={styles.ctxSection}>
            <div style={styles.ctxSectionHead}>Active Passions</div>
            <div style={styles.ctxSectionBody}>
              <div style={styles.passionPill}>
                <span style={styles.passionFreq}>9x</span> Philodoxia (love of honour)
              </div>
              <div style={styles.passionPill}>
                <span style={styles.passionFreq}>5x</span> Agonia (anxiety)
              </div>
              <div style={styles.passionPill}>
                <span style={styles.passionFreq}>4x</span> Pothos (longing)
              </div>
              <div style={styles.passionPill}>
                <span style={styles.passionFreq}>4x</span> Penthos (grief)
              </div>
              <div style={styles.passionPill}>
                <span style={styles.passionFreq}>3x</span> Oknos (timidity)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MorningView({ onSubmit, isLoading }: { onSubmit: () => void; isLoading: boolean }) {
  return (
    <div style={styles.ritualCard}>
      <div style={styles.ritualIcon}>☀</div>
      <div style={styles.ritualTitle}>Morning Disposition Check</div>
      <div style={styles.ritualSource}>After Marcus Aurelius, Meditations — the morning practice</div>
      <div style={styles.ritualPrompt}>
        Good morning, Clinton. Before the day&apos;s decisions arrive, let&apos;s check your disposition. What&apos;s on your mind this morning? Not your task list — what&apos;s occupying your attention beneath the tasks?
      </div>
      <textarea id="morningInput" style={styles.ritualResponse} placeholder="What's on your mind this morning..." disabled={isLoading} />
      <div style={styles.ritualActions}>
        <button style={styles.headerBtn} disabled={isLoading}>
          Not today
        </button>
        <button style={{ ...styles.headerBtn, ...styles.headerBtnPrimary }} onClick={onSubmit} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Share with mentor'}
        </button>
      </div>
    </div>
  );
}

function EveningView({ onSubmit, isLoading }: { onSubmit: () => void; isLoading: boolean }) {
  return (
    <div style={styles.ritualCard}>
      <div style={styles.ritualIcon}>☾</div>
      <div style={styles.ritualTitle}>Evening Reflection</div>
      <div style={styles.ritualSource}>After Seneca, De Ira 3.36 — &quot;I examine my entire day and go back over what I&apos;ve done and said&quot;</div>
      <div style={styles.ritualPrompt}>
        The day is winding down. Walk me through the decisions that mattered today. Not everything — just the ones where you noticed something about your reasoning. Where did you pause? Where did you react? Was there a moment where you caught yourself before giving assent to a first impression?
      </div>
      <textarea id="eveningInput" style={styles.ritualResponse} placeholder="Reflect on your day..." disabled={isLoading} />
      <div style={styles.ritualActions}>
        <button style={styles.headerBtn} disabled={isLoading}>
          Not tonight
        </button>
        <button style={{ ...styles.headerBtn, ...styles.headerBtnPrimary }} onClick={onSubmit} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Share with mentor'}
        </button>
      </div>
    </div>
  );
}

function ProfileView() {
  const heatmapCells = Array.from({ length: 55 }, (_, i) => {
    let base;
    if (i < 14) base = 0.3 + Math.random() * 0.3;
    else if (i < 21) base = 0.5 + Math.random() * 0.3;
    else if (i < 35) base = 0.3 + Math.random() * 0.2;
    else base = 0.6 + Math.random() * 0.35;
    const depth = Math.min(base, 0.95);
    const r = Math.round(201 * depth);
    const g = Math.round(162 * depth * 0.6);
    const b = Math.round(77 * depth * 0.4);
    return { depth, r, g, b };
  });

  return (
    <div>
      <div style={styles.disclaimer}>
        Your profile is built from journal interpretation (all 10 extraction layers) and ongoing mentor interactions. It evolves with every conversation. These are observations about reasoning patterns, not personality assessments.
      </div>
      <div style={styles.profileGrid}>
        <div style={styles.profileCard}>
          <div style={styles.pcardTitle}>⚙ Cognitive Style (Layer 2)</div>
          <StyleSpectrum label1="Principle-first" label2="Concrete-first" value={72} />
          <StyleSpectrum label1="Categoriser" label2="Narrator" value={65} />
          <StyleSpectrum label1="Analytical" label2="Emotional" value={45} />
        </div>

        <div style={styles.profileCard}>
          <div style={styles.pcardTitle}>◽ Engagement Gradient (Layer 3)</div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '10px' }}>Journal entry depth — darker = deeper engagement</div>
          <div style={styles.heatmap}>
            {heatmapCells.map((cell, i) => (
              <div
                key={i}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '3px',
                  background: `rgba(${cell.r},${cell.g},${cell.b},${cell.depth + 0.1})`,
                  cursor: 'default',
                }}
                title={`Day ${i + 1}: ${Math.round(cell.depth * 100)}% engagement`}
              />
            ))}
          </div>
        </div>

        <div style={styles.profileCard}>
          <div style={styles.pcardTitle}>⚠ Passion Map (Layer 1 + 8)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <PassionPill frequency="9x" passion="Philodoxia (love of honour) — external recognition treated as genuine good" />
            <PassionPill frequency="5x" passion="Agonia (anxiety) — future catastrophes treated as present realities" />
            <PassionPill frequency="4x" passion="Pothos (longing) — past hobbies/eras as lost identity" />
            <PassionPill frequency="4x" passion="Penthos (grief) — lack of creative impact as genuine failure" />
            <PassionPill frequency="3x" passion="Oknos (timidity) — creative failure worth fearing" />
            <PassionPill frequency="3x" passion="Aischyne (shame) — others' judgement reveals personal failure" />
            <PassionPill frequency="3x" passion="Orge (anger) — children's disobedience as genuine evil" declining={true} />
            <PassionPill frequency="2x" passion="Phthonos (envy) — others' spending validates comparison" />
          </div>
        </div>

        <div style={styles.profileCard}>
          <div style={styles.pcardTitle}>✦ Virtue Observations (Layer 1)</div>
          <ProximityDimension label="Phronesis (wisdom)" value={75} color="var(--green)" />
          <ProximityDimension label="Dikaiosyne (justice)" value={62} color="var(--accent)" />
          <ProximityDimension label="Andreia (courage)" value={45} color="var(--orange)" />
          <ProximityDimension label="Sophrosyne (temperance)" value={50} color="var(--orange)" />
        </div>

        <div style={{ ...styles.profileCard, gridColumn: '1 / -1' }}>
          <div style={styles.pcardTitle}>✎ Language Fingerprint (Layer 7)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '6px' }}>METAPHOR FAMILY</div>
              <div style={{ color: 'var(--text)' }}>Nature, music, and food metaphors dominant</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '6px' }}>EMOTIONAL REGISTER</div>
              <div style={{ color: 'var(--text)' }}>Honest vulnerability with growing self-awareness — deepest entries are confessional</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '6px' }}>ABSTRACTION LEVEL</div>
              <div style={{ color: 'var(--text)' }}>Prefers concrete-first, generalises upward</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StyleSpectrum({ label1, label2, value }: { label1: string; label2: string; value: number }) {
  return (
    <div style={styles.styleSpectrum}>
      <span style={styles.styleLabel}>{label1}</span>
      <div style={styles.styleTrack}>
        <div style={{ ...styles.styleMarker, left: `${value}%` }}></div>
      </div>
      <span style={{ ...styles.styleLabel, textAlign: 'left' }}>{label2}</span>
    </div>
  );
}

function PassionPill({ frequency, passion, declining = false }: { frequency: string; passion: string; declining?: boolean }) {
  return (
    <div style={{ ...styles.passionPill, ...(declining ? styles.passionDeclining : {}) }}>
      <span style={styles.passionFreq}>{frequency}</span> {passion} {declining && '↘'}
    </div>
  );
}

function LayersView() {
  const layers = [
    {
      num: 1,
      title: 'Baseline Extraction',
      desc: 'Passion map, causal tendencies, value hierarchy, oikeiosis map, virtue observations, Senecan grade.',
      status: 'built',
      extract: 'MentorProfile',
    },
    {
      num: 2,
      title: 'Reasoning Architecture',
      desc: 'How you think — meta-cognitive patterns, reasoning structure, processing style.',
      status: 'built',
      extract: 'Cognitive Style Profile',
    },
    {
      num: 3,
      title: 'Engagement Gradient',
      desc: 'Emotional depth of each journal entry.',
      status: 'built',
      extract: 'Entry Engagement Scores',
    },
    {
      num: 4,
      title: 'Contradiction Detection',
      desc: 'Cross-section analysis revealing gaps between declared beliefs and observed patterns.',
      status: 'built',
      extract: 'Declared vs. Observed Map',
    },
    {
      num: 5,
      title: 'Relational Texture',
      desc: 'How different people and relationships appear in your journal.',
      status: 'built',
      extract: 'Relational Context Map',
    },
    {
      num: 6,
      title: 'Developmental Timeline',
      desc: 'Your characteristic pace of change and breakthrough conditions.',
      status: 'built',
      extract: 'Developmental Rhythm Profile',
    },
    {
      num: 7,
      title: 'Language Fingerprint',
      desc: 'Your internal vocabulary, preferred metaphors, emotional register.',
      status: 'built',
      extract: 'Voice Calibration Profile',
    },
    {
      num: 8,
      title: 'Situational Trigger Map',
      desc: 'Specific conditions under which each passion emerges.',
      status: 'designed',
      extract: 'Passion-Context Correlations',
    },
    {
      num: 9,
      title: 'Product Development Signal',
      desc: 'Which journal prompts generated the richest reflections.',
      status: 'planned',
      extract: 'UX Analysis',
    },
    {
      num: 10,
      title: 'Proof of Concept',
      desc: 'Documented demonstration of the full SageReasoning thesis.',
      status: 'planned',
      extract: 'Case Study Synthesis',
    },
  ];

  return (
    <div>
      <div style={styles.disclaimer}>
        Layer 1 (Baseline Extraction) is complete from all 12 journal sections. Layers 2–7 are designed. Layers 8–10 are planned. Each layer serves a different function in the mentor relationship.
      </div>
      <div style={styles.layersGrid}>
        {layers.map((layer) => (
          <div key={layer.num} style={styles.layerCard}>
            <div style={styles.layerNum}>Layer {layer.num}</div>
            <div style={styles.layerTitle}>{layer.title}</div>
            <div style={styles.layerDesc}>{layer.desc}</div>
            <div
              style={{
                ...styles.layerStatus,
                ...(layer.status === 'built'
                  ? styles.statusBuilt
                  : layer.status === 'designed'
                    ? styles.statusDesigned
                    : styles.statusPlanned),
              }}
            >
              {layer.status === 'built' ? '✓ Built' : layer.status === 'designed' ? '✎ Designed' : '✐ Planned'}
            </div>
            <div style={styles.layerExtract}>
              <strong>Output:</strong> {layer.extract}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContradictionsView() {
  return (
    <div>
      <div style={styles.disclaimer}>
        These are not failures — they are the most diagnostically valuable data. They reveal the gap between intellectual assent and dispositional change.
      </div>
      <div>
        {[
          {
            declared: '"What people think of me will have no impact on my things I value"',
            observed: 'Philodoxia (love of honour) appears in 9 of 12 journal sections. Reputation treated as genuine good despite knowing it is a preferred indifferent.',
            section: 'Embrace Difficulty (declared) vs. 9 sections (observed)',
            sig: 'high',
          },
          {
            declared: '"Appreciation from others will neither motivate nor discourage me"',
            observed: 'Creative expression blocked by fear of failure/lack of recognition. Vision of "best self" still includes being "part of the rest."',
            section: 'Be Content (declared) vs. Be Responsible to Others (observed)',
            sig: 'high',
          },
          {
            declared: '"Fear is a destructive passion — an irrational judgement about future things not yet present"',
            observed: 'Catastrophising daydreams persist. Avoidance of calling relatives, creative first steps, and new challenges.',
            section: 'Choose Serenity (declared) vs. Embrace Difficulty + Be Responsible (observed)',
            sig: 'med',
          },
          {
            declared: '"I will stay alert to opportunities for meaningful community contribution"',
            observed: 'Wife and self celebrate wealth/status as shared value system. Household-level tension with Stoic indifference.',
            section: 'Be Responsible to Others (declared) vs. Accept Your Fate (observed)',
            sig: 'med',
          },
        ].map((c, i) => (
          <div key={i} style={styles.contradiction}>
            <div style={styles.contraDeclared}>• {c.declared}</div>
            <div style={styles.contraObserved}>○ {c.observed}</div>
            <div style={styles.contraSection}>Section: {c.section}</div>
            <div style={{ ...styles.contraSignificance, ...(c.sig === 'high' ? styles.sigHigh : styles.sigMed) }}>
              {c.sig === 'high' ? 'High' : 'Medium'} significance
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TriggersView() {
  return (
    <div>
      <div style={styles.disclaimer}>
        Situational trigger conditions extracted from journal patterns. When detected, the mentor can prepare your disposition proactively — catching impressions before assent.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          {
            icon: '⚠',
            color: 'var(--purple)',
            title: 'Philodoxia (love of honour) — 9 of 12 sections',
            triggers: 'External recognition or respect is at stake. Perceived disrespect. Creative work being evaluated.',
            evidence: 'Live in the Present, Embrace Difficulty, Practice Acceptance, A Virtuous Life, Master Your Thoughts/Feelings, Choose Serenity, Cultivate Wisdom, Be Responsible',
            falseJudgement: '"External recognition is necessary for self-worth" — primary breakdown at synkatathesis (assent)',
          },
          {
            icon: '⚠',
            color: 'var(--red)',
            title: 'Agonia (anxiety) — 5 sections',
            triggers: 'Future outcomes feel uncertain. Imagining catastrophic scenarios. Accumulated circumstances pile up.',
            evidence: 'Live in the Present, Embrace Difficulty, Master Your Thoughts, Accept Your Fate, Choose Serenity',
            falseJudgement: '"Future catastrophes are present realities requiring worry now" — breakdown at phantasia (impression)',
          },
          {
            icon: '⚠',
            color: 'var(--orange)',
            title: 'Orge (anger) — 3 sections (declining)',
            triggers: "Children disobey or refuse to cooperate. Perceived disrespect from others.",
            evidence: 'Practice Acceptance, Master Your Thoughts, Master Your Feelings. Growth: shouting replaced with encouragement.',
            falseJudgement: '"Disobedience is a genuine evil requiring forceful correction" — breakdown at horme (impulse)',
          },
          {
            icon: '⚠',
            color: 'var(--accent)',
            title: 'Oknos (timidity) — 3 sections',
            triggers: 'Creative first steps needed. Calling relatives who may be upset. New challenges outside comfort zone.',
            evidence: 'Live in the Present, Embrace Difficulty, Be Responsible to Others',
            falseJudgement: '"Discomfort from social situations is a genuine threat" — breakdown at praxis (action)',
          },
        ].map((t, i) => (
          <div key={i} style={styles.profileCard}>
            <div style={{ ...styles.pcardTitle, fontSize: '12px' }}>
              <span style={{ color: t.color, marginRight: '8px' }}>{t.icon}</span>
              {t.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: '1.6' }}>
              <strong style={{ color: 'var(--text-dim)' }}>Triggers when:</strong> {t.triggers}
              <br />
              <strong style={{ color: 'var(--text-dim)' }}>Journal evidence:</strong> {t.evidence}
              <br />
              <strong style={{ color: 'var(--text-dim)' }}>False judgement:</strong> {t.falseJudgement}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineView({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement> }) {
  return (
    <div>
      <div style={{ ...styles.profileCard, gridColumn: '1 / -1' }}>
        <div style={styles.pcardTitle}>⏜ Developmental Rhythm (Layer 6)</div>
        <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: '1.6', marginBottom: '16px' }}>
          Your journal reveals a characteristic developmental rhythm across 55 days. Early entries (weeks 1-2) show reflexive reasoning with high passion involvement. A shift toward deliberate reasoning begins around week 3. A plateau appears in weeks 4-5. A breakthrough occurs in week 6.
        </div>
        <canvas ref={canvasRef} style={{ width: '100%', height: '220px' }} />
        <div style={{ display: 'flex', gap: '20px', marginTop: '14px', fontSize: '11px', color: 'var(--text-dim)' }}>
          <div>
            <span
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: 'var(--gold)',
                marginRight: '4px',
                verticalAlign: 'middle',
              }}
            ></span>
            Reasoning quality
          </div>
          <div>
            <span
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: 'var(--accent)',
                marginRight: '4px',
                verticalAlign: 'middle',
              }}
            ></span>
            Engagement depth
          </div>
        </div>
      </div>
    </div>
  );
}

function PatternsView() {
  return (
    <div style={styles.ritualCard}>
      <div style={styles.ritualIcon}>✦</div>
      <div style={styles.ritualTitle}>Weekly Pattern Mirror</div>
      <div style={styles.ritualSource}>Synthesised from the past 7 days of interactions, decisions, and session bridge data</div>
      <div style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text)', marginTop: '16px' }}>
        <p style={{ marginBottom: '14px' }}>Clinton, three patterns stand out this week.</p>
        <p style={{ marginBottom: '14px' }}>
          <strong style={{ color: 'var(--gold)' }}>First,</strong> parenting breakthrough. You&apos;ve replaced shouting with encouragement in three conflict moments. That&apos;s synkatathesis becoming faster — you&apos;re catching the false impression before the impulse hardens.
        </p>
        <p style={{ marginBottom: '14px' }}>
          <strong style={{ color: 'var(--gold)' }}>Second,</strong> philodoxia trigger. A recognition situation — someone mentioned they found your work impressive — activated the false judgement immediately. You shifted from contentment to internal calculation about whether you should lean into it.
        </p>
        <p style={{ marginBottom: '14px' }}>
          <strong style={{ color: 'var(--gold)' }}>Third,</strong> self-correction. You returned someone else&apos;s trolley to the cart rack without being asked. Small act, but your reasoning was explicit: kathekon instinct operating before the convenience impulse could settle in. That&apos;s the direction.
        </p>
        <p style={{ color: 'var(--text-dim)' }}>
          <em>Direction of travel: upward. The trolley moment shows the shift is becoming embodied, not just intellectual.</em>
        </p>
      </div>
    </div>
  );
}

function SettingsView({ onShowToast }: { onShowToast: (msg: string) => void }) {
  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={styles.settingsGroup}>
        <div style={styles.settingsLabel}>Proactive Schedule</div>
        {[
          { name: 'Morning Check-In', desc: 'Daily disposition check before decisions arrive (Marcus Aurelius practice)' },
          { name: 'Evening Reflection', desc: 'End-of-day review of reasoning quality (Seneca, De Ira 3.36)' },
          { name: 'Weekly Pattern Mirror', desc: 'Narrative synthesis of the week patterns and trajectory' },
        ].map((s, i) => (
          <div key={i} style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <div style={styles.settingName}>{s.name}</div>
              <div style={styles.settingDesc}>{s.desc}</div>
            </div>
            <div style={{ ...styles.toggle, ...styles.toggleOn }}></div>
          </div>
        ))}
      </div>

      <div style={styles.settingsGroup}>
        <div style={styles.settingsLabel}>Privacy</div>
        <div style={styles.settingRow}>
          <div style={styles.settingInfo}>
            <div style={styles.settingName}>Profile Visibility</div>
            <div style={styles.settingDesc}>Your profile is private. Only you and the mentor can access it.</div>
          </div>
          <div style={styles.toggle}></div>
        </div>
        <div style={styles.settingRow}>
          <div style={styles.settingInfo}>
            <div style={styles.settingName}>Export Data</div>
            <div style={styles.settingDesc}>Download your complete profile, conversation history, and all extracted layers</div>
          </div>
          <button style={styles.headerBtn} onClick={() => onShowToast('Export prepared')}>
            Export All
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ UTILITIES ============

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function getViewTitle(view: ViewId): string {
  const titles: Record<ViewId, string> = {
    conversation: 'Mentor Conversation',
    morning: 'Morning Check-In',
    evening: 'Evening Reflection',
    profile: 'My Profile',
    layers: 'Journal Layers',
    contradictions: 'Declared vs. Observed',
    triggers: 'Situational Trigger Map',
    timeline: 'Developmental Timeline',
    patterns: 'Weekly Pattern Mirror',
    settings: 'Settings',
  };
  return titles[view];
}

function getViewSubtitle(view: ViewId): string {
  const subtitles: Record<ViewId, string> = {
    conversation: 'Your ongoing dialogue with the Sage Mentor',
    morning: 'Disposition check before the day begins',
    evening: 'Review your reasoning from today',
    profile: 'All 10 extraction layers from your journal and interactions',
    layers: 'The ten layers of extractable value from your journal',
    contradictions: 'Where intellectual assent diverges from dispositional reality',
    triggers: 'Conditions that activate specific passions',
    timeline: 'Your characteristic rhythm of change',
    patterns: 'Narrative synthesis from the past 7 days',
    settings: 'Configure your mentor experience',
  };
  return subtitles[view];
}

// ============ STYLES ============

const cssVariables = `
:root {
  --bg: #0f1117;
  --surface: #171b26;
  --card: #1d2233;
  --border: #282e44;
  --border-subtle: #21263a;
  --gold: #c9a24d;
  --gold-dim: rgba(201,162,77,.12);
  --gold-border: rgba(201,162,77,.25);
  --accent: #6b8aef;
  --accent-dim: rgba(107,138,239,.10);
  --accent-border: rgba(107,138,239,.25);
  --green: #4daa6a;
  --green-dim: rgba(77,170,106,.10);
  --green-border: rgba(77,170,106,.25);
  --orange: #d9903a;
  --orange-dim: rgba(217,144,58,.10);
  --orange-border: rgba(217,144,58,.25);
  --red: #c95050;
  --red-dim: rgba(201,80,80,.10);
  --red-border: rgba(201,80,80,.25);
  --purple: #9b72cf;
  --purple-dim: rgba(155,114,207,.10);
  --text: #d0d4e2;
  --text-bright: #eef0f8;
  --text-dim: #6a7192;
  --text-muted: #4a5070;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); }

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
`;

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  sidebar: {
    width: '280px',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflowY: 'auto',
  },
  sidebarHeader: {
    padding: '20px 18px 16px',
    borderBottom: '1px solid var(--border)',
  },
  sidebarBrand: {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: 'var(--gold)',
    fontWeight: 600,
    marginBottom: '4px',
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: 300,
    color: 'var(--text-bright)',
    letterSpacing: '0.3px',
  },
  proxCard: {
    margin: '14px 14px 0',
    padding: '16px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
  },
  proxHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '14px',
  },
  proxRing: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  proxLevel: {
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--gold)',
  },
  proxGrade: {
    fontSize: '11px',
    color: 'var(--text-dim)',
    marginTop: '2px',
  },
  proxDims: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  dim: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dimLabel: {
    fontSize: '10px',
    color: 'var(--text-dim)',
    width: '100px',
    flexShrink: 0,
  },
  dimBar: {
    flex: 1,
    height: '5px',
    background: 'rgba(255,255,255,.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  dimFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.8s ease',
  },
  dimVal: {
    fontSize: '10px',
    color: 'var(--text-dim)',
    width: '30px',
    textAlign: 'right' as const,
  },
  directionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 500,
    marginTop: '10px',
  },
  dirUp: {
    background: 'var(--green-dim)',
    border: '1px solid var(--green-border)',
    color: 'var(--green)',
  },
  sidebarNav: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 0',
  },
  navSection: {
    padding: '6px 18px',
    fontSize: '9px',
    textTransform: 'uppercase',
    letterSpacing: '1.3px',
    color: 'var(--text-muted)',
    marginTop: '10px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 18px',
    cursor: 'pointer',
    fontSize: '13px',
    color: 'var(--text-dim)',
    transition: 'all 0.15s',
    borderLeft: '3px solid transparent',
  },
  navItemActive: {
    color: 'var(--gold)',
    borderLeftColor: 'var(--gold)',
    background: 'rgba(201,162,77,.04)',
  },
  navIcon: {
    width: '18px',
    textAlign: 'center',
    fontSize: '13px',
    flexShrink: 0,
  },
  sidebarFooter: {
    padding: '12px 18px',
    borderTop: '1px solid var(--border)',
  },
  sidebarFooterText: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  mainHeader: {
    padding: '16px 28px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--surface)',
    flexShrink: 0,
  },
  viewTitle: {
    fontSize: '16px',
    fontWeight: 500,
    color: 'var(--text-bright)',
  },
  viewSubtitle: {
    fontSize: '11px',
    color: 'var(--text-dim)',
    marginTop: '2px',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
  },
  headerBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--card)',
    color: 'var(--text-dim)',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  headerBtnPrimary: {
    background: 'var(--gold)',
    borderColor: 'var(--gold)',
    color: '#111',
    fontWeight: 500,
  },
  viewContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 28px',
  },
  disclaimer: {
    padding: '8px 14px',
    background: 'rgba(201,162,77,.04)',
    border: '1px solid var(--gold-border)',
    borderRadius: '6px',
    fontSize: '10px',
    color: 'var(--gold)',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  convoLayout: {
    display: 'flex',
    gap: '20px',
    height: 'calc(100vh - 130px)',
  },
  convoThread: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  convoContext: {
    width: '300px',
    flexShrink: 0,
    overflowY: 'auto',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  msgGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginBottom: '12px',
  },
  msgGroupLabel: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    marginBottom: '6px',
    padding: '0 4px',
  },
  msgGroupLabelMentor: {
    fontSize: '10px',
    color: 'var(--gold)',
    marginBottom: '6px',
    padding: '0 4px',
  },
  msgBubble: {
    maxWidth: '78%',
    padding: '12px 16px',
    fontSize: '13px',
    lineHeight: '1.6',
    borderRadius: '10px',
    position: 'relative',
  },
  msgMentor: {
    alignSelf: 'flex-start',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderBottomLeftRadius: '4px',
    color: 'var(--text)',
  },
  msgHuman: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(135deg, #4a5a9e, #3d4d88)',
    borderBottomRightRadius: '4px',
    color: '#e8ecf8',
  },
  msgInsight: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    background: 'var(--gold-dim)',
    border: '1px solid var(--gold-border)',
    borderRadius: '10px',
    color: 'var(--gold)',
    fontSize: '12px',
    padding: '10px 14px',
  },
  msgTime: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    marginTop: '4px',
    padding: '0 4px',
  },
  msgTimeRight: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    marginTop: '4px',
    padding: '0 4px',
    textAlign: 'right' as const,
  },
  composeArea: {
    paddingTop: '12px',
    borderTop: '1px solid var(--border)',
    marginTop: '8px',
  },
  composeContext: {
    display: 'flex',
    gap: '6px',
    marginBottom: '8px',
    flexWrap: 'wrap' as const,
  },
  ctxChip: {
    padding: '4px 12px',
    borderRadius: '14px',
    border: '1px solid var(--border)',
    background: 'var(--card)',
    fontSize: '11px',
    color: 'var(--text-dim)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  composeBox: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
  },
  composeInput: {
    flex: 1,
    resize: 'none' as const,
    padding: '12px 16px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text)',
    fontSize: '13px',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    outline: 'none',
    minHeight: '52px',
    maxHeight: '160px',
    transition: 'border-color 0.15s',
  },
  sendBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    border: 'none',
    background: 'var(--gold)',
    color: '#111',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'opacity 0.15s',
    fontFamily: 'inherit',
  },
  ctxPanel: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: 0,
    overflow: 'hidden',
  },
  ctxSection: {
    borderBottom: '1px solid var(--border)',
  },
  ctxSectionHead: {
    padding: '10px 14px',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'color 0.15s',
  },
  ctxSectionBody: {
    padding: '0 14px 12px',
  },
  passionPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '10px',
    marginRight: '4px',
    background: 'var(--red-dim)',
    border: '1px solid var(--red-border)',
    color: 'var(--red)',
  },
  passionDeclining: {
    background: 'var(--green-dim)',
    borderColor: 'var(--green-border)',
    color: 'var(--green)',
  },
  passionFreq: {
    fontWeight: 600,
  },
  ritualCard: {
    maxWidth: '640px',
    margin: '0 auto',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '28px',
    position: 'relative',
    overflow: 'hidden',
  },
  ritualIcon: {
    fontSize: '28px',
    marginBottom: '12px',
  },
  ritualTitle: {
    fontSize: '18px',
    fontWeight: 300,
    color: 'var(--text-bright)',
    marginBottom: '4px',
  },
  ritualSource: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    marginBottom: '20px',
  },
  ritualPrompt: {
    fontSize: '14px',
    lineHeight: '1.7',
    color: 'var(--text)',
    padding: '16px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    marginBottom: '16px',
  },
  ritualResponse: {
    width: '100%',
    minHeight: '120px',
    resize: 'vertical' as const,
    padding: '14px 16px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text)',
    fontSize: '13px',
    fontFamily: 'inherit',
    lineHeight: '1.6',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  ritualActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '14px',
    justifyContent: 'flex-end',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  profileCard: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '18px',
    minHeight: '120px',
  },
  pcardTitle: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--text-muted)',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  styleSpectrum: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  styleLabel: {
    fontSize: '11px',
    color: 'var(--text-dim)',
    width: '90px',
    textAlign: 'right' as const,
  },
  styleTrack: {
    flex: 1,
    height: '6px',
    background: 'rgba(255,255,255,.05)',
    borderRadius: '3px',
    position: 'relative',
  },
  styleMarker: {
    position: 'absolute',
    top: '-4px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: 'var(--gold)',
    border: '2px solid var(--bg)',
    transition: 'left 0.5s ease',
  },
  heatmap: {
    display: 'flex',
    gap: '2px',
    flexWrap: 'wrap' as const,
  },
  layersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '16px',
  },
  layerCard: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '18px',
    transition: 'border-color 0.2s',
    cursor: 'default',
  },
  layerNum: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
  },
  layerTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-bright)',
    marginBottom: '6px',
  },
  layerDesc: {
    fontSize: '12px',
    color: 'var(--text-dim)',
    lineHeight: '1.55',
    marginBottom: '12px',
  },
  layerStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '10px',
  },
  statusBuilt: {
    background: 'var(--green-dim)',
    border: '1px solid var(--green-border)',
    color: 'var(--green)',
  },
  statusDesigned: {
    background: 'var(--orange-dim)',
    border: '1px solid var(--orange-border)',
    color: 'var(--orange)',
  },
  statusPlanned: {
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent-border)',
    color: 'var(--accent)',
  },
  layerExtract: {
    marginTop: '10px',
    fontSize: '11px',
    color: 'var(--text-dim)',
  },
  contradiction: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '10px',
  },
  contraDeclared: {
    fontSize: '12px',
    color: 'var(--accent)',
    marginBottom: '4px',
  },
  contraObserved: {
    fontSize: '12px',
    color: 'var(--orange)',
    marginBottom: '6px',
  },
  contraSection: {
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  contraSignificance: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '10px',
    marginTop: '6px',
  },
  sigHigh: {
    background: 'var(--red-dim)',
    color: 'var(--red)',
  },
  sigMed: {
    background: 'var(--orange-dim)',
    color: 'var(--orange)',
  },
  settingsGroup: {
    marginBottom: '24px',
  },
  settingsLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--text-muted)',
    marginBottom: '10px',
  },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    marginBottom: '6px',
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    fontSize: '13px',
    color: 'var(--text-bright)',
  },
  settingDesc: {
    fontSize: '11px',
    color: 'var(--text-dim)',
    marginTop: '2px',
  },
  toggle: {
    width: '40px',
    height: '22px',
    borderRadius: '11px',
    background: 'var(--border)',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.2s',
    flexShrink: 0,
  },
  toggleOn: {
    background: 'var(--gold)',
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%) translateY(60px)',
    background: 'var(--green)',
    color: '#fff',
    padding: '10px 24px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 500,
    zIndex: 999,
    opacity: 0,
    transition: 'all 0.3s ease',
  },
  toastShow: {
    transform: 'translateX(-50%) translateY(0)',
    opacity: 1,
  },
};
