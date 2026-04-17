'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Contact {
  name: string;
  email: string;
  role: string;
}

interface Message {
  text: string;
  cat: string;
  dir: 'sent' | 'recv';
  time: string;
  date: string;
}

interface OpinionItem {
  color: string;
  text: string;
  time: string;
}

export default function MentorHub() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);

  // State
  const [contacts, setContacts] = useState<Record<string, Contact>>({
    founder: { name: 'Clinton Aitkenhead', email: 'clintonaitkenhead@hotmail.com', role: 'Founder' },
    mentor: { name: 'Sage Mentor Agent', email: '', role: 'Mentor' },
    support: { name: 'Sage Support Agent', email: 'support@sagereasoning.com', role: 'Support Agent' },
  });

  const [activeContact, setActiveContact] = useState('mentor');
  const [selectedCategory, setSelectedCategory] = useState('question');
  const [sessionMode, setSessionMode] = useState('companion');
  const [threads, setThreads] = useState<Record<string, Message[]>>({
    founder: [],
    mentor: [],
    support: [],
  });
  const [composeText, setComposeText] = useState('');
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [opinions, setOpinions] = useState<OpinionItem[]>([
    { color: 'blue', text: 'Journal analysis: Philodoxia (love of honour) detected in 9 of 12 sections — primary passion. False judgement: external recognition = self-worth.', time: 'Now' },
    { color: 'gold', text: 'Causal tendency: primary breakdown at synkatathesis (assent). Treats preferred indifferents as genuine goods, especially reputation and creative recognition.', time: 'Now' },
    { color: 'green', text: 'Growth evidence: parenting approach shifted from shouting to encouragement. Doom scrolling replaced with intentional learning. Shame giving way to fulfilment.', time: 'Now' },
  ]);
  const [proximityData, setProximityData] = useState({
    level: 'Deliberate',
    subLabel: 'Proficiens medius — can articulate principles but gap between knowing and applying under pressure',
    passion: 42,
    judgement: 72,
    disposition: 48,
    oikeiosis: 58,
  });
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  // Date/Time helpers
  const getDate = () => new Date().toLocaleDateString('en-AU');
  const getTime = () => new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  const getFullDate = () => new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Toast
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  };

  // Contact management
  const updateContact = (key: string, name: string, email: string) => {
    setContacts((prev) => ({
      ...prev,
      [key]: { ...prev[key], name, email },
    }));
    setEditingContact(null);
    showToast('Contact updated');
  };

  const toggleEdit = (key: string) => {
    if (editingContact === key) {
      setEditingContact(null);
    } else {
      setEditingContact(key);
      setEditName(contacts[key].name);
      setEditEmail(contacts[key].email);
    }
  };

  const saveEdit = (key: string) => {
    if (editName.trim()) {
      updateContact(key, editName, editEmail);
    }
  };

  // Message handling
  const sendMessage = async () => {
    const text = composeText.trim();
    if (!text) return;

    // Add user message
    const now = getTime();
    const today = getDate();
    const newMsg: Message = { text, cat: selectedCategory, dir: 'sent', time: now, date: today };
    setThreads((prev) => ({
      ...prev,
      [activeContact]: [...prev[activeContact], newMsg],
    }));
    setComposeText('');

    setLoading(true);

    try {
      // Call /api/reason
      const res = await fetch('/api/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text, depth: 'standard', category: selectedCategory }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const reasoning = data.result || data.response || 'I acknowledge your message.';

      // Add mentor response
      const resMsg: Message = {
        text: reasoning,
        cat: selectedCategory,
        dir: 'recv',
        time: getTime(),
        date: getDate(),
      };
      setThreads((prev) => ({
        ...prev,
        [activeContact]: [...prev[activeContact], resMsg],
      }));

      // If in companion mode, score the conversation
      if (sessionMode === 'companion') {
        const fullThread = [...threads[activeContact], newMsg, resMsg];
        const threadText = fullThread.map((m) => `${m.dir === 'sent' ? 'You' : contacts[activeContact].name}: ${m.text}`).join('\n');

        const scoreRes = await fetch('/api/score-conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: threadText }),
        });

        if (scoreRes.ok) {
          const scoreData = await scoreRes.json();
          const analysis = scoreData.result || scoreData.response || 'Strategic decision pattern identified.';
          setOpinions((prev) => [
            ...prev,
            { color: 'blue', text: analysis, time: getTime() },
          ]);
        }
      }

      // Update proximity
      const proxRes = await fetch('/api/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text, depth: 'quick' }),
      });

      if (proxRes.ok) {
        const _proxData = await proxRes.json();
        // Mock update of proximity based on response
        setProximityData((prev) => ({
          ...prev,
          passion: Math.min(100, prev.passion + 2),
          judgement: Math.min(100, prev.judgement + 1),
        }));
      }
    } catch (err) {
      console.error('Error:', err);
      // Fallback mentor response
      const fallbackMsg: Message = {
        text: 'I have received your message and am processing your request thoughtfully.',
        cat: selectedCategory,
        dir: 'recv',
        time: getTime(),
        date: getDate(),
      };
      setThreads((prev) => ({
        ...prev,
        [activeContact]: [...prev[activeContact], fallbackMsg],
      }));
    } finally {
      setLoading(false);
    }
  };

  const switchContact = (key: string) => {
    setActiveContact(key);
  };

  const exportThread = () => {
    const msgs = threads[activeContact];
    if (!msgs.length) {
      showToast('No messages');
      return;
    }

    let text = `SageReasoning Mentor Hub — Thread with ${contacts[activeContact].name}\nExported: ${new Date().toLocaleString('en-AU')}\n${'='.repeat(50)}\n\n`;
    for (const m of msgs) {
      text += `[${m.date} ${m.time}] [${m.cat.toUpperCase()}] ${m.dir === 'sent' ? contacts.founder.name : contacts[activeContact].name}:\n${m.text}\n\n`;
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sage-thread-${activeContact}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    showToast('Exported');
  };

  const clearThread = () => {
    if (threads[activeContact].length && !confirm('Start new thread?')) return;
    setThreads((prev) => ({ ...prev, [activeContact]: [] }));
    showToast('New thread');
  };

  // Draw journey chart
  useEffect(() => {
    if (!canvasRef1.current) return;

    const cv = canvasRef1.current;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const W = (cv.width = cv.offsetWidth * 2);
    const H = (cv.height = 400);
    const levels = ['Reflexive', 'Habitual', 'Deliberate', 'Principled', 'Sage-like'];
    const lvlColors = ['#d9534f', '#e8953a', '#d4a853', '#4caf6a', '#6c8cff'];
    const padL = 76,
      padR = 16,
      padT = 16,
      padB = 28;
    const pW = W - padL - padR,
      pH = H - padT - padB;

    // Clear
    ctx.fillStyle = '#0d0f18';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.textAlign = 'right';
    ctx.font = '16px system-ui';
    for (let i = 0; i < 5; i++) {
      const y = padT + pH - (i / 4) * pH;
      ctx.strokeStyle = 'rgba(255,255,255,.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      ctx.fillStyle = lvlColors[i];
      ctx.fillText(levels[i], padL - 6, y + 5);
    }

    // Time labels
    const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun'];
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6e7794';
    for (let i = 0; i < months.length; i++)
      ctx.fillText(months[i], padL + (i / (months.length - 1)) * pW, H - 4);

    // Agent data lines
    const agents = [
      { color: '#d4a853', width: 3, data: [1.0, 1.3, 1.7, 2.0, 2.4] },
      { color: '#6c8cff', width: 3, data: [null, null, 1.5, 1.8, 2.1] },
      { color: '#4caf6a', width: 2, data: [null, null, null, 1.0, 1.2] },
      { color: '#a374db', width: 1.5, data: [null, null, null, null, null] },
      { color: '#4db6ac', width: 1.5, data: [null, null, null, null, null] },
    ];

    for (const ag of agents) {
      const pts = ag.data
        .map((v, i) => (v !== null ? { x: padL + (i / (ag.data.length - 1)) * pW, y: padT + pH - (v / 4) * pH } : null))
        .filter(Boolean) as Array<{ x: number; y: number }>;

      if (pts.length < 2) continue;

      // Line
      ctx.beginPath();
      ctx.strokeStyle = ag.color;
      ctx.lineWidth = ag.width;
      ctx.lineJoin = 'round';
      pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();

      // Gradient fill
      const grad = ctx.createLinearGradient(0, padT, 0, H);
      grad.addColorStop(0, ag.color + '30');
      grad.addColorStop(1, ag.color + '00');
      ctx.lineTo(pts[pts.length - 1].x, padT + pH);
      ctx.lineTo(pts[0].x, padT + pH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Dots
      pts.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, i === pts.length - 1 ? 6 : 3, 0, Math.PI * 2);
        ctx.fillStyle = ag.color;
        ctx.fill();
        if (i === pts.length - 1) {
          ctx.strokeStyle = ag.color + '60';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    }

    // Baseline marker for Cowork agent
    const bx = padL + (2 / 4) * pW,
      by = padT + pH - (1.5 / 4) * pH;
    ctx.font = '12px system-ui';
    ctx.fillStyle = '#6c8cff';
    ctx.textAlign = 'left';
    ctx.fillText('Project baseline', bx + 14, by - 4);
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#6c8cff40';
    ctx.lineWidth = 1;
    ctx.moveTo(bx, padT);
    ctx.lineTo(bx, padT + pH);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  // Draw milestones chart
  useEffect(() => {
    if (!canvasRef2.current) return;

    const cv = canvasRef2.current;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const W = (cv.width = cv.offsetWidth * 2);
    const H = (cv.height = 340);
    const ms = [
      { name: 'Personal Baseline', pct: 100, color: '#4caf6a' },
      { name: 'Journal Analysis', pct: 100, color: '#4caf6a' },
      { name: 'Mentor Profile', pct: 100, color: '#4caf6a' },
      { name: 'Cowork Baseline', pct: 0, color: '#e8953a' },
      { name: 'Support Progression', pct: 60, color: '#6c8cff' },
      { name: 'Agent Development', pct: 35, color: '#e8953a' },
      { name: 'Accreditation Path', pct: 10, color: '#d4a853' },
    ];
    const padL = 110,
      padR = 44,
      padT = 8,
      _padB = 8,
      barH = 24,
      gap = 14;

    // Clear
    ctx.fillStyle = '#0d0f18';
    ctx.fillRect(0, 0, W, H);

    ctx.font = '16px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i < ms.length; i++) {
      const y = padT + i * (barH + gap);
      const maxW = W - padL - padR;
      ctx.fillStyle = '#d8dce8';
      ctx.fillText(ms[i].name, padL - 10, y + barH / 2 + 5);
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      ctx.beginPath();
      ctx.roundRect(padL, y, maxW, barH, 5);
      ctx.fill();
      const fw = (ms[i].pct / 100) * maxW;
      if (fw > 0) {
        ctx.fillStyle = ms[i].color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.roundRect(padL, y, fw, barH, 5);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = '#d8dce8';
      ctx.textAlign = 'left';
      ctx.fillText(ms[i].pct + '%', padL + fw + 6, y + barH / 2 + 5);
      ctx.textAlign = 'right';
    }
  }, []);

  const messages = threads[activeContact];

  return (
    <div style={styles.wrapper}>
      <style>{CSS_VARIABLES}</style>

      {/* TOP BAR */}
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <h1 style={styles.title}>
            SageReasoning <span style={styles.titleSub}>Mentor Hub</span>
          </h1>
        </div>
        <div style={styles.topbarRight}>
          <div style={styles.pillar}>
            <span style={{ ...styles.dot, background: '#4caf6a' }}></span>
            Personal & Agent Development
          </div>
          {sessionMode === 'companion' && (
            <div style={styles.pillar}>
              <span style={{ ...styles.dot, background: '#6c8cff', animation: 'pulse 2s infinite' }}></span>
              Companion Mode
            </div>
          )}
          <span style={styles.dateLabel}>{getFullDate()}</span>
        </div>
      </div>

      {/* LAYOUT */}
      <div style={styles.layout}>
        {/* LEFT PANEL */}
        <div style={styles.leftPanel}>
          {/* Contacts */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Contacts</div>
            {['founder', 'mentor', 'support'].map((key) => (
              <div
                key={key}
                onClick={() => switchContact(key)}
                style={{
                  ...styles.contact,
                  ...(activeContact === key ? { borderColor: 'var(--accent)', background: 'rgba(108,140,255,.06)' } : {}),
                }}
              >
                <div style={styles.contactRole}>{contacts[key].role}</div>
                <div style={styles.contactName}>{contacts[key].name}</div>
                <div style={styles.contactEmail}>{contacts[key].email || 'Click Edit to assign'}</div>
                <button
                  style={styles.editBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEdit(key);
                  }}
                >
                  Edit
                </button>

                {editingContact === key && (
                  <div style={styles.editForm}>
                    <input
                      type="text"
                      placeholder="Name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={styles.editInput}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      style={styles.editInput}
                    />
                    <div style={styles.editBtns}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEdit(key);
                        }}
                        style={styles.editBtn2}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEdit(key);
                        }}
                        style={{ ...styles.editBtn2, background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Navigation</div>
            <a
              style={styles.navLink}
              onClick={() => showToast('Private Mentor Hub — Open in separate window')}
            >
              <span style={styles.navIcon}>🔗</span> Private Mentor Hub
            </a>
            <a
              style={styles.navLink}
              onClick={() => showToast('Sage Ops Hub — Operations & Support tracking')}
            >
              <span style={styles.navIcon}>🔗</span> Sage Ops Hub
            </a>
          </div>

          {/* Development Focus */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Development Focus</div>
            <div style={styles.devCard}>
              <div style={styles.devCardTitle}>Journal Interpretation</div>
              <div style={styles.devCardStat}>
                <span>Layers completed</span>
                <span>1 of 10</span>
              </div>
              <div style={styles.devProgressBar}>
                <div style={{ ...styles.devProgressFill, width: '10%' }}></div>
              </div>
            </div>
            <div style={styles.devCard}>
              <div style={styles.devCardTitle}>Progression Pathways</div>
              <div style={styles.devCardStat}>
                <span>Active pathways</span>
                <span>4 of 7</span>
              </div>
              <div style={{ fontSize: '9px', color: 'var(--dim)', marginTop: '4px' }}>
                Reflexive, Habitual, Deliberate, Principled
              </div>
            </div>
            <div style={styles.devCard}>
              <div style={styles.devCardTitle}>Profile Freshness</div>
              <div style={styles.devCardStat}>
                <span>Last updated</span>
                <span>Today</span>
              </div>
              <div style={{ fontSize: '9px', color: 'var(--green)', marginTop: '4px' }}>✓ Current</div>
            </div>
          </div>

          {/* Conversations */}
          <div style={{ ...styles.section, borderBottom: 'none' }}>
            <div style={styles.sectionTitle}>Conversations</div>
            <div id="threadList">
              {messages.length > 0 ? (
                <div style={styles.contact}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--bright)' }}>
                      {contacts[activeContact].name}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--dim)' }}>{messages[messages.length - 1].time}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--dim)', marginTop: '1px' }}>
                    {messages[messages.length - 1].text.substring(0, 35)}
                    {messages[messages.length - 1].text.length > 35 ? '...' : ''}
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--dim)' }}>No conversations yet</span>
              )}
            </div>
          </div>
        </div>

        {/* CENTER: CHAT */}
        <div style={styles.centerPanel}>
          <div style={styles.chatHead}>
            <div style={styles.chatHeadLeft}>
              <div>
                <div style={styles.chatName}>{contacts[activeContact].name}</div>
                <div style={styles.chatRole}>{contacts[activeContact].role}</div>
              </div>
            </div>
            <div style={styles.chatBtns}>
              <button style={styles.chatBtn} onClick={exportThread}>
                Export
              </button>
              <button style={styles.chatBtn} onClick={clearThread}>
                New Thread
              </button>
            </div>
          </div>

          <div style={styles.chatMsgs}>
            {messages.length === 0 ? (
              <div style={styles.msgSys}>
                Welcome to the Mentor Hub. This space supports your personal development and agent progression through Stoic reasoning frameworks. Select a contact and start a conversation.
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i}>
                  {i === 0 || messages[i - 1].date !== msg.date ? (
                    <div style={{ ...styles.msgSys, fontSize: '10px', padding: '5px 12px' }}>
                      {msg.date}
                    </div>
                  ) : null}
                  <div style={{ ...styles.msg, ...(msg.dir === 'sent' ? styles.msgSent : styles.msgRecv) }}>
                    <div style={styles['msg-cat-' + msg.cat]}>
                      {msg.cat}
                    </div>
                    <div>{msg.text}</div>
                    <div style={styles.msgTime}>{msg.time}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={msgEndRef} />
          </div>

          {/* Compose */}
          <div style={styles.compose}>
            <div style={styles.composeCats}>
              {['question', 'update', 'escalation', 'feedback'].map((cat) => (
                <span
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    ...styles.composeCat,
                    ...(selectedCategory === cat ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(108,140,255,.08)' } : {}),
                  }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
              ))}
            </div>
            <div style={styles.composeRow}>
              <textarea
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Reference your October-December 2025 journal, or ask about your Deliberate development..."
                style={styles.composeTextarea}
              />
              <button style={styles.sendBtn} onClick={sendMessage} disabled={loading}>
                {loading ? '…' : '➤'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: DEVELOPMENT PANEL */}
        <div style={styles.rightPanel}>
          {/* Session Mode */}
          <div style={styles.modeBar}>
            {['observer', 'companion', 'consultant'].map((mode) => (
              <button
                key={mode}
                onClick={() => setSessionMode(mode)}
                style={{
                  ...styles.modeBtn,
                  ...(sessionMode === mode ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(108,140,255,.1)' } : {}),
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Opinion Feed */}
          {sessionMode === 'companion' && (
            <div style={styles.opinionFeed}>
              <div style={styles.opinionHeader}>Live Mentor Observations</div>
              <div style={styles.opinionDisclaimer}>Stoic reasoning frameworks for personal development. Observations reflect philosophical evaluation only.</div>
              <div>
                {opinions.map((opinion, i) => (
                  <div key={i} style={styles.opinionItem}>
                    <span style={{ ...styles.opinionDot, background: getOpinionColor(opinion.color) }}></span>
                    <span style={styles.opinionText}>{opinion.text}</span>
                    <span style={styles.opinionTime}>{opinion.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Proximity */}
          <div style={styles.gcard}>
            <h4 style={styles.gcardTitle}>Current Proximity — Founder (Personal)</h4>
            <div style={styles.proxBadge}>
              <div style={{ ...styles.proxDotBig, background: '#d4a853' }}>D</div>
              <div>
                <div style={styles.proxLbl}>{proximityData.level}</div>
                <div style={styles.proxSub}>{proximityData.subLabel}</div>
              </div>
            </div>

            {[
              { label: 'Passion Reduction', val: proximityData.passion, color: 'var(--accent)' },
              { label: 'Judgement Quality', val: proximityData.judgement, color: 'var(--green)' },
              { label: 'Disposition Stability', val: proximityData.disposition, color: 'var(--orange)' },
              { label: 'Oikeiosis Extension', val: proximityData.oikeiosis, color: 'var(--gold)' },
            ].map((dim, i) => (
              <div key={i} style={styles.dimRow}>
                <span style={styles.dimLbl}>{dim.label}</span>
                <div style={styles.dimTrack}>
                  <div style={{ ...styles.dimFill, width: `${dim.val}%`, background: dim.color }}></div>
                </div>
                <span style={styles.dimVal}>{dim.val}%</span>
              </div>
            ))}

            <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--dim)' }}>
              Direction: <span style={{ color: 'var(--green)' }}>▲ Improving</span>
            </div>
          </div>

          {/* Agent Development */}
          <div style={{ padding: '10px 10px 0 10px', borderBottom: '1px solid var(--border)' }}>
            <h4 style={styles.gcardTitle}>Agent Development</h4>

            {[
              { name: 'Founder (Personal)', color: '#d4a853', proximity: 'Deliberate (Proficiens Medius)', authority: 'Self-Directed', strongest: 'Wisdom — strong post-hoc analysis', weakest: 'Real-time Courage under pressure', stats: ['Journal: October-December 2025', 'Sections: 12 · Entries: 119'], progress: 42 },
              { name: 'Claude Cowork (Project)', color: '#6c8cff', proximity: 'Pending Baseline', authority: 'Supervised • Needs: Baseline check', pathway: 'Reflexive → Habitual: sage-examine, sage-distinguish', stats: ['Actions: 0', 'Progress: 0%'], progress: 0 },
              { name: 'Support Agent', color: '#4caf6a', proximity: 'Habitual', authority: 'Supervised • Check rate: 100%', pathway: 'Habitual → Deliberate: sage-evaluate, sage-critique', stats: ['Actions: 12', 'Promotion: 8 needed'], progress: 60 },
            ].map((agent, i) => (
              <div key={i} style={styles.agentDevCard}>
                <div style={styles.agentDevHead}>
                  <span style={{ ...styles.agentColor, background: agent.color }}></span>
                  <span style={styles.agentName}>{agent.name}</span>
                </div>
                <div style={styles.agentProxBadge}>Stage: {agent.proximity}</div>
                <div style={styles.agentAuthority}>{agent.authority}</div>
                {agent.pathway ? (
                  <div style={styles.agentDevPathway}>{agent.pathway}</div>
                ) : (
                  <>
                    <div style={{ fontSize: '9px', color: 'var(--green)', marginTop: '4px' }}>Strongest: {agent.strongest}</div>
                    <div style={{ fontSize: '9px', color: 'var(--orange)', marginTop: '2px' }}>Weakest: {agent.weakest}</div>
                  </>
                )}
                <div style={styles.agentDevStat}>
                  <span>{agent.stats[0]}</span>
                  <span>{agent.stats[1]}</span>
                </div>
                {agent.progress > 0 && (
                  <div style={styles.agentProgressBar}>
                    <div style={{ ...styles.agentProgressFill, width: `${agent.progress}%` }}></div>
                  </div>
                )}
              </div>
            ))}

            {[{ name: 'Content Agent', color: '#a374db' }, { name: 'Research Agent', color: '#4db6ac' }].map((agent, i) => (
              <div key={i} style={{ ...styles.agentDevCard, opacity: 0.5 }}>
                <div style={styles.agentDevHead}>
                  <span style={{ ...styles.agentColor, background: agent.color }}></span>
                  <span style={styles.agentName}>{agent.name}</span>
                </div>
                <div style={styles.agentAuthority}>Status: Not yet registered</div>
              </div>
            ))}
          </div>

          {/* Journey Graph */}
          <div style={styles.gcard}>
            <h4 style={styles.gcardTitle}>Proximity Journey — All Agents</h4>
            <canvas ref={canvasRef1} style={{ width: '100%' }} />
            <div style={styles.legend}>
              {[
                { label: 'Founder', color: '#d4a853' },
                { label: 'Cowork', color: '#6c8cff' },
                { label: 'Support', color: '#4caf6a' },
                { label: 'Content', color: '#a374db' },
                { label: 'Research', color: '#4db6ac' },
              ].map((item, i) => (
                <span key={i} style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, background: item.color }}></span>
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div style={styles.gcard}>
            <h4 style={styles.gcardTitle}>Development Milestones</h4>
            <canvas ref={canvasRef2} style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* TOAST */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: toastVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(70px)',
          background: '#4caf6a',
          color: '#fff',
          padding: '8px 20px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          zIndex: 300,
          opacity: toastVisible ? 1 : 0,
          transition: 'all 0.3s ease',
          pointerEvents: toastVisible ? 'auto' : 'none',
        }}
      >
        {toastMsg}
      </div>
    </div>
  );
}

function getOpinionColor(color: string): string {
  const colors: Record<string, string> = {
    blue: '#6c8cff',
    gold: '#d4a853',
    orange: '#e8953a',
    green: '#4caf6a',
    red: '#d9534f',
  };
  return colors[color] || '#6c8cff';
}

const CSS_VARIABLES = `
  :root {
    --dark: #121520;
    --darker: #0d0f18;
    --card: #1a1e30;
    --border: #262b42;
    --accent: #6c8cff;
    --accent-dim: #4a64cc;
    --gold: #d4a853;
    --green: #4caf6a;
    --orange: #e8953a;
    --red: #d9534f;
    --purple: #a374db;
    --teal: #4db6ac;
    --text: #d8dce8;
    --dim: #6e7794;
    --bright: #f0f2ff;
    --radius: 8px;
    --font: 'Segoe UI', system-ui, -apple-system, sans-serif;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`;

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    fontFamily: 'var(--font)',
    background: 'var(--darker)',
    color: 'var(--text)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  topbar: {
    background: 'var(--dark)',
    borderBottom: '1px solid var(--border)',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '48px',
  },
  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--gold)',
    letterSpacing: '0.4px',
    margin: 0,
  },
  titleSub: {
    color: 'var(--dim)',
    fontWeight: '400',
    fontSize: '13px',
    marginLeft: '6px',
  },
  topbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  pillar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 12px',
    borderRadius: '16px',
    fontSize: '11px',
    background: 'rgba(108,140,255,.12)',
    border: '1px solid rgba(108,140,255,.25)',
    color: 'var(--accent)',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  dateLabel: {
    fontSize: '11px',
    color: 'var(--dim)',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr 320px',
    flex: 1,
    overflow: 'hidden',
  },
  leftPanel: {
    background: 'var(--dark)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  section: {
    padding: '14px',
    borderBottom: '1px solid var(--border)',
  },
  sectionTitle: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1.1px',
    color: 'var(--dim)',
    marginBottom: '10px',
  },
  contact: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '10px',
    marginBottom: '6px',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  contactRole: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
    color: 'var(--accent)',
    marginBottom: '3px',
  },
  contactName: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--bright)',
  },
  contactEmail: {
    fontSize: '11px',
    color: 'var(--dim)',
    wordBreak: 'break-all',
  },
  editBtn: {
    fontSize: '10px',
    color: 'var(--accent)',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    marginTop: '4px',
    textDecoration: 'none',
  },
  editBtn2: {
    flex: 1,
    padding: '4px',
    borderRadius: '5px',
    border: '1px solid var(--border)',
    fontSize: '11px',
    cursor: 'pointer',
    background: 'var(--card)',
    color: 'var(--text)',
  },
  editForm: {
    display: 'block',
    marginTop: '6px',
  },
  editInput: {
    width: '100%',
    padding: '5px 8px',
    marginBottom: '4px',
    background: 'var(--darker)',
    border: '1px solid var(--border)',
    borderRadius: '5px',
    color: 'var(--text)',
    fontSize: '12px',
    outline: 'none',
  },
  editBtns: {
    display: 'flex',
    gap: '4px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '7px 8px',
    borderRadius: '5px',
    fontSize: '12px',
    color: 'var(--text)',
    cursor: 'pointer',
    transition: 'background 0.1s',
    textDecoration: 'none',
  },
  navIcon: {
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '5px',
    background: 'rgba(108,140,255,.1)',
    fontSize: '11px',
    color: 'var(--accent)',
    flexShrink: 0,
  },
  devCard: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '8px',
    marginBottom: '6px',
    fontSize: '11px',
  },
  devCardTitle: {
    fontWeight: '500',
    color: 'var(--bright)',
    marginBottom: '4px',
  },
  devCardStat: {
    fontSize: '10px',
    color: 'var(--dim)',
    display: 'flex',
    justifyContent: 'space-between',
  },
  devProgressBar: {
    width: '100%',
    height: '4px',
    background: 'rgba(255,255,255,.05)',
    borderRadius: '2px',
    marginTop: '4px',
    overflow: 'hidden',
  },
  devProgressFill: {
    height: '100%',
    background: 'var(--accent)',
    borderRadius: '2px',
  },
  centerPanel: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--darker)',
  },
  chatHead: {
    padding: '10px 16px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatHeadLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  chatName: {
    fontWeight: '600',
    fontSize: '14px',
    color: 'var(--bright)',
  },
  chatRole: {
    fontSize: '11px',
    color: 'var(--dim)',
  },
  chatBtns: {
    display: 'flex',
    gap: '6px',
  },
  chatBtn: {
    padding: '5px 12px',
    borderRadius: '5px',
    border: '1px solid var(--border)',
    background: 'var(--card)',
    color: 'var(--text)',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.1s',
  },
  chatMsgs: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  msg: {
    maxWidth: '72%',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    lineHeight: '1.5',
  },
  msgSent: {
    alignSelf: 'flex-end',
    background: 'var(--accent)',
    color: '#fff',
    borderBottomRightRadius: '3px',
  },
  msgRecv: {
    alignSelf: 'flex-start',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderBottomLeftRadius: '3px',
  },
  msgSys: {
    alignSelf: 'center',
    maxWidth: '88%',
    background: 'rgba(212,168,83,.08)',
    border: '1px solid rgba(212,168,83,.2)',
    color: 'var(--gold)',
    fontSize: '12px',
    textAlign: 'center',
    borderRadius: '6px',
    padding: '8px 14px',
  },
  'msg-cat-question': {
    display: 'inline-block',
    fontSize: '9px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '2px 7px',
    borderRadius: '3px',
    marginBottom: '5px',
    background: 'rgba(108,140,255,.15)',
    color: 'var(--accent)',
  },
  'msg-cat-update': {
    display: 'inline-block',
    fontSize: '9px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '2px 7px',
    borderRadius: '3px',
    marginBottom: '5px',
    background: 'rgba(76,175,106,.15)',
    color: 'var(--green)',
  },
  'msg-cat-escalation': {
    display: 'inline-block',
    fontSize: '9px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '2px 7px',
    borderRadius: '3px',
    marginBottom: '5px',
    background: 'rgba(217,83,79,.15)',
    color: 'var(--red)',
  },
  'msg-cat-feedback': {
    display: 'inline-block',
    fontSize: '9px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '2px 7px',
    borderRadius: '3px',
    marginBottom: '5px',
    background: 'rgba(232,149,58,.15)',
    color: 'var(--orange)',
  },
  msgTime: {
    fontSize: '9px',
    color: 'var(--dim)',
    marginTop: '3px',
    textAlign: 'right',
  },
  compose: {
    padding: '12px 16px',
    borderTop: '1px solid var(--border)',
    background: 'var(--dark)',
  },
  composeCats: {
    display: 'flex',
    gap: '6px',
    marginBottom: '6px',
  },
  composeCat: {
    padding: '3px 10px',
    borderRadius: '14px',
    border: '1px solid var(--border)',
    background: 'var(--card)',
    fontSize: '11px',
    color: 'var(--dim)',
    cursor: 'pointer',
    transition: 'all 0.1s',
  },
  composeRow: {
    display: 'flex',
    gap: '8px',
  },
  composeTextarea: {
    flex: 1,
    resize: 'none',
    padding: '10px 14px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text)',
    fontSize: '13px',
    fontFamily: 'var(--font)',
    lineHeight: '1.4',
    outline: 'none',
    minHeight: '48px',
    maxHeight: '140px',
  },
  sendBtn: {
    width: '48px',
    borderRadius: 'var(--radius)',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightPanel: {
    background: 'var(--dark)',
    borderLeft: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  modeBar: {
    padding: '10px 12px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  modeBtn: {
    flex: 1,
    padding: '5px 4px',
    borderRadius: '5px',
    border: '1px solid var(--border)',
    background: 'var(--card)',
    color: 'var(--dim)',
    fontSize: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  opinionFeed: {
    maxHeight: '260px',
    overflowY: 'auto',
    borderBottom: '1px solid var(--border)',
  },
  opinionHeader: {
    padding: '8px 12px',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--dim)',
    background: 'var(--card)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },
  opinionDisclaimer: {
    padding: '6px 12px',
    fontSize: '10px',
    color: 'var(--gold)',
    background: 'rgba(212,168,83,.06)',
    borderBottom: '1px solid rgba(212,168,83,.15)',
  },
  opinionItem: {
    padding: '8px 12px',
    borderBottom: '1px solid rgba(255,255,255,.03)',
    fontSize: '12px',
    lineHeight: '1.45',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  opinionDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '4px',
  },
  opinionText: {
    flex: 1,
  },
  opinionTime: {
    fontSize: '9px',
    color: 'var(--dim)',
    flexShrink: 0,
  },
  gcard: {
    margin: '10px',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px',
  },
  gcardTitle: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
    color: 'var(--dim)',
    marginBottom: '10px',
  },
  proxBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    background: 'rgba(212,168,83,.06)',
    border: '1px solid rgba(212,168,83,.15)',
    borderRadius: '6px',
    marginBottom: '10px',
  },
  proxDotBig: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
  },
  proxLbl: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--gold)',
  },
  proxSub: {
    fontSize: '10px',
    color: 'var(--dim)',
    marginTop: '1px',
  },
  dimRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px',
  },
  dimLbl: {
    fontSize: '10px',
    color: 'var(--dim)',
    width: '88px',
    flexShrink: 0,
  },
  dimTrack: {
    flex: 1,
    height: '6px',
    background: 'rgba(255,255,255,.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  dimFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
  dimVal: {
    fontSize: '10px',
    color: 'var(--text)',
    width: '28px',
    textAlign: 'right',
  },
  agentDevCard: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '10px',
    marginBottom: '6px',
  },
  agentDevHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  agentColor: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  agentName: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--bright)',
  },
  agentAuthority: {
    fontSize: '10px',
    color: 'var(--dim)',
  },
  agentDevPathway: {
    fontSize: '9px',
    color: 'var(--accent)',
    marginTop: '4px',
    fontWeight: '400',
  },
  agentDevStat: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    color: 'var(--dim)',
    marginTop: '3px',
  },
  agentProxBadge: {
    display: 'inline-block',
    padding: '2px 6px',
    background: 'rgba(108,140,255,.1)',
    border: '1px solid rgba(108,140,255,.2)',
    borderRadius: '3px',
    fontSize: '9px',
    color: 'var(--accent)',
    marginBottom: '4px',
  },
  agentProgressBar: {
    width: '100%',
    height: '4px',
    background: 'rgba(255,255,255,.05)',
    borderRadius: '2px',
    marginTop: '3px',
    overflow: 'hidden',
  },
  agentProgressFill: {
    height: '100%',
    background: 'var(--accent)',
    borderRadius: '2px',
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '8px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: 'var(--dim)',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
};
